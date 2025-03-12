use sha2::{Digest, Sha256}

pub mod coreFunctions {

struct Node {
    hash: String, 
    left: Option<Box<Node>>, 
    right: Option<Box<Node>>, 
}
// rust enforces a rule that all the data structures must have a known size at compile time
/* box is used to allocate memory to heap 
Since we cannot know the size of the tree initially we allocate the data to heap using Box<T> 
Box<T> is a smart pointer that allocates memory on the heap and stores a pointer to the value.
*/

impl Node {
    fn new(hash: String) -> Node {
        Node {
            hash, 
            left: None,
            right: None, 
        }
    }

    fn add_left_node(&mut self, node: Node) {
        if self.left.is_some() {
            panic!("Left node already exists"); 
        }
        self.left = Some(Box::new(node)); 
    }

    fn add_right_node(&mut self, node: Node) {
        if self.right.is_some() {
            panic!("Right node already exists"); 
        }
        self.right = Some(Box::new(node)); 
    }
}

fn generate_hash<T: AsRef<[u8]>>(input: T) -> String {
    let mut hasher = Sha256::new(); 
    hasher.update(input); 
    let result = hasher.finalize(); 
    format!("{:x}", result)
}

fn concat_hash(left: &str, right: &str) -> String {
    let hasher = Sha256::new(); 
    hasher.update(left); 
    hasher.update(right); 
    let result = hasher.finalize(); 
    format("{:x}", result) 
}

fn take_input() -> String {
    let mut input = String::new(); 
    std::io::stdin()
        .read_line(&mut input)
        .expect("Failed to read the input"); 
        input.trim().to_string()
}

}