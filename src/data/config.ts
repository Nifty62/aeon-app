

export default {
  "tableHeaders": [
    "Currency",
    "Direction",
    "Modified Score",
    "Event Modifier",
    "Risk Modifier",
    "Base Score",
    "Manufacturing PMI",
    "Services PMI",
    "Consumer Confidence",
    "CPI",
    "Money Supply",
    "COT",
    "Central Bank",
    "Seasonality",
    "Retail Sentiment",
    "Strong vs Weak"
  ],
  "indicators": [
    "Manufacturing PMI",
    "Services PMI",
    "Consumer Confidence",
    "CPI",
    "Money Supply",
    "COT",
    "Central Bank",
    "Seasonality",
    "Retail Sentiment",
    "Strong vs Weak"
  ]
};

export const sourceIndicatorConfig = {
  groups: [
    {
      name: "Sentiment",
      indicators: [
        "Manufacturing PMI",
        "Services PMI",
        "Consumer Confidence",
        "Business Confidence",
        "Retail Sentiment",
      ]
    },
    {
      name: "Inflation",
      indicators: [
        "CPI",
        "Core PPI YoY",
        { name: "Average Hourly Earnings YoY", currencies: ["USD", "NZD"] },
        { name: "Gross Monthly Wage", currencies: ["CHF"] },
        { name: "Average Monthly Earnings", currencies: ["EUR"] },
        { name: "Average Weekly Wages", currencies: ["GBP", "AUD"] },
        { name: "Average Weekly Earnings", currencies: ["CAD"] },
        { name: "Average Monthly Wages", currencies: ["JPY"] }
      ]
    },
    {
      name: "Growth",
      indicators: [
        "GDP Q/Q Annualized",
        "Retail Sales M/M"
      ]
    },
    {
      name: "Labour Market",
      indicators: [
        "Unemployment Rate",
        { name: "Employment Change", currencies: ["NZD", "EUR", "GBP", "CAD", "JPY", "CHF"] },
        { name: "Job Vacancies", currencies: ["NZD", "GBP", "CAD", "JPY", "CHF"] },
        { name: "Job Vacancy Rate", currencies: ["EUR"] },
        { name: "Employment Change / NFP", currencies: ["USD"] },
        { name: "ADP Employment Change", currencies: ["USD"] },
        { name: "Unemployment Claims", currencies: ["USD"] },
        { name: "JOLTS Job Openings", currencies: ["USD"] },
        { name: "Claimant Count", currencies: ["GBP"] },
      ]
    },
    {
      name: "Monetary",
      indicators: ["Money Supply", "Central Bank"]
    },
    {
      name: "Market",
      indicators: ["Seasonality", "COT", "Strong vs Weak", "Event Modifiers"]
    }
  ]
};

export const aiModels = {
  gemini: [
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite"
  ],
  openai: [
    "gpt-5",
    "gpt-4o",
    "gpt-4-turbo"
  ],
  deepseek: [
    "deepseek-r1",
    "deepseek-chat"
  ],
  anthropic: [],
  openrouter: {
    free: [
      "google/gemma-7b-it:online",
      "meta/llama-3-8b-instruct:online",
      "meta/llama-3-70b-instruct:online",
      "mistral/mistral-7b-instruct:online",
      "mistral/mixtral-8x7b-instruct:online",
      "openrouter/auto",
    ],
    paid: [
      "anthropic/claude-3-haiku:online",
      "anthropic/claude-3-opus:online",
      "anthropic/claude-3-sonnet:online",
      "openai/gpt-3.5-turbo:online",
      "openai/gpt-4-turbo:online",
      "openai/gpt-4o:online",
      "openai/gpt-5:online",
    ]
  }
};