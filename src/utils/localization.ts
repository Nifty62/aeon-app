export const getTranslationKey = (header: string): string => {
    // Sanitize the input to create a consistent key format
    const key = header.toLowerCase().replace(/[\s/().,]+/g, '');

    const keyMap: Record<string, string> = {
        'currency': 'table.header.currency',
        'direction': 'table.header.direction',
        'score': 'table.header.score',
        'basescore': 'table.header.basescore',
        'modifiedscore': 'table.header.modifiedscore',
        'σscore': 'table.header.score',
        'riskmodifier': 'table.header.riskmodifier',
        
        // Groups
        'sentiment': 'indicator.group.sentiment',
        'inflation': 'indicator.group.inflation',
        'labourmarket': 'indicator.group.labourmarket',
        'growth': 'indicator.group.growth',
        'monetary': 'indicator.group.monetary',
        'market': 'indicator.group.market',
        'other': 'indicator.group.other',
        
        // Indicators
        'manufacturingpmi': 'indicator.manufacturingpmi',
        'servicespmi': 'indicator.servicespmi',
        'consumerconfidence': 'indicator.consumerconfidence',
        'businessconfidence': 'indicator.businessconfidence',
        'cpi': 'indicator.cpi',
        'coreppiyoy': 'indicator.coreppiyoy',
        'averagehourlyearningsyoy': 'indicator.averagehourlyearningsyoy',
        'averagemonthlyearnings': 'indicator.averagemonthlyearnings',
        'averageweeklywages': 'indicator.averageweeklywages',
        'averageweeklyearnings': 'indicator.averageweeklyearnings',
        'averagemonthlywages': 'indicator.averagemonthlywages',
        'grossmonthlywage': 'indicator.grossmonthlywage',
        'unemploymentrate': 'indicator.unemploymentrate',
        'employmentchange': 'indicator.employmentchange',
        'jobvacancies': 'indicator.jobvacancies',
        'jobvacancyrate': 'indicator.jobvacancyrate',
        'employmentchange/nfp': 'indicator.employmentchange/nfp',
        'adpemploymentchange': 'indicator.adpemploymentchange',
        'unemploymentclaims': 'indicator.unemploymentclaims',
        'joltsjobopenings': 'indicator.joltsjobopenings',
        'claimantcount': 'indicator.claimantcount',
        'gdpqqannualized': 'indicator.gdpq/qannualized',
        'retailsalesmm': 'indicator.retailsalesm/m',
        'moneysupply': 'indicator.moneysupply',
        'centralbank': 'indicator.centralbank',
        'seasonality': 'indicator.seasonality',
        'cot': 'indicator.cot',
        'retailsentiment': 'indicator.retailsentiment',
        'strongvsweak': 'indicator.strongvsweak',
        'eventmodifiers': 'indicator.eventmodifiers',
        'eventmodifier': 'indicator.eventmodifier',
    };

    return keyMap[key] || header;
};