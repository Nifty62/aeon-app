export default {
  "defaultSources": {
    "Seasonality": ["https://market-bulls.com/seasonal-tendency-market-charts/"],
    "COT": ["https://market-bulls.com/cot-report/"],
    "Retail Sentiment": [],
    "Strong vs Weak": [],
    "Event Modifiers": ["https://tradingeconomics.com/ws/stream.ashx?start=0&size=20"]
  },
  "centralBankSources": {
    "USD": ["https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm"],
    "EUR": ["https://www.ecb.europa.eu/press/govcdec/mopo/html/index.en.html"],
    "GBP": ["https://www.bankofengland.co.uk/monetary-policy-report-and-interim-reports"],
    "AUD": ["https://www.rba.gov.au/media-releases/"],
    "NZD": ["https://www.rbnz.govt.nz/monetary-policy/monetary-policy-statement"],
    "CAD": ["https://www.bankofcanada.ca/core-functions/monetary-policy/key-interest-rate/"],
    "JPY": ["https://www.boj.or.jp/en/mopo/mpmdeci/index.htm"],
    "CHF": ["https://www.snb.ch/en/i-publications/snb-news/monetary-policy-assessments"]
  },
  "sourceExceptions": [
    {
      "id": "aud-m3-exception",
      "currencyCode": "AUD",
      "indicator": "Money Supply",
      "url": ["https://tradingeconomics.com/australia/money-supply-m3"]
    },
    {
      "id": "nzd-m3-exception",
      "currencyCode": "NZD",
      "indicator": "Money Supply",
      "url": ["https://tradingeconomics.com/new-zealand/money-supply-m3"]
    },
    {
      "id": "nzd-manufacturing-pmi",
      "currencyCode": "NZD",
      "indicator": "Manufacturing PMI",
      "url": ["https://tradingeconomics.com/new-zealand/manufacturing-pmi"]
    },
    {
      "id": "nzd-services-pmi",
      "currencyCode": "NZD",
      "indicator": "Services PMI",
      "url": ["https://tradingeconomics.com/new-zealand/services-pmi"]
    },
    {
      "id": "nzd-consumer-confidence",
      "currencyCode": "NZD",
      "indicator": "Consumer Confidence",
      "url": ["https://tradingeconomics.com/new-zealand/consumer-confidence"]
    },
    {
      "id": "nzd-cpi",
      "currencyCode": "NZD",
      "indicator": "CPI",
      "url": ["https://tradingeconomics.com/new-zealand/inflation-cpi"]
    },
    {
      "id": "nzd-unemployment-rate",
      "currencyCode": "NZD",
      "indicator": "Unemployment Rate",
      "url": ["https://tradingeconomics.com/new-zealand/unemployment-rate"]
    },
    {
      "id": "nzd-job-vacancies",
      "currencyCode": "NZD",
      "indicator": "Job Vacancies",
      "url": ["https://tradingeconomics.com/new-zealand/job-vacancies"]
    },
    {
      "id": "nzd-employment-change",
      "currencyCode": "NZD",
      "indicator": "Employment Change",
      "url": ["https://tradingeconomics.com/new-zealand/employment-change"]
    },
    {
      "id": "nzd-retail-sales",
      "currencyCode": "NZD",
      "indicator": "Retail Sales M/M",
      "url": ["https://tradingeconomics.com/new-zealand/retail-sales"]
    },
    {
      "id": "nzd-gdp",
      "currencyCode": "NZD",
      "indicator": "GDP Q/Q Annualized",
      "url": ["https://tradingeconomics.com/new-zealand/gdp-growth"]
    },
    {
      "id": "usd-retail-sales",
      "currencyCode": "USD",
      "indicator": "Retail Sales M/M",
      "url": ["https://tradingeconomics.com/united-states/retail-sales"]
    },
    {
      "id": "eur-retail-sales",
      "currencyCode": "EUR",
      "indicator": "Retail Sales M/M",
      "url": ["https://tradingeconomics.com/euro-area/retail-sales"]
    },
    {
      "id": "gbp-retail-sales",
      "currencyCode": "GBP",
      "indicator": "Retail Sales M/M",
      "url": ["https://tradingeconomics.com/united-kingdom/retail-sales"]
    },
    {
      "id": "aud-retail-sales",
      "currencyCode": "AUD",
      "indicator": "Retail Sales M/M",
      "url": ["https://tradingeconomics.com/australia/retail-sales"]
    },
    {
      "id": "cad-retail-sales",
      "currencyCode": "CAD",
      "indicator": "Retail Sales M/M",
      "url": ["https://tradingeconomics.com/canada/retail-sales"]
    },
    {
      "id": "jpy-retail-sales",
      "currencyCode": "JPY",
      "indicator": "Retail Sales M/M",
      "url": ["https://tradingeconomics.com/japan/retail-sales"]
    },
    {
      "id": "chf-retail-sales",
      "currencyCode": "CHF",
      "indicator": "Retail Sales M/M",
      "url": ["https://tradingeconomics.com/switzerland/retail-sales"]
    },
    {
      "id": "usd-jolts-job-openings",
      "currencyCode": "USD",
      "indicator": "JOLTS Job Openings",
      "url": ["https://tradingeconomics.com/united-states/job-offers"]
    },
    {
      "id": "usd-unemployment-claims",
      "currencyCode": "USD",
      "indicator": "Unemployment Claims",
      "url": ["https://tradingeconomics.com/united-states/jobless-claims"]
    },
    {
      "id": "usd-adp-employment-change",
      "currencyCode": "USD",
      "indicator": "ADP Employment Change",
      "url": ["https://tradingeconomics.com/united-states/adp-employment-change"]
    },
    {
      "id": "usd-avg-hourly-earnings",
      "currencyCode": "USD",
      "indicator": "Average Hourly Earnings YoY",
      "url": ["https://tradingeconomics.com/united-states/average-hourly-earnings-yoy"]
    },
    {
      "id": "usd-core-ppi-yoy",
      "currencyCode": "USD",
      "indicator": "Core PPI YoY",
      "url": ["https://tradingeconomics.com/united-states/core-producer-prices-yoy"]
    },
    {
      "id": "eur-core-ppi-yoy",
      "currencyCode": "EUR",
      "indicator": "Core PPI YoY",
      "url": ["https://tradingeconomics.com/euro-area/producer-price-inflation-mom"]
    },
    {
      "id": "eur-avg-monthly-earnings",
      "currencyCode": "EUR",
      "indicator": "Average Monthly Earnings",
      "url": ["https://tradingeconomics.com/euro-area/wages"]
    },
    {
      "id": "eur-job-vacancy-rate",
      "currencyCode": "EUR",
      "indicator": "Job Vacancy Rate",
      "url": ["https://tradingeconomics.com/euro-area/job-vacancy-rate"]
    },
    {
      "id": "gbp-avg-weekly-wages",
      "currencyCode": "GBP",
      "indicator": "Average Weekly Wages",
      "url": ["https://tradingeconomics.com/united-kingdom/wages"]
    },
    {
      "id": "gbp-core-ppi-yoy",
      "currencyCode": "GBP",
      "indicator": "Core PPI YoY",
      "url": ["https://tradingeconomics.com/united-kingdom/core-producer-prices"]
    },
    {
      "id": "gbp-claimant-count",
      "currencyCode": "GBP",
      "indicator": "Claimant Count",
      "url": ["https://tradingeconomics.com/united-kingdom/claimant-count-change"]
    },
    {
      "id": "aud-core-ppi-yoy",
      "currencyCode": "AUD",
      "indicator": "Core PPI YoY",
      "url": ["https://tradingeconomics.com/australia/producer-prices"]
    },
    {
      "id": "aud-avg-weekly-wages",
      "currencyCode": "AUD",
      "indicator": "Average Weekly Wages",
      "url": ["https://tradingeconomics.com/australia/wages"]
    },
    {
      "id": "nzd-core-ppi-yoy",
      "currencyCode": "NZD",
      "indicator": "Core PPI YoY",
      "url": ["https://tradingeconomics.com/new-zealand/producer-prices"]
    },
    {
      "id": "nzd-avg-hourly-earnings",
      "currencyCode": "NZD",
      "indicator": "Average Hourly Earnings YoY",
      "url": ["https://tradingeconomics.com/new-zealand/wages"]
    },
    {
      "id": "cad-core-ppi-yoy",
      "currencyCode": "CAD",
      "indicator": "Core PPI YoY",
      "url": ["https://tradingeconomics.com/canada/producer-prices"]
    },
    {
      "id": "cad-avg-weekly-earnings",
      "currencyCode": "CAD",
      "indicator": "Average Weekly Earnings",
      "url": ["https://tradingeconomics.com/canada/average-weekly-earnings"]
    },
    {
      "id": "jpy-core-ppi-yoy",
      "currencyCode": "JPY",
      "indicator": "Core PPI YoY",
      "url": ["https://tradingeconomics.com/japan/producer-prices-change"]
    },
    {
      "id": "jpy-avg-monthly-wages",
      "currencyCode": "JPY",
      "indicator": "Average Monthly Wages",
      "url": ["https://tradingeconomics.com/japan/wages"]
    },
    {
      "id": "chf-core-ppi-yoy",
      "currencyCode": "CHF",
      "indicator": "Core PPI YoY",
      "url": ["https://tradingeconomics.com/switzerland/producer-prices"]
    },
    {
      "id": "chf-gross-monthly-wage",
      "currencyCode": "CHF",
      "indicator": "Gross Monthly Wage",
      "url": ["https://tradingeconomics.com/switzerland/wages"]
    },
    {
      "id": "usd-manufacturing-pmi",
      "currencyCode": "USD",
      "indicator": "Manufacturing PMI",
      "url": ["https://tradingeconomics.com/united-states/manufacturing-pmi"]
    },
    {
      "id": "usd-services-pmi",
      "currencyCode": "USD",
      "indicator": "Services PMI",
      "url": ["https://tradingeconomics.com/united-states/services-pmi"]
    },
    {
      "id": "usd-consumer-confidence",
      "currencyCode": "USD",
      "indicator": "Consumer Confidence",
      "url": ["https://tradingeconomics.com/united-states/consumer-confidence"]
    },
    {
      "id": "usd-business-confidence",
      "currencyCode": "USD",
      "indicator": "Business Confidence",
      "url": ["https://tradingeconomics.com/united-states/business-confidence"]
    },
    {
      "id": "usd-cpi",
      "currencyCode": "USD",
      "indicator": "CPI",
      "url": ["https://tradingeconomics.com/united-states/consumer-price-index-cpi"]
    },
    {
      "id": "usd-gdp",
      "currencyCode": "USD",
      "indicator": "GDP Q/Q Annualized",
      "url": ["https://tradingeconomics.com/united-states/gdp"]
    },
    {
      "id": "usd-unemployment-rate",
      "currencyCode": "USD",
      "indicator": "Unemployment Rate",
      "url": ["https://tradingeconomics.com/united-states/unemployment-rate"]
    },
    {
      "id": "usd-money-supply",
      "currencyCode": "USD",
      "indicator": "Money Supply",
      "url": ["https://tradingeconomics.com/united-states/money-supply-m2"]
    },
    {
      "id": "usd-nfp",
      "currencyCode": "USD",
      "indicator": "Employment Change / NFP",
      "url": ["https://tradingeconomics.com/united-states/non-farm-payrolls"]
    },
    {
      "id": "usd-job-vacancies",
      "currencyCode": "USD",
      "indicator": "Job Vacancies",
      "url": ["https://tradingeconomics.com/united-states/job-vacancies"]
    },
    
    // --- EUR ---
    {
      "id": "eur-manufacturing-pmi",
      "currencyCode": "EUR",
      "indicator": "Manufacturing PMI",
      "url": ["https://tradingeconomics.com/euro-area/manufacturing-pmi"]
    },
    {
      "id": "eur-services-pmi",
      "currencyCode": "EUR",
      "indicator": "Services PMI",
      "url": ["https://tradingeconomics.com/euro-area/services-pmi"]
    },
    {
      "id": "eur-consumer-confidence",
      "currencyCode": "EUR",
      "indicator": "Consumer Confidence",
      "url": ["https://tradingeconomics.com/euro-area/consumer-confidence"]
    },
    {
      "id": "eur-business-confidence",
      "currencyCode": "EUR",
      "indicator": "Business Confidence",
      "url": ["https://tradingeconomics.com/euro-area/business-confidence"]
    },
    {
      "id": "eur-cpi",
      "currencyCode": "EUR",
      "indicator": "CPI",
      "url": ["https://tradingeconomics.com/euro-area/consumer-price-index-cpi"]
    },
    {
      "id": "eur-gdp",
      "currencyCode": "EUR",
      "indicator": "GDP Q/Q Annualized",
      "url": ["https://tradingeconomics.com/euro-area/gdp"]
    },
    {
      "id": "eur-unemployment-rate",
      "currencyCode": "EUR",
      "indicator": "Unemployment Rate",
      "url": ["https://tradingeconomics.com/euro-area/unemployment-rate"]
    },
    {
      "id": "eur-employment-change",
      "currencyCode": "EUR",
      "indicator": "Employment Change",
      "url": ["https://tradingeconomics.com/euro-area/employment-change"]
    },
    {
      "id": "eur-money-supply",
      "currencyCode": "EUR",
      "indicator": "Money Supply",
      "url": ["https://tradingeconomics.com/euro-area/money-supply-m2"]
    },
    {
      "id": "eur-job-vacancies",
      "currencyCode": "EUR",
      "indicator": "Job Vacancies",
      "url": ["https://tradingeconomics.com/euro-area/job-vacancies"]
    },

    // --- GBP ---
    {
      "id": "gbp-manufacturing-pmi",
      "currencyCode": "GBP",
      "indicator": "Manufacturing PMI",
      "url": ["https://tradingeconomics.com/united-kingdom/manufacturing-pmi"]
    },
    {
      "id": "gbp-services-pmi",
      "currencyCode": "GBP",
      "indicator": "Services PMI",
      "url": ["https://tradingeconomics.com/united-kingdom/services-pmi"]
    },
    {
      "id": "gbp-consumer-confidence",
      "currencyCode": "GBP",
      "indicator": "Consumer Confidence",
      "url": ["https://tradingeconomics.com/united-kingdom/consumer-confidence"]
    },
    {
      "id": "gbp-business-confidence",
      "currencyCode": "GBP",
      "indicator": "Business Confidence",
      "url": ["https://tradingeconomics.com/united-kingdom/business-confidence"]
    },
    {
      "id": "gbp-cpi",
      "currencyCode": "GBP",
      "indicator": "CPI",
      "url": ["https://tradingeconomics.com/united-kingdom/consumer-price-index-cpi"]
    },
    {
      "id": "gbp-gdp",
      "currencyCode": "GBP",
      "indicator": "GDP Q/Q Annualized",
      "url": ["https://tradingeconomics.com/united-kingdom/gdp"]
    },
    {
      "id": "gbp-unemployment-rate",
      "currencyCode": "GBP",
      "indicator": "Unemployment Rate",
      "url": ["https://tradingeconomics.com/united-kingdom/unemployment-rate"]
    },
    {
      "id": "gbp-money-supply",
      "currencyCode": "GBP",
      "indicator": "Money Supply",
      "url": ["https://tradingeconomics.com/united-kingdom/money-supply-m2"]
    },
    {
      "id": "gbp-employment-change",
      "currencyCode": "GBP",
      "indicator": "Employment Change",
      "url": ["https://tradingeconomics.com/united-kingdom/employment-change"]
    },
    {
      "id": "gbp-job-vacancies",
      "currencyCode": "GBP",
      "indicator": "Job Vacancies",
      "url": ["https://tradingeconomics.com/united-kingdom/job-vacancies"]
    },

    // --- AUD ---
    {
      "id": "aud-manufacturing-pmi",
      "currencyCode": "AUD",
      "indicator": "Manufacturing PMI",
      "url": ["https://tradingeconomics.com/australia/manufacturing-pmi"]
    },
    {
      "id": "aud-services-pmi",
      "currencyCode": "AUD",
      "indicator": "Services PMI",
      "url": ["https://tradingeconomics.com/australia/services-pmi"]
    },
    {
      "id": "aud-consumer-confidence",
      "currencyCode": "AUD",
      "indicator": "Consumer Confidence",
      "url": ["https://tradingeconomics.com/australia/consumer-confidence"]
    },
    {
      "id": "aud-business-confidence",
      "currencyCode": "AUD",
      "indicator": "Business Confidence",
      "url": ["https://tradingeconomics.com/australia/business-confidence"]
    },
    {
      "id": "aud-cpi",
      "currencyCode": "AUD",
      "indicator": "CPI",
      "url": ["https://tradingeconomics.com/australia/consumer-price-index-cpi"]
    },
    {
      "id": "aud-gdp",
      "currencyCode": "AUD",
      "indicator": "GDP Q/Q Annualized",
      "url": ["https://tradingeconomics.com/australia/gdp"]
    },
    {
      "id": "aud-unemployment-rate",
      "currencyCode": "AUD",
      "indicator": "Unemployment Rate",
      "url": ["https://tradingeconomics.com/australia/unemployment-rate"]
    },
    {
      "id": "aud-employment-change",
      "currencyCode": "AUD",
      "indicator": "Employment Change",
      "url": ["https://tradingeconomics.com/australia/employment-change"]
    },
    {
      "id": "aud-job-vacancies",
      "currencyCode": "AUD",
      "indicator": "Job Vacancies",
      "url": ["https://tradingeconomics.com/australia/job-vacancies"]
    },

    // --- NZD ---
    {
      "id": "nzd-business-confidence",
      "currencyCode": "NZD",
      "indicator": "Business Confidence",
      "url": ["https://tradingeconomics.com/new-zealand/business-confidence"]
    },

    // --- CAD ---
    {
      "id": "cad-manufacturing-pmi",
      "currencyCode": "CAD",
      "indicator": "Manufacturing PMI",
      "url": ["https://tradingeconomics.com/canada/manufacturing-pmi"]
    },
    {
      "id": "cad-services-pmi",
      "currencyCode": "CAD",
      "indicator": "Services PMI",
      "url": ["https://tradingeconomics.com/canada/services-pmi"]
    },
    {
      "id": "cad-consumer-confidence",
      "currencyCode": "CAD",
      "indicator": "Consumer Confidence",
      "url": ["https://tradingeconomics.com/canada/consumer-confidence"]
    },
    {
      "id": "cad-business-confidence",
      "currencyCode": "CAD",
      "indicator": "Business Confidence",
      "url": ["https://tradingeconomics.com/canada/business-confidence"]
    },
    {
      "id": "cad-cpi",
      "currencyCode": "CAD",
      "indicator": "CPI",
      "url": ["https://tradingeconomics.com/canada/consumer-price-index-cpi"]
    },
    {
      "id": "cad-gdp",
      "currencyCode": "CAD",
      "indicator": "GDP Q/Q Annualized",
      "url": ["https://tradingeconomics.com/canada/gdp"]
    },
    {
      "id": "cad-unemployment-rate",
      "currencyCode": "CAD",
      "indicator": "Unemployment Rate",
      "url": ["https://tradingeconomics.com/canada/unemployment-rate"]
    },
    {
      "id": "cad-money-supply",
      "currencyCode": "CAD",
      "indicator": "Money Supply",
      "url": ["https://tradingeconomics.com/canada/money-supply-m2"]
    },
    {
      "id": "cad-employment-change",
      "currencyCode": "CAD",
      "indicator": "Employment Change",
      "url": ["https://tradingeconomics.com/canada/employment-change"]
    },
    {
      "id": "cad-job-vacancies",
      "currencyCode": "CAD",
      "indicator": "Job Vacancies",
      "url": ["https://tradingeconomics.com/canada/job-vacancies"]
    },

    // --- JPY ---
    {
      "id": "jpy-manufacturing-pmi",
      "currencyCode": "JPY",
      "indicator": "Manufacturing PMI",
      "url": ["https://tradingeconomics.com/japan/manufacturing-pmi"]
    },
    {
      "id": "jpy-services-pmi",
      "currencyCode": "JPY",
      "indicator": "Services PMI",
      "url": ["https://tradingeconomics.com/japan/services-pmi"]
    },
    {
      "id": "jpy-consumer-confidence",
      "currencyCode": "JPY",
      "indicator": "Consumer Confidence",
      "url": ["https://tradingeconomics.com/japan/consumer-confidence"]
    },
    {
      "id": "jpy-business-confidence",
      "currencyCode": "JPY",
      "indicator": "Business Confidence",
      "url": ["https://tradingeconomics.com/japan/business-confidence"]
    },
    {
      "id": "jpy-cpi",
      "currencyCode": "JPY",
      "indicator": "CPI",
      "url": ["https://tradingeconomics.com/japan/consumer-price-index-cpi"]
    },
    {
      "id": "jpy-gdp",
      "currencyCode": "JPY",
      "indicator": "GDP Q/Q Annualized",
      "url": ["https://tradingeconomics.com/japan/gdp"]
    },
    {
      "id": "jpy-unemployment-rate",
      "currencyCode": "JPY",
      "indicator": "Unemployment Rate",
      "url": ["https://tradingeconomics.com/japan/unemployment-rate"]
    },
    {
      "id": "jpy-money-supply",
      "currencyCode": "JPY",
      "indicator": "Money Supply",
      "url": ["https://tradingeconomics.com/japan/money-supply-m2"]
    },
    {
      "id": "jpy-employment-change",
      "currencyCode": "JPY",
      "indicator": "Employment Change",
      "url": ["https://tradingeconomics.com/japan/employment-change"]
    },
    {
      "id": "jpy-job-vacancies",
      "currencyCode": "JPY",
      "indicator": "Job Vacancies",
      "url": ["https://tradingeconomics.com/japan/job-vacancies"]
    },

    // --- CHF ---
    {
      "id": "chf-manufacturing-pmi",
      "currencyCode": "CHF",
      "indicator": "Manufacturing PMI",
      "url": ["https://tradingeconomics.com/switzerland/manufacturing-pmi"]
    },
    {
      "id": "chf-services-pmi",
      "currencyCode": "CHF",
      "indicator": "Services PMI",
      "url": ["https://tradingeconomics.com/switzerland/services-pmi"]
    },
    {
      "id": "chf-consumer-confidence",
      "currencyCode": "CHF",
      "indicator": "Consumer Confidence",
      "url": ["https://tradingeconomics.com/switzerland/consumer-confidence"]
    },
    {
      "id": "chf-business-confidence",
      "currencyCode": "CHF",
      "indicator": "Business Confidence",
      "url": ["https://tradingeconomics.com/switzerland/business-confidence"]
    },
    {
      "id": "chf-cpi",
      "currencyCode": "CHF",
      "indicator": "CPI",
      "url": ["https://tradingeconomics.com/switzerland/consumer-price-index-cpi"]
    },
    {
      "id": "chf-gdp",
      "currencyCode": "CHF",
      "indicator": "GDP Q/Q Annualized",
      "url": ["https://tradingeconomics.com/switzerland/gdp"]
    },
    {
      "id": "chf-unemployment-rate",
      "currencyCode": "CHF",
      "indicator": "Unemployment Rate",
      "url": ["https://tradingeconomics.com/switzerland/unemployment-rate"]
    },
    {
      "id": "chf-money-supply",
      "currencyCode": "CHF",
      "indicator": "Money Supply",
      "url": ["https://tradingeconomics.com/switzerland/money-supply-m2"]
    },
    {
      "id": "chf-employment-change",
      "currencyCode": "CHF",
      "indicator": "Employment Change",
      "url": ["https://tradingeconomics.com/switzerland/employment-change"]
    },
    {
      "id": "chf-job-vacancies",
      "currencyCode": "CHF",
      "indicator": "Job Vacancies",
      "url": ["https://tradingeconomics.com/switzerland/job-vacancies"]
    },
    
    // --- Retail Sentiment ---
    {
      "id": "usd-retail-sentiment",
      "currencyCode": "USD",
      "indicator": "Retail Sentiment",
      "url": ["https://fxssi.com/tools/current-ratio?filter=EURUSD"]
    },
    {
      "id": "eur-retail-sentiment",
      "currencyCode": "EUR",
      "indicator": "Retail Sentiment",
      "url": ["https://fxssi.com/tools/current-ratio?filter=EURUSD"]
    },
    {
      "id": "gbp-retail-sentiment",
      "currencyCode": "GBP",
      "indicator": "Retail Sentiment",
      "url": ["https://fxssi.com/tools/current-ratio?filter=GBPUSD"]
    },
    {
      "id": "aud-retail-sentiment",
      "currencyCode": "AUD",
      "indicator": "Retail Sentiment",
      "url": ["https://fxssi.com/tools/current-ratio?filter=AUDUSD"]
    },
    {
      "id": "nzd-retail-sentiment",
      "currencyCode": "NZD",
      "indicator": "Retail Sentiment",
      "url": ["https://fxssi.com/tools/current-ratio?filter=NZDUSD"]
    },
    {
      "id": "cad-retail-sentiment",
      "currencyCode": "CAD",
      "indicator": "Retail Sentiment",
      "url": ["https://fxssi.com/tools/current-ratio?filter=USDCAD"]
    },
    {
      "id": "jpy-retail-sentiment",
      "currencyCode": "JPY",
      "indicator": "Retail Sentiment",
      "url": ["https://fxssi.com/tools/current-ratio?filter=USDJPY"]
    },
    {
      "id": "chf-retail-sentiment",
      "currencyCode": "CHF",
      "indicator": "Retail Sentiment",
      "url": ["https://fxssi.com/tools/current-ratio?filter=USDCHF"]
    }
  ]
};