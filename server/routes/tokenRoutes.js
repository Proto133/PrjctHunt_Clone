const router = require('express').Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
const { sendToken } = require('../controllers/TokenController')


// Has the wallet already won a lottery
let lotteryWinnersList = [];

// Has the wallet already earned tokens through tasks
let taskTokensEarnedList = [];


function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function pickWinner(walletString) {
    const pick = randomIntFromInterval(1, 5)
    const userNumber = randomIntFromInterval(1, 5)
    const winningAmount = randomIntFromInterval(1, 10)
    console.log({ winner: winningAmount, pick: pick })
    if (lotteryWinnersList.includes(walletString)) {
        // console.log(`${walletString} has claimed recently`)
        return 'Claimed Recently';
    }
    lotteryWinnersList.push(walletString)
    console.log({ pick, userNumber })
    if (pick === userNumber) {
        return winningAmount
    }
    return `Not This Time \n Your Number: ${userNumber}\n Winning Number: ${pick}`;
}

function checkEligibility(list, user) {
    console.log(list, user)
    if (list === 'lottery') {
        if (lotteryWinnersList.includes(user)) {
            return false;
        }
        return true
    }
    if (list == 'earn') {
        console.log({ taskTokensEarnedList })
        if (taskTokensEarnedList.includes(user)) {
            return false;
        }
        return true;
    }
    return false;
}



function clearEarnersList() {
    taskTokensEarnedList = []
    setTimeout(clearEarnersList, (108 * 1000 * 100)) // Clear Task Token Earners List Every 3 hours
    return
}
function clearWinnersList() {
    lotteryWinnersList = []
    setTimeout(clearWinnersList, (216 * 1000 * 100)) //Clear Lottery Winners List Every 12 hours
    return
}

router.get('/clearLottery', (req, res) => {
    clearWinnersList()
    res.status(200).json({ message: 'Cleared List' })
})

router.get('/lists', async (req, res) => {
    return res.status(200).json({
        lotteryWinnersList,
        taskTokensEarnedList
    })
})
router.post('/lottery', async (req, res) => {
    try {

        const { walletString } = req.body
        const winningAmount = await pickWinner(walletString)
        if (winningAmount == 'Claimed Recently') {
            return res.status(409).json({ message: 'Try again later.' })
        }
        if ((typeof winningAmount !== "number")) {
            return res.status(202).json({ message: winningAmount })
        }

        const signature = await sendToken(walletString, winningAmount);
        if (!signature) {
            return res.status(401).json({ message: 'Invalid signature' })
        }
        res.status(200).json({ message: `${winningAmount} FireToken(s) sent to ${walletString}`, TX: `${signature}` });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
})

router.post('/eligibility/lottery', async (req, res) => {
    try {
        const { walletString } = req.body
        const eligible = checkEligibility('lottery', walletString)
        if (!eligible) {
            return res.status(202).json({
                message: 'Lottery resets every 12 hours, try again later.'
            }
            )
        }
        return res.status(200).json({ message: 'Good to Go' })
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

router.post('/send', async (req, res) => {
    try {

        console.log(req.body)
        const { walletString, task } = req.body
        const eligible = checkEligibility('earn', `${walletString}-${task}`)
        console.log({ eligible })
        if (!eligible) {
            console.log()
            return res.status(200).json({ message: `${walletString} has already claimed the tokens for ${task} today` });
        }
        const amount = randomIntFromInterval(1, 3)
        console.log(`${walletString}`)
        const signature = await sendToken(walletString, amount);
        if (!signature) {
            return res.status(401).json({ message: 'Invalid signature' })
        }
        taskTokensEarnedList.push(`${walletString}-${task}`);
        res.status(200).json({ message: `${amount} FireToken(s) sent to ${walletString}`, TX: `${signature}`, amount: amount });
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
})

module.exports = router