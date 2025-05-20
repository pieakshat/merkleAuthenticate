// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EIP712}  from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA}  from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {console} from "forge-std/console.sol";


contract Verify is Ownable, EIP712 {

    struct Info { address owner; uint256 timestamp; } // struct to hold the document info

    mapping(bytes32 => Info) public docs; // mapiping of document hashes to info of each document  
    mapping(address => uint256) public nonces;       // replay-protection

    event DocumentAccepted(bytes document, address owner);

    constructor() EIP712("DocAnchor", "1") Ownable(msg.sender){}

    bytes32 private constant _TYPE_HASH = keccak256("Anchor(bytes32 root, address owner, uint256 nonce, uint256 deadline)"
    ); 

    function _hash(bytes32 a, bytes32 b) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(a, b)); 
    }


    /// @notice To register a new document 
    /// @dev this function must be called by the backend while the signature must be given by the owner of the contract
    /// @param root The root hash of the document 
    /// @param docOwner address of the document owner 
    /// @param deadline deadline before the signature expires
    /// @param v @param r @param s required for ecdsda signatures
    function anchorWithSig(
        bytes32 root, 
        address docOwner, 
        uint256 deadline, 
        uint8 v, bytes32 r, bytes32 s
        ) external {
        require(block.timestamp <= deadline, "Signature expired");
        // require(docs[root].timestamp == uint256(0), "Document already exists"); 

        uint256 nonce = nonces[docOwner]++; 

        bytes32 structHash = keccak256(abi.encode(
            _TYPE_HASH, 
            root, 
            docOwner, 
            nonce, 
            deadline
        ));

        console.log("verify structHash: ");
        console.logBytes32(structHash);

        bytes32 digest = _hashTypedDataV4(structHash);
        console.log("verify digest: ");
        console.logBytes32(digest);

        address signer = ECDSA.recover(digest, v, r, s);
        require(signer == docOwner, "Invalid signature"); 

        docs[root] = Info({
            owner: docOwner,
            timestamp: block.timestamp
        });
        emit DocumentAccepted(abi.encode(root), docOwner);
    }

    /**
     * @param rootHash      The Merkle root you expect.
     * @param leaf     The hash of the target page for which the proof is generated
     * @param proof     Array of sibling hashes, depth-first from leaf → root.
     * @param isLeft    `true` if the sibling is on the *left* of the current node (i.e. concat = sibling⧺current).
     *                  Must be the same length as `proof`.
     * @return ok       True if the reconstructed root equals `root`.
     */
function verify(
    bytes32 rootHash, 
    bytes32 leaf,
    bytes32[] calldata proof,
    bool[] calldata isLeft
) external returns (bool ok) {
    require(proof.length == isLeft.length, "length mismatch"); 

    bytes32 computed = leaf; 
    unchecked {
        for (uint256 i = 0; i < proof.length; i++) {
            computed = isLeft[i] 
            ? _hash(proof[i], computed)
            : _hash(computed, proof[i]); 
        }
    }
    ok = (computed == rootHash); 
}
}

contract VerifyPublic is Verify {
    function exposedDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    function exposedHashTypedDataV4(bytes32 structHash) external view returns (bytes32) {
        return _hashTypedDataV4(structHash);
    }
}