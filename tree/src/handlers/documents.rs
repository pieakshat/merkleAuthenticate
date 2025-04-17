use actix_multipart::Multipart;
use actix_web::{web, HttpResponse, Responder};
use futures_util::StreamExt;
use mongodb::{bson::doc, Database};
use uuid::Uuid;
use crate::merkle::coreFunctions::generate_hash;
use crate::merkle::coreFunctions::build_merkle_tree;

pub fn register(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::resource("/documents")
            .route(web::post().to(upload_document)),
    );
}

async fn upload_document(
    mut payload: Multipart,
    db: web::Data<Database>,
) -> impl Responder {
    // 1) read multipart into bytes & keep original filename
    let mut bytes = web::BytesMut::new();
    let mut filename = "upload.bin".to_owned();

    while let Some(item) = payload.next().await {
        let mut field = match item {
            Ok(f) => f,
            Err(e) => return HttpResponse::BadRequest().body(format!("multipart error: {e}")),
        };

        if let Some(fname) = field.content_disposition().get_filename() {
            filename = fname.to_owned();
        }

        while let Some(chunk) = field.next().await {
            match chunk {
                Ok(data) => bytes.extend_from_slice(&data),
                Err(e) => return HttpResponse::BadRequest().body(format!("stream error: {e}")),
            }
        }
    }

    // 2) extract pages
    let pages = match crate::utils::extractor::pdf_to_pages(&bytes) {
        Ok(p)  => p,
        Err(e) => return HttpResponse::BadRequest().body(format!("extract error: {e}")),
    };
    if pages.is_empty() {
        return HttpResponse::BadRequest().body("no text extracted");
    }

    // 3) hash each page, build Merkle root
    let page_hashes: Vec<String> = pages
        .iter()
        .map(|txt| generate_hash(txt))
        .collect();

        let root = build_merkle_tree(page_hashes.clone());

    // 4) write to Mongo  (documents & pages collections)
    let docs_coll  = db.collection("documents");
    let pages_coll = db.collection("pages");

    // let doc_id = Uuid::new_v4();            // human‑readable UUID for response
    // let mongo_id = mongodb::bson::Uuid::from_uuid(doc_id); // BSON binary subtype 4

    let doc_id = Uuid::new_v4();
    let doc_id_str = doc_id.to_string(); 

    if let Err(e) = docs_coll.insert_one(
        doc! {
            "_id":        &doc_id_str,   // store as string
            "filename":   filename,
            "root_hash":  &root.hash,
            "n_pages":    pages.len() as i32,
            "created_at": bson::DateTime::now(),
        },
        None,
    ).await {
        eprintln!("insert document error: {e}");
        return HttpResponse::InternalServerError().body("db error");
    }

    // bulk insert page hashes
    let page_docs: Vec<_> = page_hashes
    .iter()
    .enumerate()
    .map(|(idx, h)| {
        doc! {
            "document_id": &doc_id_str,
            "page_index":  idx as i32,
            "page_hash":   h
        }
    })
    .collect();
    if let Err(e) = pages_coll.insert_many(page_docs, None).await {
        eprintln!("insert pages error: {e}");
        return HttpResponse::InternalServerError().body("db error");
    }

    // 5) respond
    HttpResponse::Ok().json(serde_json::json!({
        "document_id": doc_id.to_string(),
        "root_hash":   root.hash,
        "n_pages":     pages.len()
    }))
}
