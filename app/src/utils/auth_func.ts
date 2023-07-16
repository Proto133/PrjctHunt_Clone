// import { user, gun } from '@/utils/gun'
import store from '@/store'
import Auth from '@/utils/auth'
import { PublicKey } from '@solana/web3.js'
import { requestOptions, server } from './helpers'
import { wallet } from '@/utils/initWallet'
import { verifyWallet } from './txs'
export interface LOGINCREDS {
    username?: string;
    password?: string;
    wallet?: string | PublicKey | null;
}

export async function handleSignUp(creds: LOGINCREDS) {
    const time = Date.now()

    const data = {
        username: creds.username,
        password: creds.password,
        wallet: creds.wallet,
        avatar: `https://avatars.dicebear.com/api/identicon/${creds.username}.svg`,
        lastOnline: time
    }


    const response = await fetch(`${server()}user/signup`, requestOptions(data));
    const res = await response.json()
    if (!response.ok) throw new Error('Um, no thank you. . . try harder.');
    // console.log({ res })
    const info = { token_id: `G-${res.user._id}`, img_src: `https://avatars.dicebear.com/api/identicon/${res.user.username}.svg`, token_name: `Explorer-${res.user.username}`, gov_weight: 0, gov_type: `Explorer` }
    store.commit('setActingAs', info)
    store.commit('setAuthLevel', 'Explorer')
    store.dispatch('login', { username: res.user.username, wallet: res.user.wallet ? res.user.wallet : null, id: res.user._id })
    Auth.login(res.token)
    return { message: res.user.username }
}

// function verifyWallet(Wallet?: PublicKey | string) {
//   // console.log(Wallet)
//     return setTimeout(() => { return true }, 3000)
// }
export async function handleWalletLogin(creds: LOGINCREDS) {
    const time = Date.now()
    const data = {
        wallet: creds.wallet,
        lastOnline: time
    }
    creds.wallet ? creds.wallet = new PublicKey(creds.wallet) : null
    const verified = await verifyWallet(creds.wallet)
    if (!verified) return false;
    const response = await fetch(`${server()}user/walletLogin`, requestOptions(data))
    if (!response.ok || response.status === 400) throw new Error(response.statusText)
    const res = await response.json()
    // console.log({ res })
    // console.log(typeof res.token)
    const info = { token_id: `G-${res.user._id}`, img_src: `https://avatars.dicebear.com/api/identicon/${res.user.username}.svg`, token_name: `Explorer-${res.user.username}`, gov_weight: 0, gov_type: `Explorer` }
    store.commit('setConnected', true)
    store.commit('setActingAs', info)
    store.commit('setAuthLevel', 'Explorer')
    store.dispatch('login', { username: res.user.username, wallet: res.user.wallet ? res.user.wallet : null, id: res.user._id })
    Auth.login(res.token)
    return true
}

export async function handleLogin(creds: LOGINCREDS) {
    const time = Date.now()
    const data = {
        username: creds.username,
        password: creds.password,
        wallet: creds.wallet,
        lastOnline: time
    }
    const response = await fetch(`${server()}user/login`, requestOptions(data))

    const res = await response.json()
    if (!response.ok) throw new Error('Bad Credentials Bruh');
    // console.log({ res })
    // console.log(typeof res.token)
    const info = { token_id: `G-${res.user._id}`, img_src: `https://avatars.dicebear.com/api/identicon/${res.user.username}.svg`, token_name: `Explorer-${res.user.username}`, gov_weight: 0, gov_type: `Explorer` }
    store.commit('setConnected', true)
    store.commit('setActingAs', info)
    store.commit('setAuthLevel', 'Explorer')
    store.dispatch('login', { username: res.user.username, wallet: res.user.wallet ? res.user.wallet : null, id: res.user._id })
    Auth.login(res.token)
    return true
}

export async function ERTLogin(res: any) {
    const info = { token_id: `G-${res.user._id}`, img_src: `https://avatars.dicebear.com/api/identicon/${res.user.username}.svg`, token_name: `Explorer-${res.user.username}`, gov_weight: 0, gov_type: `Explorer` }
    store.commit('setConnected', true)
    store.commit('setActingAs', info)
    store.commit('setAuthLevel', 'Explorer')
    store.dispatch('login', { username: res.user.username, wallet: res.user.wallet ? res.user.wallet : null, id: res.user._id })
    Auth.login(res.token)
    return true
}

export function signout() {
    store.dispatch('signout')

    wallet.disconnect();
    // console.clear()
    // console.log(store.state.actingAs)
}