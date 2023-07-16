
function randomIntFromInterval(min = 1, max = 3) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export function pickWinner() {
    const pick = randomIntFromInterval(1, 3)
    const winner = randomIntFromInterval(1, 3)
    if (pick === winner) {
        console.log("winner")
        return true
    }
    return false;
}
