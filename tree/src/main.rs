// ------ crate structure ------
mod db {                 // src/db/mongo.rs
    pub mod mongo;
}
mod handlers; 
mod merkle;
mod utils;

use actix_web::{web, App, HttpServer, Responder, get, HttpResponse};
use dotenvy::dotenv;
use mongodb::bson::doc;
use std::env;

// ────────────────────────────────────────────
// Basic index route
async fn index() -> impl Responder {
    "OK"
}

async fn db_check(db: web::Data<mongodb::Database>) -> impl Responder {
    match db.run_command(doc! { "ping": 1 }, None).await {
        Ok(_)  => HttpResponse::Ok().body("MongoDB connection: OK"),
        Err(e) => {
            eprintln!("Mongo ping failed: {e}");
            HttpResponse::InternalServerError().body("MongoDB connection FAILED")
        }
    }
}


#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok(); // read .env

    let host = env::var("HOST").unwrap_or_else(|_| "127.0.0.1".into());
    let port: u16 = env::var("PORT")
        .unwrap_or_else(|_| "8080".into())
        .parse()
        .expect("PORT must be a number");

    // connect to Mongo (your db::mongo::init())
    let db = db::mongo::init()
        .await
        .expect("Could not connect to MongoDB");

    // optional ping
    db.run_command(doc! { "ping": 1 }, None)
        .await
        .expect("MongoDB ping failed");

    println!("Connected to MongoDB");
    println!("Server running on http://{host}:{port}");

    // launch Actix
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(db.clone()))
            .configure(handlers::documents::register)         // POST /documents
            .route("/",       web::get().to(index))           // GET /
            .route("/db-check", web::get().to(db_check))      // GET /db-check
    })
    .bind((host.as_str(), port))?
    .run()
    .await
}