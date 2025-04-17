use mongodb::Database; 
use anyhow::Result; 

pub async fn init_db() -> anyhow::Result<Database> {
    crate::db::mongo::init().await
}