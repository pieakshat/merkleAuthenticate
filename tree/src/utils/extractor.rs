
pub fn pdf_to_pages(bytes: &[u8]) -> anyhow::Result<Vec<String>> {
    let text = String::from_utf8_lossy(bytes).to_string();
    Ok(vec![text])  
}