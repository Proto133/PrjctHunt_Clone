import { requestOptions, server } from "./helpers"


export async function sendToken(pubkey: string, task: string) {
    const winner = await fetch(`${server()}token/send`, requestOptions({ walletString: pubkey, task: task }))
    if (winner.status == 200) {
        const res = await winner.json()
        console.log({ res })
        const { amount } = res
        return `${amount} $FIRE has been sent to ${pubkey}!!`
    }
    return null;
}

export async function tokenLottery(pubkey: string) {
    console.log({
        'Playing Lottery For': pubkey
    })
    const winner = await fetch(`${server()}token/lottery`, requestOptions({ walletString: pubkey }))
    const res = await winner.json()
    console.log(res.message)
    const { message } = res
    if (winner.status == 200) {
        return message
    }
    return message
}