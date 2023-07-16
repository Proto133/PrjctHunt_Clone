import * as web3 from '@solana/web3.js'
import {
    resolveToWalletAddress,
    getParsedNftAccountsByOwner,
} from "@nfteyez/sol-rayz";
import store, { NFT_META } from '@/store';
import { computed } from 'vue'
import { requestOptions, server } from './helpers';
import { wallet } from '@/utils/initWallet'
import { sign } from 'tweetnacl';


const { publicKey, signMessage } = wallet;

const connected = computed(() => store.state.connected)
const { Connection, clusterApiUrl } = web3

let url = process.env.MAINNET_NODE || 'https://solana-api.projectserum.com'
if (process.env.NODE_ENV !== 'production') {
    url = clusterApiUrl('devnet')
}
function createConnection() {
    return new Connection(url);
}

export const connection = createConnection();

// TODO: Replace with a method that doesn't return all the NFTs created by a fellowship mint... :'(

const Founder_ID = '3xoPUgFxZoShtvjmaibnkqVejpYLh281CkPPnhstcde1' //DevNet Address
const Member_ID = '4RKsdvjsoskEw59NenbDdts9kAbpFivkc6fsED6th5kL' //DevNet Address
const Saved_ID = 'Fe77Txknt6mLx52wNq58TJ9Arwe6oEyDHUAaG7c1xo5' //DevNet Address
const Affiliate_IDs = [
    // ZERO_EVO
    'BgRAiwJrX12pUVyxXRYZ7RBSjxD6jYTfHdd8Ar9PJYbr',
    // DEVNET Phoenix_Founders
    '4Tow5Bw8cXrJimogiZX4VicYH91C12B6tMfDuu3RprXZ',

    //BABIENS
    "2nEJHqfeippAMSoDxYvfBTCE8UCu1iui4q1JSJfz4aSB",
    // CryptoPets
    "4d4fKsKLv12jgYXqvFnafoC9nLif7PEN9DxaCnbbVKWX",
    "DWXewwpHU8kn78sw6zipLtV3qwvKUZeoVczwDhacBczp",
    "GQJ7QCKqBszpdbNAPNGxxZarXaUs6Sity39QBrNCXsTU",
    // A GAME OF DRAGONS
    "EcAUYL8ra6XoqiE7Sb6DQVNQd7divSY2BsjABU385qoY",
    // Infungibles
    "5ymJGvHDdg8xUC6uNVgjAzoQP3aJvnibWwjUoRXFbh88"
]
const phoenix_Collections = ['Babiens', 'CryptoPets', 'Infungibles', 'Zero Evo Remnant']
const phoenix_IDs = [...Affiliate_IDs, Founder_ID, Member_ID, Saved_ID]

export async function verifyNFT(pubkey: web3.PublicKey) {
    try {
        // `publicKey` will be null if the wallet isn't connected
        if (!publicKey) throw new Error('Wallet not connected!');
        // `signMessage` will be undefined if the wallet doesn't support it
        if (!signMessage) throw new Error('Wallet does not support message signing!');
        // Encode anything as bytes
        const message = new TextEncoder().encode(`Sign this so PrjctHunt knows that this\nwallet is actually yours \n\n\n . . . please.`);
        // Sign the bytes using the wallet
        // @ts-ignore: Object is possibly 'undefined'
        const signature = await signMessage.value(message);

        // Verify that the bytes were signed using the private key that matches the known public key
        // @ts-ignore: Object is possibly 'null'
        if (!sign.detached.verify(message, signature, publicKey.value.toBytes())) throw new Error('Invalid signature!');
        console.log("success")
        // notify({ type: 'success', message: 'Sign message successful!', txid: bs58.encode(signature) });
        // console.log('Verifying NFTs')
        // Convert Pubkey _bn into base58 string for future use.
        const publicAddress = await resolveToWalletAddress({
            text: pubkey.toBase58(), connection: connection
        });

        // Return Array of NFT's owned by Connected Wallet
        const nftArray = await getParsedNftAccountsByOwner({
            publicAddress,
            connection: connection
        });

        console.log(phoenix_Collections)
        // console.dir(nftArray)
        const userTokens: string[] = []
        const ownedNFTs: NFT_META[] = []
        nftArray.forEach(nft => {
            if (nft.data.creators) {
                console.log(nft.data.creators[0].address)
                if (phoenix_IDs.includes(nft.data?.creators[0].address)) {
                    ownedNFTs.push({ ...nft, creator_id: nft.data.creators[0].address })
                    userTokens.push(nft.mint)
                }
            }

        })

        if (ownedNFTs.length > 0) {
            // console.clear()
            // console.log({ VerifyNFTData: userTokens })

            await fetch(`${server()}user/setTokens`, requestOptions(userTokens))
            if (connected.value) {
                await store.dispatch('updateNFTMeta', ownedNFTs)
                await store.commit('setHolder', true)
            }

        }
        return true;

    } catch (error) {
        // notify({ type: 'error', message: `Sign Message failed!`, description: error?.message });
        // @ts-ignore: Object is type 'unknown'
        console.log('error', `Sign Message failed! ${error?.message}`);
    }
}