mod db {
    pub mod mongo;
}
mod handlers;
mod merkle;
mod utils;

use actix_cors::Cors;
use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use dotenvy::dotenv;
use mongodb::bson::doc;
use std::env;

async fn index() -> impl Responder {
    "OK"
}

async fn db_check(db: web::Data<mongodb::Database>) -> impl Responder {
    match db.run_command(doc! { "ping": 1 }, None).await {
        Ok(_) => HttpResponse::Ok().body("MongoDB connection: OK"),
        Err(e) => {
            eprintln!("Mongo ping failed: {e}");
            HttpResponse::InternalServerError().body("MongoDB connection FAILED")
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    let host = env::var("HOST").unwrap_or_else(|_| "127.0.0.1".into());
    let port: u16 = env::var("PORT")
        .unwrap_or_else(|_| "8080".into())
        .parse()
        .expect("PORT must be a number");

    let db = db::mongo::init()
        .await
        .expect("Could not connect to MongoDB");

    db.run_command(doc! { "ping": 1 }, None)
        .await
        .expect("MongoDB ping failed");

    println!("Connected to MongoDB");
    println!("Server running on http://{host}:{port}");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .app_data(web::Data::new(db.clone()))
            .configure(handlers::documents::register)
            .configure(handlers::proof::register)
            .configure(handlers::verify::register)
            .route("/", web::get().to(index))
            .route("/db-check", web::get().to(db_check))
    })
    .bind((host.as_str(), port))?
    .run()
    .await
}
