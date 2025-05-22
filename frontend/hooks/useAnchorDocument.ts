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
    // console.log("signing message on contract: ", VERIFY_ADDRESS);
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
        if (!address) throw new Error('wallet not connected');
        // if (nonce == undefined) throw new Error('nonce not loaded');
        console.log("nonce: ", nonce.toString());
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);
        console.log("deadline: ", deadline.toString());
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
        console.log("signature: ", signature);
        const { v, r, s } = parseSignature(signature);
        console.log("signature parsed: ", { v, r, s });
        // send this data to backend 
        const payload = {
            root: rootHash,
            owner: address,
            deadline: deadline.toString(),   // string OK
            v: Number(v),                   // 27 or 28
            r,
            s,
        };


        await fetch('http://localhost:8081/anchor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
            .then(async (res) => {
                if (!res.ok) throw new Error(await res.text());
                return res.json();
            })
            .then((json) => console.log('✅ anchored tx', json.tx))
            .catch((err) => {
                console.error('Anchor failed:', err);
            });
    }

    return { anchor };
}