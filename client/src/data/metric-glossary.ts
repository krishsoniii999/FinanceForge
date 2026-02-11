interface MetricDefinition {
  name: string
  description: string
  whyItMatters?: string
}

export const metricGlossary: Record<string, MetricDefinition> = {
  marketCap: {
    name: 'Market Cap',
    description:
      'The total market value of a company, calculated by multiplying the stock price by the total number of shares outstanding.',
    whyItMatters:
      'It tells you how big a company is. Large-cap companies (>$10B) are generally more stable, while small-caps (<$2B) can be more volatile but offer higher growth potential.',
  },
  volume: {
    name: 'Volume',
    description:
      'The number of shares traded during a given period. Higher volume means more people are actively buying and selling.',
    whyItMatters:
      'High volume confirms price moves are meaningful. A big price jump on low volume might be a fluke, but on high volume it signals real conviction from investors.',
  },
  open: {
    name: 'Open Price',
    description:
      'The price at which the stock first traded when the market opened today.',
    whyItMatters:
      'Comparing the open to the previous close shows how overnight news and pre-market trading affected the stock.',
  },
  previousClose: {
    name: 'Previous Close',
    description:
      'The final price the stock traded at when the market closed on the last trading day.',
    whyItMatters:
      "This is the baseline for calculating today's price change. All day change percentages are measured from this price.",
  },
  dayHigh: {
    name: 'Day High',
    description:
      "The highest price the stock reached during today's trading session.",
    whyItMatters:
      "If the current price is near the day's high, buyers are in control. If it's fallen far from the high, sellers may be taking over.",
  },
  dayLow: {
    name: 'Day Low',
    description:
      "The lowest price the stock reached during today's trading session.",
    whyItMatters:
      "The range between day high and day low shows today's volatility. A wide range means big swings; a narrow range means relative calm.",
  },
  peRatio: {
    name: 'P/E Ratio (Price-to-Earnings)',
    description:
      'The ratio of a stock price to its earnings per share. If a stock is $100 and earns $5/share, the P/E is 20.',
    whyItMatters:
      "A high P/E means investors expect strong future growth. A low P/E might mean the stock is undervalued or the company's growth is slowing. Compare P/E ratios within the same industry.",
  },
  eps: {
    name: 'EPS (Earnings Per Share)',
    description:
      "A company's profit divided by its number of shares. It tells you how much money the company makes per share you own.",
    whyItMatters:
      'Growing EPS over time is one of the strongest signals that a company is becoming more profitable. Shrinking EPS is a red flag.',
  },
  dividendYield: {
    name: 'Dividend Yield',
    description:
      'The annual dividend payment as a percentage of the stock price. A $100 stock paying $3/year has a 3% yield.',
    whyItMatters:
      'Dividend yield is passive income from owning stocks. High-yield stocks provide income, while growth stocks usually reinvest profits instead of paying dividends.',
  },
  beta: {
    name: 'Beta',
    description:
      'A measure of how much a stock moves relative to the overall market. A beta of 1.5 means the stock tends to move 50% more than the market.',
    whyItMatters:
      'Beta below 1 = less volatile (defensive). Beta above 1 = more volatile (aggressive). It helps you understand how risky a stock is compared to the market.',
  },
  weekRange52: {
    name: '52-Week Range',
    description:
      'The lowest and highest prices the stock has traded at over the past year.',
    whyItMatters:
      "It shows you where the stock is relative to its annual range. Near the 52-week high might mean momentum; near the low might signal a buying opportunity or a company in trouble.",
  },
}
