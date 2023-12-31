import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { BetPosition, NodeLedger, NodeRound } from 'state/types'
import { formatBigNumber, formatBigNumberToFixed } from 'utils/formatBalance'
import getTimePeriods from 'utils/getTimePeriods'

export const formatUsdv2 = (usd: ethers.BigNumber) => {
  return `$${formatBigNumberToFixed(usd, 4, 8)}`
}

export const formatBnbv2 = (bnb: ethers.BigNumber) => {
  const value = bnb || ethers.BigNumber.from(0)
  return formatBigNumberToFixed(value, 4)
}

export const padTime = (num: number) => num.toString().padStart(2, '0')

export const formatRoundTime = (secondsBetweenBlocks: number) => {
  const { hours, minutes, seconds } = getTimePeriods(secondsBetweenBlocks)
  const minutesSeconds = `${padTime(minutes)}:${padTime(seconds)}`

  if (hours > 0) {
    return `${padTime(hours)}:${minutesSeconds}`
  }

  return minutesSeconds
}

export const getHasRoundFailed = (round: NodeRound, buffer: number) => {
  const closeTimestampMs = (round.closeTimestamp + buffer) * 1000
  const now = Date.now()

  if (closeTimestampMs !== null && now > closeTimestampMs && !round.oracleCalled) {
    return true
  }

  return false
}

export const getMultiplierv2 = (total: ethers.BigNumber, amount: ethers.BigNumber) => {
  if (!total) {
    return ethers.FixedNumber.from(0)
  }

  if (total.eq(0) || amount.eq(0)) {
    return ethers.FixedNumber.from(0)
  }
  const rewardAmountFixed = ethers.FixedNumber.from(total)
  const multiplierAmountFixed = ethers.FixedNumber.from(amount)

  return rewardAmountFixed.divUnsafe(multiplierAmountFixed)
}

export const getMultiplierv3 = (total: ethers.BigNumber, amount: ethers.BigNumber) => {
  if (!total) {
    return ethers.FixedNumber.from(0)
  }

  if (total.eq(0) || amount.eq(0)) {
    return ethers.FixedNumber.from(0)
  }
 
  const rewardAmountFixed = ethers.FixedNumber.from(total)
  const multiplierAmountFixed = ethers.FixedNumber.from(amount)

  const finalaccount = rewardAmountFixed.divUnsafe(multiplierAmountFixed)
  const subtractFee = finalaccount.mulUnsafe(ethers.FixedNumber.from(5)).divUnsafe(ethers.FixedNumber.from(100))

  return finalaccount.subUnsafe(subtractFee)

}

export const getPayoutv2 = (ledger: NodeLedger, round: NodeRound) => {
  if (!ledger || !round) {
    return ethers.FixedNumber.from(0)
  }

  const { bullAmount, bearAmount, rewardAmount } = round
  const { amount, position } = ledger
  const amountFixed = ethers.FixedNumber.from(formatBigNumber(amount))
  const multiplier = getMultiplierv2(rewardAmount, position === BetPosition.BULL ? bullAmount : bearAmount)

  return amountFixed.mulUnsafe(multiplier)

}

export const getNetPayoutv2 = (ledger: NodeLedger, round: NodeRound, rewardRate = 1) => {
  if (!ledger || !round) {
    return ethers.FixedNumber.from(0)
  }

  const payout = getPayoutv2(ledger, round)
  const amount = ethers.FixedNumber.from(formatBigNumber(ledger.amount))

  return payout.subUnsafe(amount)
}

export const getPriceDifference = (price: ethers.BigNumber, lockPrice: ethers.BigNumber) => {
  if (!price || !lockPrice) {
    return ethers.BigNumber.from(0)
  }

  return price.sub(lockPrice)
}
