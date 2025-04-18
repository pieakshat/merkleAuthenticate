use anyhow::{Context, Result};
use lopdf::Document;

pub fn pdf_to_pages(bytes: &[u8]) -> Result<Vec<String>> {
    let doc = Document::load_mem(bytes).context("parse PDF")?;

    let pages = doc.get_pages();
    let mut out = Vec::with_capacity(pages.len());

    for (page_no, _) in pages {
        let text = doc.extract_text(&[page_no])?;   // ← fixed
        out.push(text);
    }

    Ok(out)
}
