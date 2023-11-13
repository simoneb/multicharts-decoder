import { expect, describe, test } from 'vitest'

import { KEYS, runRules } from '../src/parsers/performance-report'

describe('maxDD', () => {
  test('violation', () => {
    expect(runRules({ strategyAnalysis: [[KEYS.returnOnMaxDD, 1]] })).toEqual([
      {
        type: 'error',
        message:
          'Return on Max Strategy Drawdown is 1.00. It should be at least 10'
      }
    ])
  })

  test('pass', () => {
    expect(runRules({ strategyAnalysis: [[KEYS.returnOnMaxDD, 10]] })).toEqual(
      []
    )
  })
})

describe('percent in the market', () => {
  test('violation', () => {
    expect(
      runRules({ strategyAnalysis: [[KEYS.percentInTheMarket, '54.38%']] })
    ).toEqual([
      {
        type: 'error',
        message: 'The strategy spends more than 50% of the time in the market'
      }
    ])
  })

  test('pass', () => {
    expect(
      runRules({ strategyAnalysis: [[KEYS.percentInTheMarket, '4.38%']] })
    ).toEqual([])
  })
})

describe('min trades', () => {
  const now = new Date()
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(now.getFullYear() - 1)

  test('too few', () => {
    expect(
      runRules({
        tradeAnalysis: [[KEYS.totalTrades, 10]],
        settings: [
          [KEYS.startDate, oneYearAgo],
          [KEYS.endDate, now]
        ]
      })
    ).toEqual([
      {
        type: 'warning',
        message: 'The strategy does less than 2 trades per month'
      }
    ])
  })

  test('too many', () => {
    expect(
      runRules({
        tradeAnalysis: [[KEYS.totalTrades, 1000]],
        settings: [
          [KEYS.startDate, oneYearAgo],
          [KEYS.endDate, now]
        ]
      })
    ).toEqual([
      {
        type: 'warning',
        message: 'The strategy does more than 10 trades per month'
      }
    ])
  })

  test('pass', () => {
    expect(
      runRules({
        tradeAnalysis: [[KEYS.totalTrades, 100]],
        settings: [
          [KEYS.startDate, oneYearAgo],
          [KEYS.endDate, now]
        ]
      })
    ).toEqual([])
  })
})

describe('trade duration', () => {
  test('violation 1', () => {
    expect(
      runRules({
        listOfTrades: [
          ['List of Trades'],
          [],
          ['Trade #', 'Order #', 'Type', 'Signal', 'Date', 'Time'],
          [1, 1, 'EntryLong', 'Bias', new Date(2012, 1, 16)],
          [1, 1, 'EntryLong', 'Bias', new Date(2012, 1, 27)]
        ]
      })
    ).toEqual([
      {
        type: 'warning',
        message: 'Trade #1 lasts more than 10 days'
      }
    ])
  })

  test('violation 2', () => {
    expect(
      runRules({
        listOfTrades: [
          ['List of Trades'],
          [],
          ['Trade #', 'Order #', 'Type', 'Signal', 'Date', 'Time'],
          [1, 1, 'EntryLong', 'Bias', new Date(2012, 1, 16)],
          [1, 2, 'EntryLong', 'Bias', new Date(2012, 1, 26)],
          [2, 3, 'EntryLong', 'Bias', new Date(2012, 2, 2)],
          [2, 4, 'EntryLong', 'Bias', new Date(2012, 2, 13)]
        ]
      })
    ).toEqual([
      {
        type: 'warning',
        message: 'Trade #2 lasts more than 10 days'
      }
    ])
  })

  test('pass', () => {
    expect(
      runRules({
        listOfTrades: [
          ['List of Trades'],
          [],
          ['Trade #', 'Order #', 'Type', 'Signal', 'Date', 'Time'],
          [1, 1, 'EntryLong', 'Bias', new Date(2012, 1, 16)],
          [1, 1, 'EntryLong', 'Bias', new Date(2012, 1, 26)]
        ]
      })
    ).toEqual([])
  })
})
