import React from 'react'
import styled from 'styled-components'
import { Bet } from 'state/types'
import { useTranslation } from 'contexts/Localization'
import { getBscScanLink } from 'utils'
import { Flex, Text, Link, Heading } from '@zaigar-finance/uikit'
import { Result } from 'state/predictions/helpers'
import { PayoutRow, RoundResultHistory } from '../RoundResult'
import BetResult from './BetResult'
import { getMultiplier, getMultiplierv4 } from './helpers'

interface BetDetailsProps {
  bet: Bet
  result: Result
}

const StyledBetDetails = styled.div`
  background-color: ${({ theme }) => theme.colors.dropdown};
  border-bottom: 2px solid ${({ theme }) => theme.colors.cardBorder};
  padding: 24px;
`

const BetDetails: React.FC<BetDetailsProps> = ({ bet, result }) => {
  const { t } = useTranslation()
  const { totalAmount, bullAmount, bearAmount } = bet.round
  const bullMultiplier = getMultiplierv4(totalAmount, bullAmount)
  const bearMultiplier = getMultiplierv4(totalAmount, bearAmount)

  return (
    <StyledBetDetails>
      {result === Result.CANCELED && (
        <Text as="p" color="failure" mb="24px">
          {t(
            'This round was automatically canceled due to an error. If you entered a position, please reclaim your funds below.',
          )}
        </Text>
      )}
      {result !== Result.LIVE && <BetResult bet={bet} result={result} />}
      <Heading mb="8px">{t('Round History')}</Heading>
      <RoundResultHistory round={bet.round} mb="24px">
        <PayoutRow positionLabel={t('Up')} multiplier={bullMultiplier} amount={bullAmount - bullAmount*5/100 } />
        <PayoutRow positionLabel={t('Down')} multiplier={bearMultiplier} amount={bearAmount - bearAmount*5/100} />
      </RoundResultHistory>
      <Flex alignItems="center" justifyContent="space-between" mb="8px">
        <Text>{t('Opening Block')}</Text>
        <Link href={getBscScanLink(bet.round.lockBlock, 'block')} external>
          {bet.round.lockBlock}
        </Link>
      </Flex>
      <Flex alignItems="center" justifyContent="space-between">
        <Text>{t('Closing Block')}</Text>
        <Link href={getBscScanLink(bet.round.closeBlock, 'block')} external>
          {bet.round.closeBlock}
        </Link>
      </Flex>
    </StyledBetDetails>
  )
}

export default BetDetails
