const web3 = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, mintTo, transfer } = require('@solana/spl-token');
require('dotenv').config();

let url = process.env.MAINNET_NODE || 'https://solana-api.projectserum.com'

// console.log({ url })
if (process.env.NODE_ENV !== 'production') {
    url = web3.clusterApiUrl('devnet')
}
function createConnection() {
    return new web3.Connection(url);
}
const connection = createConnection();

function loadTokenMintWallet() {
    const TMK = new Uint8Array(JSON.parse(process.env.TOKEN_MINT_KEYPAIR))
    const KeyPr = web3.Keypair.fromSecretKey(
        TMK
    )
    // console.log(KeyPr)
    return KeyPr
}

async function sendToken(userWalletString, amount) {

    const phoenixKeypair = await loadTokenMintWallet();

    //* Phoenix public key - fromPublicKey
    const phoenixPublicKey = phoenixKeypair.publicKey
    //* User's public key - toPublicKey
    const userPublicKey = new web3.PublicKey(userWalletString);
    //* Token's public key  
    const tokenPublicKey = new web3.PublicKey(process.env.FIRE_TOKEN);

    console.log({
        tokenPK: tokenPublicKey.toBase58(),
        userPK: userPublicKey.toBase58(),
        phoenixPK: phoenixPublicKey.toBase58(),
    })

    console.log('Getting Phoenix ATA')
    // WORKS FINE, 
    const phoenixATA = await getOrCreateAssociatedTokenAccount(
        connection,
        phoenixKeypair,
        tokenPublicKey,
        phoenixPublicKey
    );
    console.log('Found Phoenix ATA', phoenixATA.address.toBase58()) // Perfect!!

    console.log('Getting User ATA')
    // This is where the console just fucking dies. No errors, no status, no signs of life...
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        phoenixKeypair,
        tokenPublicKey,
        userPublicKey
    );

    console.log(`Transferring ${amount} new token(s) to USER: ${toTokenAccount.address.toBase58()}`)
    signature = await transfer(
        connection,
        phoenixKeypair,
        phoenixATA.address,
        toTokenAccount.address,
        phoenixPublicKey,
        amount * web3.LAMPORTS_PER_SOL
    );

    return signature;
}

module.exports = { sendToken }