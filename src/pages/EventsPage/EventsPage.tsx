import React, { useState } from 'react';
import type { AnalysisData, EventModifier } from '../../types';
import { useLocalization } from '../../context/LocalizationContext';
import currencies from '../../data/currencies';
import './EventsPage.css';

interface EventsPageProps {
    analysisData: AnalysisData;
}

const EventsPage: React.FC<EventsPageProps> = ({ analysisData }) => {
    const { t } = useLocalization();
    const [selectedCurrency, setSelectedCurrency] = useState(currencies[0].code);

    const currentRecap = analysisData[selectedCurrency]?.recap;
    const eventModifiers = currentRecap?.eventModifiers || [];

    return (
        <div className="events-page">
            <header className="page-header">
                <h2>Event Modifier Analysis</h2>
                <p>Review the recent news events and their potential market impact as identified by the AI in the economic recap.</p>
            </header>
            <div className="currency-selector">
                {currencies.map(c => (
                    <button
                        key={c.code}
                        className={`currency-selector-button ${selectedCurrency === c.code ? 'active' : ''}`}
                        onClick={() => setSelectedCurrency(c.code)}
                    >
                        <span role="img" aria-label={`${c.code} flag`}>{c.flag}</span>
                        {c.code}
                    </button>
                ))}
            </div>
            <div className="events-content-area">
                {!currentRecap ? (
                    <div className="placeholder">
                        <p>{t('analysisModal.eventModifier.noRecap')}</p>
                    </div>
                ) : eventModifiers.length > 0 ? (
                    <div className="event-modifiers-list">
                        {eventModifiers.map((event: EventModifier, i: number) => (
                            <div className="event-modifier-item" key={i}>
                                <div className="event-modifier-header">
                                    <h4>{event.heading}<span className="event-date">{event.date}</span></h4>
                                    <span className={`event-flag flag-${event.flag.toLowerCase().replace(' ', '-')}`}>{event.flag}</span>
                                </div>
                                <p>{event.description}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="placeholder">
                        <p>No significant recent events were identified by the AI for {selectedCurrency}.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventsPage;