use mongodb::{Client, Database, options::ClientOptions}; 
use anyhow::Result; 
use std::env; 

pub async fn init() -> anyhow::Result<Database> {
    let uri = env::var("MONGODB_URI")?; 
    let db_name = env::var("MONGODB_NAME")?; 

    let mut opts = ClientOptions::parse(&uri).await?; 

    opts.app_name = Some("MerkleBackend".into()); 

    let client = Client::with_options(opts)?; 
    Ok(client.database(&db_name))
}