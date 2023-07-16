import { createStore } from 'vuex'
import { ref, Ref } from 'vue'
import Auth from '@/utils/auth'
const Founder_ID = '3xoPUgFxZoShtvjmaibnkqVejpYLh281CkPPnhstcde1' //DevNet Address
const Member_ID = '4RKsdvjsoskEw59NenbDdts9kAbpFivkc6fsED6th5kL' //DevNet Address
const Saved_ID = '2nEJHqfeippAMSoDxYvfBTCE8UCu1iui4q1JSJfz4aSB' //DevNet Address
const Affiliate_IDs = [
  // ZERO_EVO
  'BgRAiwJrX12pUVyxXRYZ7RBSjxD6jYTfHdd8Ar9PJYbr',
  // //BABIENS
  // "2nEJHqfeippAMSoDxYvfBTCE8UCu1iui4q1JSJfz4aSB",
  // CryptoPets
  "4d4fKsKLv12jgYXqvFnafoC9nLif7PEN9DxaCnbbVKWX",
  "DWXewwpHU8kn78sw6zipLtV3qwvKUZeoVczwDhacBczp",
  "GQJ7QCKqBszpdbNAPNGxxZarXaUs6Sity39QBrNCXsTU",
  // A GAME OF DRAGONS
  "EcAUYL8ra6XoqiE7Sb6DQVNQd7divSY2BsjABU385qoY",
  // Infungibles
  "5ymJGvHDdg8xUC6uNVgjAzoQP3aJvnibWwjUoRXFbh88"
]


const emptyState = {
  connected: false,
  user: {
    username: '',
    id: '',
    wallet: '',
    authLevel: '',
    tokens: null,
    holder: false,
  },
  actingAs: {
    token_id: '',
    img_src: '',
    token_name: '',
    gov_weight: 0,
    gov_type: ''
  }
}

type Collection = {
  name: string;
  family: string;
}

export interface NFT_META {
  key: number;
  mint: string;
  image?: string;
  symbol?: string;
  name?: string;
  creator_id?: string;
  updateAuthority: string;
  collection?: Collection;
  description?: string;
  external_url?: string;
  gov_weight?: number;
  gov_type?: string;

}

export type ACTING_AS = Token
export interface Token {
  token_id: string;
  img_src: string;
  token_name: string;
  gov_weight: number;
  gov_type: string;
}
export interface USER {
  username: string;
  id: string;
  wallet: string | null;
  authLevel: string;
  tokens: NFT_META[];
  holder: boolean;
  bio?: string;
  avatar?: string;
  twitter?: string;
  discord?: string;
  discordID?: string;
  email?: string;
  website?: string;

}

export interface State {
  connected: boolean;
  user: USER;
  ActingAs: Token;
}


type Creator =
  { address: string }

export default createStore({
  state: {
    connected: false,
    user: {
      username: '',
      id: '',
      authLevel: '',
      tokens: <any>[],
      wallet: '',
      holder: false
    },
    actingAs: {
      token_id: '',
      img_src: '',
      token_name: '',
      gov_type: '',
      gov_weight: 0
    },
  },
  getters: {
  },
  mutations: {
    setConnected(state, status) {
      state.connected = status;
    },
    setUsername(state, username: string) {
      state.user.username = username
    },
    setWallet(state, wallet: string) {
      state.user.wallet = wallet
    },
    setActingAs(state, info: Token) {
      // state.user.authLevel = 'Holder'
      state.actingAs = { ...info }
    },
    setAuthLevel(state, lvl) {
      state.user.authLevel = lvl
    },
    setHolder(state, holder) {
      state.user.holder = holder
    }
  },
  actions: {
    login(context, info) {
      // console.log({ info })
      context.state.user.username = info.username
      if (info.wallet) {
        context.state.user.wallet = info.wallet
      }
      context.state.user.id = info.id
      context.state.connected = true
    },
    signout(context) {
      context.state.user = { ...emptyState.user }
      context.state.actingAs = { ...emptyState.actingAs }
      context.state.connected = false
      Auth.logout()
    },
    updateNFTMeta(context, nfts) {
      if (nfts.length === 0) {
        context.state.user.tokens = []
      }
      const nftMeta: Ref<NFT_META[]> = ref([])
      let counter = 0
      const limit = nfts?.length - 1
      nfts.forEach(async (nft: {
        data: {
          creators: Creator[],
          uri: string;
        }; updateAuthority: string; mint: string; key: number
      }) => {
        const res = await fetch(nft.data.uri)
        const data = await res.json()
        let update = { ...data, ['mint']: nft.mint, ['key']: nft.key }
        if (nft.data.creators) {
          console.log(nft.data.creators)
          update = { ...update, ['creator_id']: nft.data.creators[0].address }
        }

        await sortAssets(update)

      })

      function sortAssets(update: NFT_META) {
        let gov_type: string
        let gov_weight: number
        if (counter < limit) {
          counter++
        }
        console.dir({ update })
        // const last = counter == limit
        const { creator_id } = update

        switch (creator_id) {
          case Founder_ID: // DevNet Founder ID
            gov_type = 'Founder';
            gov_weight = 4;
            break;
          case Member_ID: // DevNet Member ID      
            gov_type = 'Member';
            gov_weight = 3;
            break;
          case Saved_ID:
            gov_type = 'Saved'
            gov_weight = 2
            break;
          default:
            gov_type = 'Guest'
            gov_weight = 0
            break;
        }
        if (creator_id) {

          if (Affiliate_IDs.includes(creator_id)) {
            gov_type = 'Affiliate'
            gov_weight = 1
          }
        }

        const info = { ...update, ownerPubkey: context.state.user.wallet, gov_type: gov_type, gov_weight: gov_weight }
        // console.log({ info })

        nftMeta.value = [...nftMeta.value, info]
        // totalGovWeight.value += info.gov_weight
        context.state.user.tokens = [...nftMeta.value]
        return info;


      }
      if (nftMeta.value.length > 0) {
        context.state.user.holder = true;
      }
      return
    }
  },
  modules: {
  }
})
