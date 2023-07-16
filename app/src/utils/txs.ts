import * as web3 from '@solana/web3.js'
import { wallet } from '@/utils/initWallet'
import { sign } from 'tweetnacl'

const { signMessage } = wallet

let url = process.env.MAINNET_NODE || 'https://solana-api.projectserum.com'

console.log({ url })
if (process.env.NODE_ENV !== 'production') {
    url = web3.clusterApiUrl('devnet')
}
function createConnection() {
    return new web3.Connection(url);
}

export const connection = createConnection();

// TODO ADD Wallet Verification Signature to use with loginByWallet feature.


export async function sponsorProject(pKey: web3.PublicKey | null, amount: number) {
    if (!pKey) return { error: 'No public key provided, did you connect your wallet?' }

    const PhoenixWallet = new web3.PublicKey('E9NxULjZAxU4j1NYkDRN2YVpmixoyLX3fd1SsWRooPLB')
    try {
        const latestBlockHash = await connection.getLatestBlockhash();
        const { blockhash, lastValidBlockHeight } = latestBlockHash

        const transaction = new web3.Transaction().add(
            web3.SystemProgram.transfer({
                fromPubkey: pKey,
                toPubkey: PhoenixWallet,
                lamports: amount * web3.LAMPORTS_PER_SOL,
            }))
        const sig = await wallet.sendTransaction(transaction, connection)
        console.log({ sig })
        console.log({ latestBlockHash })
        const confirmation = await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed');
        console.dir(confirmation)
        if (!confirmation.value.err) {
            console.log(`Successfully validated signature \n \n ${sig}`)
            return { success: true, sig: sig, message: `Successfully sponsored the project for ${amount} SOL` }
        }
        console.log(confirmation.value.err)
        return { success: false, error: confirmation.value.err };
    } catch (err) {
        console.dir(err)
        return { success: false, error: err };

    }
}

export async function verifyWallet(pKey: web3.PublicKey | string | undefined | null) {
    if (!pKey || typeof pKey === "string") return false;
    try {
        // `publicKey` will be null if the wallet isn't connected
        if (!pKey) throw new Error('Wallet not connected!');
        // `signMessage` will be undefined if the wallet doesn't support it
        if (!signMessage) throw new Error('Wallet does not support message signing!');
        // Encode anything as bytes
        const message = new TextEncoder().encode(`Sign this so PrjctHunt knows that this\nwallet is actually yours \n\n\n . . . please.`);
        // Sign the bytes using the wallet
        // @ts-ignore: Object is possibly 'undefined'
        const signature = await signMessage.value(message);

        // Verify that the bytes were signed using the private key that matches the known public key
        // @ts-ignore: Object is possibly 'null'
        if (!sign.detached.verify(message, signature, pKey.toBytes())) throw new Error('Invalid signature!');
        console.log("success")
        return true
    } catch (err) {
        console.dir(err)
        return false

    }
}
