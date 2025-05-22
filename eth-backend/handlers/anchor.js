import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
console.log(process.env.PRIVATE_KEY);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const verifyAbi = (await import('../abis/verify.json', { assert: { type: 'json' } })).default;
const verify = new ethers.Contract(process.env.VERIFY_ADDRESS, verifyAbi, signer);

export const anchorDocument = async (req, res) => {
    console.log('Received request to anchor document');
    console.log('Calling contract from backend: ', process.env.VERIFY_ADDRESS);
    let { root, owner, deadline, v, r, s } = req.body;
    console.log({ root, owner, deadline, v, r, s });

    deadline = BigInt(deadline);
    try {
        console.log("Sending transaction");
        const tx = await verify.anchorWithSig(root, owner, deadline, Number(v), r, s);
        console.log("Transaction sent: ", tx.hash);
        const receipt = await tx.wait();
        console.log(`✓ Mined in block ${receipt.blockNumber}`);
        res.json({ tx: tx.hash });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to anchor document' });
    }
}

