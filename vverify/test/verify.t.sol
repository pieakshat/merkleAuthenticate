// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import "forge-std/console.sol";
import {Verify, VerifyPublic} from "../src/Verify.sol";
import {Test} from "forge-std/Test.sol";

contract TestDocument is Test {
    VerifyPublic verify; 

    uint256 private constant USER_PK    = uint256(keccak256("user_pk"));
    uint256 private constant BACKEND_PK = uint256(keccak256("backend_pk"));

    address private user = vm.addr(USER_PK);
    address private backend = vm.addr(BACKEND_PK);


    bytes32 private constant EIP712_DOMAIN_TYPEHASH =
    keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    bytes32 private constant ANCHOR_TYPEHASH =
    keccak256("Anchor(bytes32 root, address owner, uint256 nonce, uint256 deadline)");


    function setUp() public {
        verify = new VerifyPublic(); 
        vm.label(user,    "User");
        vm.label(backend, "Backend");
    }

    function testAnchor() external {

        bytes32 root = keccak256("myDocRoot"); 
        uint256 deadline = block.timestamp + 1 hours; 
        uint256 nonce = verify.nonces(user); 

        // bytes32 domainSeparator = verify.exposedDomainSeparator();

        bytes32 structHash = keccak256(
            abi.encode(
                ANCHOR_TYPEHASH,
                root,
                user,
                nonce,
                deadline
            )
        );
        console.log("structHash: ");
        console.logBytes32(structHash);

        bytes32 digest = verify.exposedHashTypedDataV4(structHash);
        console.log("digest: ");
        console.logBytes32(digest);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(USER_PK, digest); 

        vm.prank(backend); 
        verify.anchorWithSig(
            root,
            user,
            deadline,
            v, r, s
        );

        (address owner, uint256 timestamp) = verify.docs(root);
        assertEq(owner, user, "owner should be the signing user");

        /* nonce should be incremented */
        assertEq(verify.nonces(user), nonce + 1, "nonce not incremented");
    }

    function testVerificationFunction() external {
        // anchoring the doc first 

        bytes32 root = hex"0de519f6c4963b0fd4180f5b06166b7fa80385d62078271fb5f56cecade01d58"; // actual rootHash of a document 
        bytes32 leaf = hex"3298e6953e054f53f8550d2aaa605daf8cc74233cae089a7147e39e9fcd0251d"; // hash of the page to be verified
        uint256 deadline = block.timestamp + 1 hours; 
        uint256 nonce = verify.nonces(user); 

        // bytes32 domainSeparator = verify.exposedDomainSeparator();

        bytes32 structHash = keccak256(
            abi.encode(
                ANCHOR_TYPEHASH,
                root,
                user,
                nonce,
                deadline
            )
        );

        bytes32 digest = verify.exposedHashTypedDataV4(structHash);
        console.log("digest: ");
        console.logBytes32(digest);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(USER_PK, digest); 

        vm.prank(backend); 
        verify.anchorWithSig(   // document is anchored
            root,
            user,
            deadline,
            v, r, s
        );
        vm.stopPrank();
        // document is anchored now 

        bytes32[] memory proof = new bytes32[](3);
        bool[] memory isLeft = new bool[](3);


        // preparing the merkle data for proof verification 
        proof[0] = hex"81be84384d2fb7d1807f18befe971feb62a93e8e40d41c8f13482b3765c58110";
        isLeft[0] = true;

        proof[1] = hex"6534e41f3385290ae9ecffda95c47169029a1d77267ee16a4f4f3798171893f1";
        isLeft[1] = false;

        proof[2] = hex"5c4185cb85f50c9a496d2e43b32ae1ef99563cf13bba663650b9644a5b0f2f7b";
        isLeft[2] = false;

        proof[3] = hex"dfbd3165b0f71936321f13cf4fefe014a8227b19a543089e457afcecc1e5a673";
        isLeft[3] = false;

        bool ok = verify.verify(root, leaf, proof, isLeft);
        assertTrue(ok, "Merkle proof verification failed");


    }
}