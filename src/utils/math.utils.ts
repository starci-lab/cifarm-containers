export const computePercentage = (
    numerator: number,
    denominator: number,
    fractionDigits: number = 2
): number => {
    const fixed = ((numerator * 100) / denominator).toFixed(fractionDigits)
    return Number.parseFloat(fixed)
}

export const computeDenomination = (
    amount: number | bigint,
    decimals = 8,
    fractionDigits: number = 5
) => {
    if (typeof amount === "number") {
        const decimalMultiplier = 10 ** fractionDigits
        const divisor = 10 ** decimals
        const result = (amount * decimalMultiplier) / divisor
        return Number((result / decimalMultiplier).toFixed(fractionDigits))
    } else {
        const decimalMultiplier = BigInt(10 ** fractionDigits)
        const divisor = BigInt(10 ** decimals)
        const result = (amount * decimalMultiplier) / divisor
        return Number(result) / Number(decimalMultiplier)
    }
}

export const computeRaw = (amount: number, decimals = 8): bigint => {
    const mutiplier = 10 ** decimals
    return BigInt(amount * mutiplier)
}
