import {
    useAccount,
    useReadContract,
    useSignTypedData,
} from 'wagmi';
import { parseSignature } from 'viem';          // splits sig → { r,s,v } :contentReference[oaicite:1]{index=1}
import VerifyAbi from '@/abis/verify.json';     // generate w/ `forge inspect --abi`
import { VERIFY_ADDRESS } from '@/config/addresses';


export const useAnchorDocument = () => {
    const { chain, address } = useAccount();

    // 
    const { data } = useReadContract({
        abi: VerifyAbi,
        address: VERIFY_ADDRESS,
        functionName: 'nonces',
        args: [address ?? '0x'],
        // enabled: !!address, 
    });

    // if (data == undefined) throw new Error("Nonce not loaded");
    const nonce: bigint = data;
    const { signTypedDataAsync } = useSignTypedData();

    const anchor = async (rootHash: `0x${string}`) => {
        console.log("heyy");
        if (!address) throw new Error('wallet not connected');
        // if (nonce == undefined) throw new Error('nonce not loaded');


        const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);
        console.log("sending signature")
        const signature = await signTypedDataAsync({
            primaryType: 'Anchor',
            domain: {
                name: 'DocAnchor',
                version: '1',
                chainId: chain?.id!,
                verifyingContract: VERIFY_ADDRESS,
            },
            types: {
                Anchor: [
                    { name: 'root', type: 'bytes32' },
                    { name: 'owner', type: 'address' },
                    { name: 'nonce', type: 'uint256' },
                    { name: 'deadline', type: 'uint256' },
                ],
            } as const,
            message: {
                root: rootHash,
                owner: address,
                nonce,
                deadline,
            },
        });

        const { v, r, s } = parseSignature(signature);
        console.log("got signature")
        // send this data to backend 
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/documents/anchor`, {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify({
                root: rootHash,
                owner: address,
                nonce: nonce?.toString(),
                deadline: deadline.toString(),
                v, r, s,
            }),
        });
    }

    return { anchor };
}