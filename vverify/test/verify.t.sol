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

        (address owner) = verify.docs(root);
        assertEq(owner, user, "owner should be the signing user");

        /* nonce should be incremented */
        assertEq(verify.nonces(user), nonce + 1, "nonce not incremented");
    }

    function testVerificationFunction() external {
        // anchoring the doc first 

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
    }
}