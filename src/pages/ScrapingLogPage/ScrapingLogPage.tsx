import React from 'react';
import './ScrapingLogPage.css';

interface ScrapingLogPageProps {
    log: string;
}

const ScrapingLogPage: React.FC<ScrapingLogPageProps> = ({ log }) => {
    // Calculate the number of failures by counting occurrences of "Status: FAILURE"
    const failureCount = (log.match(/Status: FAILURE/g) || []).length;

    return (
        <div className="scraping-log-page">
            <header className="log-header">
                <h2>Scraping Log</h2>
                <p>Displays the detailed log from the last analysis run, showing which URLs were fetched and what content was retrieved or if an error occurred.</p>
                <p className={`log-failure-summary ${failureCount > 0 ? 'has-failures' : ''}`}>
                    {failureCount} failure{failureCount === 1 ? '' : 's'} found in this log.
                </p>
            </header>
            <div className="log-content-container">
                <pre className="log-content">
                    <code>{log || 'No analysis has been run yet in this session.'}</code>
                </pre>
            </div>
        </div>
    );
};

export default ScrapingLogPage;