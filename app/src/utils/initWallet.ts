import { PhantomWalletAdapter, SolflareWalletAdapter, SolletWalletAdapter, LedgerWalletAdapter } from '@solana/wallet-adapter-wallets'
import { initWallet, useWallet } from 'solana-wallets-vue'
const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new SolletWalletAdapter(),
    new LedgerWalletAdapter()
]



initWallet({ wallets, autoConnect: false })

export const wallet = useWallet();