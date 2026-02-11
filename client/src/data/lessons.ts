export interface LessonSection {
  type: 'text' | 'tip' | 'quiz'
  content: string
  options?: string[]
  correctAnswer?: number
}

export interface Lesson {
  id: string
  title: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  description: string
  sections: LessonSection[]
}

export const lessons: Lesson[] = [
  {
    id: 'what-is-a-stock',
    title: 'What is a Stock?',
    category: 'Basics',
    difficulty: 'beginner',
    duration: '5 min',
    description: 'Learn what stocks are and why companies sell them.',
    sections: [
      {
        type: 'text',
        content:
          'A stock represents a small piece of ownership in a company. When you buy a share of Apple stock, you literally own a tiny fraction of Apple Inc. If the company does well and grows, your share becomes more valuable. If it struggles, your share loses value.',
      },
      {
        type: 'text',
        content:
          'Companies sell stocks to raise money. Instead of borrowing from a bank (debt), they sell pieces of ownership to investors (equity). This money helps them build new products, hire people, and expand their business.',
      },
      {
        type: 'tip',
        content:
          'Think of it like this: if a pizza is cut into 1,000 slices and you own 10 slices, you own 1% of that pizza. If the pizza gets bigger (company grows), your slices represent a larger amount even though you still have 10.',
      },
      {
        type: 'text',
        content:
          'Stocks are traded on exchanges like the NYSE (New York Stock Exchange) and NASDAQ. When you see a stock price, it represents what the last buyer was willing to pay for one share. Prices change constantly throughout the trading day based on supply and demand.',
      },
      {
        type: 'quiz',
        content: 'Why do companies sell stock?',
        options: [
          'To raise money without taking on debt',
          'Because the government requires it',
          'To give away the company',
          'To lower the stock price',
        ],
        correctAnswer: 0,
      },
    ],
  },
  {
    id: 'reading-a-stock-quote',
    title: 'Reading a Stock Quote',
    category: 'Basics',
    difficulty: 'beginner',
    duration: '4 min',
    description: 'Understand what all those numbers on a stock quote mean.',
    sections: [
      {
        type: 'text',
        content:
          'When you look up a stock, you see a lot of numbers. Here\'s what the key ones mean:\n\n**Price** - What one share costs right now.\n\n**Change** - How much the price moved today (in dollars and percent).\n\n**Volume** - How many shares were traded today. High volume means lots of activity.\n\n**Market Cap** - The total value of the company (price × total shares).',
      },
      {
        type: 'tip',
        content:
          'Green means the stock is UP today. Red means it\'s DOWN. This is universal across all trading platforms.',
      },
      {
        type: 'text',
        content:
          '**Open** - The price at the start of the trading day.\n\n**Previous Close** - The price at the end of yesterday.\n\n**Day High / Day Low** - The highest and lowest prices reached today.\n\n**52-Week High / Low** - The highest and lowest prices over the past year.',
      },
      {
        type: 'quiz',
        content: 'What does "Volume" tell you about a stock?',
        options: [
          'How loud the trading floor is',
          'How many shares were traded',
          'The size of the company',
          'How much profit it makes',
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: 'pe-ratio',
    title: 'P/E Ratio Decoded',
    category: 'Valuation',
    difficulty: 'intermediate',
    duration: '6 min',
    description: 'The most popular metric for evaluating if a stock is expensive or cheap.',
    sections: [
      {
        type: 'text',
        content:
          'The P/E ratio (Price-to-Earnings) is calculated by dividing the stock price by the company\'s earnings per share (EPS). If a stock costs $100 and the company earns $5 per share, the P/E is 20.',
      },
      {
        type: 'text',
        content:
          'Think of P/E as "how many years of current earnings would it take to pay for the stock." A P/E of 20 means you\'re paying 20 years worth of earnings for one share.',
      },
      {
        type: 'tip',
        content:
          'A "high" P/E (above 25-30) usually means investors expect the company to grow fast. A "low" P/E (below 15) might mean the stock is undervalued, or that the market expects slow growth. Always compare P/E ratios within the same industry — tech companies typically have higher P/Es than utilities.',
      },
      {
        type: 'text',
        content:
          'There are two types:\n\n**Trailing P/E** - Uses past 12 months of earnings (actual data).\n\n**Forward P/E** - Uses estimated future earnings (analyst predictions).\n\nForward P/E is lower when analysts expect earnings to grow.',
      },
      {
        type: 'quiz',
        content: 'A stock at $150 with EPS of $5 has a P/E ratio of:',
        options: ['30', '75', '5', '15'],
        correctAnswer: 0,
      },
    ],
  },
  {
    id: 'diversification',
    title: 'Diversification 101',
    category: 'Strategy',
    difficulty: 'beginner',
    duration: '5 min',
    description: 'Why you should never put all your eggs in one basket.',
    sections: [
      {
        type: 'text',
        content:
          'Diversification means spreading your investments across different stocks, sectors, and asset types. The idea is simple: if one investment drops, others might hold steady or go up, reducing your overall risk.',
      },
      {
        type: 'tip',
        content:
          'Warren Buffett says "Don\'t put all your eggs in one basket." If you own only tech stocks and the tech sector crashes, your entire portfolio crashes. But if you also own healthcare, energy, and consumer stocks, the damage is limited.',
      },
      {
        type: 'text',
        content:
          'Ways to diversify:\n\n**By sector** - Own stocks from different industries (tech, healthcare, finance, etc.)\n\n**By size** - Mix large-cap (stable), mid-cap, and small-cap (growth) stocks.\n\n**By geography** - Include international stocks, not just US companies.\n\n**By asset class** - Mix stocks with bonds, real estate (REITs), and cash.',
      },
      {
        type: 'text',
        content:
          'ETFs (Exchange-Traded Funds) are the easiest way to diversify. Buying one share of SPY gives you exposure to 500 of the largest US companies. QQQ gives you the top 100 NASDAQ companies.',
      },
      {
        type: 'quiz',
        content: 'What is the main benefit of diversification?',
        options: [
          'It guarantees profits',
          'It reduces risk by spreading investments',
          'It increases returns',
          'It eliminates all market risk',
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: 'etfs-explained',
    title: 'What are ETFs?',
    category: 'Basics',
    difficulty: 'beginner',
    duration: '5 min',
    description: 'How to own hundreds of stocks with a single purchase.',
    sections: [
      {
        type: 'text',
        content:
          'An ETF (Exchange-Traded Fund) is a basket of stocks packaged into a single investment that trades on the stock exchange like a regular stock. Instead of buying 500 individual stocks, you can buy one share of an S&P 500 ETF and own a piece of all of them.',
      },
      {
        type: 'tip',
        content:
          'SPY, VOO, and IVV all track the S&P 500. QQQ tracks the NASDAQ-100. These are some of the most popular ETFs in the world and are great starting points for new investors.',
      },
      {
        type: 'text',
        content:
          'ETF advantages:\n\n**Instant diversification** - One purchase = many stocks.\n\n**Low cost** - Most index ETFs charge very low fees (0.03-0.20% per year).\n\n**Trades like a stock** - Buy and sell any time the market is open.\n\n**Transparency** - You can see exactly what stocks are inside the ETF.',
      },
      {
        type: 'quiz',
        content: 'What does an ETF allow you to do?',
        options: [
          'Avoid paying taxes',
          'Own a basket of stocks in one purchase',
          'Trade for free',
          'Guarantee returns',
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: 'candlestick-charts',
    title: 'Reading Candlestick Charts',
    category: 'Technical',
    difficulty: 'intermediate',
    duration: '7 min',
    description: 'Learn to read the most popular chart type used by traders.',
    sections: [
      {
        type: 'text',
        content:
          'A candlestick shows four pieces of data for a time period: the Open, High, Low, and Close prices (OHLC).\n\nThe "body" of the candle shows the range between the open and close. The "wicks" (thin lines above and below) show the high and low.',
      },
      {
        type: 'text',
        content:
          '**Green candle** - The close is HIGHER than the open (price went up). The bottom of the body is the open, and the top is the close.\n\n**Red candle** - The close is LOWER than the open (price went down). The top of the body is the open, and the bottom is the close.',
      },
      {
        type: 'tip',
        content:
          'Long bodies mean strong buying or selling pressure. Short bodies mean indecision. Long wicks mean the price was pushed to an extreme but then rejected — the longer the wick, the stronger the rejection.',
      },
      {
        type: 'quiz',
        content: 'A green candlestick means:',
        options: [
          'The stock lost money',
          'The closing price was higher than the opening price',
          'The stock hit a new all-time high',
          'Trading volume was high',
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: 'risk-and-reward',
    title: 'Risk and Reward',
    category: 'Strategy',
    difficulty: 'beginner',
    duration: '5 min',
    description: 'Understanding the fundamental trade-off in all investing.',
    sections: [
      {
        type: 'text',
        content:
          'In investing, risk and reward are directly linked. Higher potential returns come with higher risk of losing money. A savings account is safe but earns almost nothing. Stocks are volatile but historically return 7-10% per year on average.',
      },
      {
        type: 'text',
        content:
          '**Beta** measures a stock\'s volatility relative to the market. A beta of 1.0 means it moves with the market. Above 1.0 is more volatile (risky but potentially rewarding). Below 1.0 is less volatile (safer but slower growth).',
      },
      {
        type: 'tip',
        content:
          'Never invest money you can\'t afford to lose. The stock market goes through "bear markets" (drops of 20%+) roughly every 5-7 years. If you might need the money within 1-2 years, consider safer investments.',
      },
      {
        type: 'quiz',
        content: 'A stock with a beta of 1.5 means:',
        options: [
          'It\'s guaranteed to go up 50%',
          'It tends to move 50% more than the market',
          'It moves exactly with the market',
          'It only goes up',
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: 'dollar-cost-averaging',
    title: 'Dollar Cost Averaging',
    category: 'Strategy',
    difficulty: 'beginner',
    duration: '4 min',
    description: 'The simplest and most effective investment strategy.',
    sections: [
      {
        type: 'text',
        content:
          'Dollar Cost Averaging (DCA) means investing a fixed amount of money at regular intervals, regardless of the stock price. For example, investing $500 into an S&P 500 ETF every month.',
      },
      {
        type: 'text',
        content:
          'When prices are high, your $500 buys fewer shares. When prices are low, your $500 buys more shares. Over time, this averages out your cost per share and removes the stress of trying to "time the market."',
      },
      {
        type: 'tip',
        content:
          'Studies show that even professional fund managers rarely beat the market consistently over long periods. DCA into an index fund is the strategy most recommended by financial experts for everyday investors.',
      },
      {
        type: 'quiz',
        content: 'What happens when you DCA and the market drops?',
        options: [
          'You lose everything',
          'You buy more shares for the same amount',
          'You should stop investing immediately',
          'Nothing changes',
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: 'bull-bear-markets',
    title: 'Bull vs Bear Markets',
    category: 'Basics',
    difficulty: 'beginner',
    duration: '4 min',
    description: 'Understanding the cycles of optimism and pessimism in markets.',
    sections: [
      {
        type: 'text',
        content:
          'A **bull market** is when stock prices are rising or expected to rise. Investor confidence is high. The economy is generally strong.\n\nA **bear market** is when prices drop 20% or more from recent highs. Fear dominates. People sell.\n\nHistorically, bull markets last much longer than bear markets.',
      },
      {
        type: 'tip',
        content:
          '"Be fearful when others are greedy, and greedy when others are fearful." — Warren Buffett. Bear markets, while scary, are often the best times to buy quality stocks at a discount.',
      },
      {
        type: 'quiz',
        content: 'A bear market is defined as a drop of:',
        options: [
          '5% from highs',
          '10% from highs',
          '20% or more from highs',
          '50% from highs',
        ],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: 'understanding-rsi',
    title: 'Understanding RSI',
    category: 'Technical',
    difficulty: 'advanced',
    duration: '6 min',
    description: 'A popular indicator that shows if a stock is overbought or oversold.',
    sections: [
      {
        type: 'text',
        content:
          'RSI (Relative Strength Index) is a momentum indicator that measures the speed and size of recent price changes to evaluate if a stock is overbought or oversold. It ranges from 0 to 100.',
      },
      {
        type: 'text',
        content:
          '**Above 70** = Potentially overbought (price has risen a lot, might pull back).\n\n**Below 30** = Potentially oversold (price has dropped a lot, might bounce back).\n\n**Around 50** = Neutral momentum.',
      },
      {
        type: 'tip',
        content:
          'RSI is not a crystal ball. A stock can stay "overbought" (above 70) for weeks during a strong uptrend. Use RSI as one of many tools, never as your only decision maker. Combine it with other analysis.',
      },
      {
        type: 'quiz',
        content: 'An RSI reading of 25 suggests the stock is:',
        options: [
          'Overpriced and due for a drop',
          'Potentially oversold and might bounce back',
          'Perfectly valued',
          'About to be delisted',
        ],
        correctAnswer: 1,
      },
    ],
  },
]
