use actix_web::{web, HttpResponse, Responder};
use futures_util::StreamExt;                       // brings `next()`
use mongodb::{bson::{doc, Document}, Database};
use serde::Serialize;

#[derive(Serialize)]
struct ProofResponse {
    page_hash:  String,             // single‑hash of page text (for client)
    root_hash:  String,
    proof:      Vec<(String, String)>,
    page_index: usize,
}

pub fn register(cfg: &mut web::ServiceConfig) {
    cfg.route(
        "/documents/{id}/proof/{page}",
        web::get().to(generate_proof_route),
    );
}

async fn generate_proof_route(
    path: web::Path<(String, usize)>,
    db:   web::Data<Database>,
) -> impl Responder {
    let (doc_id, page_idx) = path.into_inner();

    // ─── 1. fetch metadata ────────────────────────────────────────────────
    let docs_coll = db.collection::<Document>("documents");
    let doc_meta = match docs_coll
        .find_one(doc! { "_id": &doc_id }, None)
        .await
        .unwrap()
    {
        Some(d) => d,
        None    => return HttpResponse::NotFound().body("document not found"),
    };

    let root_hash = doc_meta.get_str("root_hash").unwrap_or_default().to_owned();
    let n_pages   = doc_meta.get_i32("n_pages").unwrap_or(0);
    if page_idx as i32 >= n_pages {
        return HttpResponse::BadRequest()
            .body(format!("page index out of range (0‥{})", n_pages - 1));
    }

    // ─── 2. load page hashes in order ─────────────────────────────────────
    let pages_coll = db.collection::<Document>("pages");
    let mut cursor = pages_coll
        .find(doc! { "document_id": &doc_id }, None)
        .await
        .unwrap();

    let mut page_hashes = vec![String::new(); n_pages as usize];
    let mut target_single = String::new();           // single‑hash leaf

    while let Some(Ok(p)) = cursor.next().await {
        let idx = p.get_i32("page_index").unwrap() as usize;
        let h   = p.get_str("page_hash").unwrap().to_owned();
        page_hashes[idx] = h.clone();
        if idx == page_idx {
            target_single = h;
        }
    }

    // ─── 3. rebuild the *double‑hashed* tree (same as upload) ─────────────
    let root_node =
        crate::merkle::coreFunctions::build_merkle_tree(page_hashes.clone());

    // tree leaves are hash(page_hash) → compute that for the target
    let target_double =
        crate::merkle::coreFunctions::generate_hash(&page_hashes[page_idx]);

    let mut proof =
        crate::merkle::coreFunctions::generate_proof(&root_node, &target_double);

    proof.reverse();        // bottom up for the verifier 

    // ─── 4. respond ───────────────────────────────────────────────────────
    HttpResponse::Ok().json(ProofResponse {
        page_hash: target_single,   
        root_hash,
        proof,
        page_index: page_idx,
    })
}
