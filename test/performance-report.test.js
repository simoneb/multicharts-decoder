import { expect, describe, test } from 'vitest'
import { read, utils } from 'xlsx'
import fs from 'fs'
import path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import ExcelJS from 'exceljs'

import { KEYS, runRules } from '../src/parsers/performance-report'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('dump excel', () => {
  test('dump excel', async () => {
    const file = new File(
      [
        fs.readFileSync(
          path.join(
            __dirname,
            '@CL  CL 20..18 Bias Vasco M15 FryLong Backtesting Strategy Performance Report.xlsx'
          )
        )
      ],
      'performance-report.wsp'
    )
    const workbook1 = read(await file.arrayBuffer(), { cellDates: true })
    const sheet1 = workbook1.Sheets[workbook1.SheetNames[1]]

    const workbook2 = new ExcelJS.Workbook()
    await workbook2.xlsx.load(file.arrayBuffer())
    // .readFile(
    //   path.join(
    //     __dirname,
    //     '@CL  CL 20..18 Bias Vasco M15 FryLong Backtesting Strategy Performance Report.xlsx'
    //   )
    // )
    const sheet2 = workbook2.worksheets[1]

    const sheet1Values = utils.sheet_to_json(sheet1, { header: 1 })
    const sheet2Values = sheet2.getSheetValues().map(r => r.slice(1))

    for (let i = 0; i < 10; i++) {
      console.log({ a: sheet1Values[i], b: sheet2Values[i + 1] })
    }

    // for (const image of sheet2.getImages()) {
    //   console.log(
    //     'processing image row',
    //     image.range.tl.nativeRow,
    //     'col',
    //     image.range.tl.nativeCol,
    //     'imageId',
    //     image.imageId
    //   )
    //   // fetch the media item with the data (it seems the imageId matches up with m.index?)
    //   const img = workbook2.model.media.find(m => m.index === image.imageId)

    //   // fs.writeFileSync(
    //   //   `${image.range.tl.nativeRow}.${image.range.tl.nativeCol}.${img.name}.${img.extension}`,
    //   //   img.buffer
    //   // )
    // }
  })
})

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
    expect(runRules({ strategyAnalysis: [[KEYS.returnOnMaxDD, 10]] })).toEqual([
      {
        type: 'success',
        message: 'Return on Max Strategy Drawdown is 10.00'
      }
    ])
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
    ).toEqual([
      {
        message: 'The strategy spends 4.38% of the time in the market',
        type: 'success'
      }
    ])
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
    ).toEqual([
      {
        message: 'The strategy does 100.00 trades per year',
        type: 'success'
      }
    ])
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
    ).toEqual([
      { message: 'All trades last less than 10 days', type: 'success' }
    ])
  })
})
