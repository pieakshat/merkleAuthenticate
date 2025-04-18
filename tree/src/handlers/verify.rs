use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct VerifyRequest {
    root_hash: String,
    page_hash: String,
    proof:     Vec<(String, String)>,
}

#[derive(Serialize)]
pub struct VerifyResponse {
    valid: bool,
}

pub fn register(cfg: &mut web::ServiceConfig) {
    cfg.route("/verify", web::post().to(verify_route));
}

async fn verify_route(payload: web::Json<VerifyRequest>) -> impl Responder {
    // move out of the wrapper → VerifyRequest
    let req = payload.into_inner();

    println!("root: {:?}", req.root_hash); 
    println!("page: {:?}", req.page_hash); 
    println!("proof: {:?}", req.proof); 

    let ok = crate::merkle::coreFunctions::verify_proof(
        &req.root_hash,
        &req.page_hash,
        req.proof,
    );

    HttpResponse::Ok().json(VerifyResponse { valid: ok })
}
