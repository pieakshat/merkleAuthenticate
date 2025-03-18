use sha2::{Digest, Sha256}
use std::collections::VecDeque; 

pub mod coreFunctions {

#[derive(Debug, Clone)]
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

pub fn build_merkle_tree(data: Vec<String>) -> Node {
    if data.is_empty() {
        panic!("NNo data given to build the tree")
    }

    let mut leaves: Vec<Node> = data
    .iter()
    .map(|d| Node::new(generate_hash(d)))
    .collect()

    while leaves.len() > 1 {
    for i in (0..leaves.len()).step_by(2) {
        let left = leaves[i].clone(); 
        let right = if i + 1 < leaves.len() {
            leaves[i + 1].clone()
        } else {
            left.clone() // duplicate if odd number of leaves
        }; 

        let parent_hash = concat_hash(&left.hash, &right.hash); 
        let mut parent_node: Node = Node::new(parent_hash); 
        parent_node.left = Some(Box::new(left)); 
        parent_node.right = Some(Box::new(right));
        next_level.push(parent_node);  
    } 
    leaves = next_level; 
    }

    leaves[0].clone()
}

pub fn generate_proof(root: &Node, target_hash: &str) -> Vec<(String, String)> {
    let mut proof = Vec::new(); 
    let mut queue = VecDeque::new(); 
    queue.push_back(root.clone(), Vec::new()); 

    while let Some((node, mut path)) = queue.pop_front() {
        if node.hash == target_hash {
            proof = path; 
            break; 
        }

        if let Some(ref left) = node.left {
            let mut left_path = path.clone();
            left_path.push((left.hash.clone(), "L".to_string()));
            queue.push_back((**left.clone(), left_path));
        }

        if let Some(ref right) = node.right {
            let mut right_path = path.clone(); 
            right_path.push((right.hash.clone(), "R".to_string()));
            queue.push_back((**right.clone(), right_path));
        }
    } 

    proof 
}

pub fn verifyProof(root_hash: &str, target_hash: &str, proof: Vec<(String, String)>) -> bool {
    let mut current_hash = target_hash.to_string(); 
    for (hash, direction) in proof {
        current_hash = if direction == "L" {
            concat_hash(&hash, &current_hash)
        } else {
            concat_hash(&current_hash, &hash)
        };
    }

    current_hash == root_hash
    }
}

pub fn test() {
    let data = vec![
        "data1".to_string(),
        "data2".to_string(),
        "data3".to_string(),
        "data4".to_string(),
    ];

    // Build the Merkle tree
    let root = build_merkle_tree(data.clone());
    println!("Root hash: {}", root.hash);

    // Generate proof for "data3"
    let target_data = "data3";
    let target_hash = generate_hash(target_data);
    let proof = generate_proof(&root, &target_hash);

    println!("Proof for '{}': {:?}", target_data, proof);

    // Verify the proof
    let is_valid = verify_proof(&root.hash, &target_hash, proof);
    println!(
        "Is '{}' part of the Merkle tree? {}",
        target_data, is_valid
    );
}

