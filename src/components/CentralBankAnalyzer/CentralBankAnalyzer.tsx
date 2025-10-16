import React, { useState, useEffect } from 'react';
import { analyzeCentralBank } from '../../ai.ts';
import type { Score, ApiKey, AIModelSettings } from '../../types.ts';
import './CentralBankAnalyzer.css';
import { useLocalization } from '../../context/LocalizationContext.tsx';

interface CentralBankAnalyzerProps {
    currencyCode: string;
    apiKey: ApiKey;
    aiModelSettings: AIModelSettings;
    onUpdateScore: (score: Score) => void;
    configuredUrls: string[];
}

const CentralBankAnalyzer: React.FC<CentralBankAnalyzerProps> = ({ currencyCode, apiKey, aiModelSettings, onUpdateScore, configuredUrls }) => {
    const { t } = useLocalization();
    const [urls, setUrls] = useState<string[]>(configuredUrls);
    const [files, setFiles] = useState<File[]>([]);
    const [currentUrl, setCurrentUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<Score | null>(null);
    const [userHasOverridden, setUserHasOverridden] = useState(false);

    useEffect(() => {
        // Reset state when the modal is opened for a new currency/analysis,
        // pre-populating with the default configured URLs.
        setUrls(configuredUrls);
        setFiles([]);
        setUserHasOverridden(false);
        setCurrentUrl('');
        setResult(null);
        setError(null);
    }, [configuredUrls, currencyCode]);

    const handleAddUrl = () => {
        if (currentUrl) {
            try {
                new URL(currentUrl); // Validate URL format
                if (!userHasOverridden) {
                    // First user-added URL overrides the default configured ones.
                    setUrls([currentUrl]);
                    setUserHasOverridden(true);
                } else if (!urls.includes(currentUrl)) {
                    // Subsequent additions append to the user's list.
                    setUrls([...urls, currentUrl]);
                }
                setCurrentUrl('');
            } catch (_) {
                alert('Please enter a valid URL.');
            }
        }
    };

    const handleRemoveUrl = (index: number) => {
        setUrls(urls.filter((_, i) => i !== index));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files);

            if (!userHasOverridden) {
                // First file upload overrides default URLs.
                setUrls([]);
                setUserHasOverridden(true);
            }

            // Filter out files that are already added to avoid duplicates
            const uniqueNewFiles = newFiles.filter((newFile: File) =>
                !files.some((existingFile: File) => existingFile.name === newFile.name && existingFile.size === newFile.size)
            );
            setFiles([...files, ...uniqueNewFiles]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleAnalyze = async () => {
        if (urls.length === 0 && files.length === 0) {
            alert('Please add at least one URL or file to analyze.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const analysisResult = await analyzeCentralBank(currencyCode, apiKey, aiModelSettings, urls, files);
            setResult(analysisResult);
            onUpdateScore(analysisResult);
        } catch (err) {
            setError(t('centralBank.error'));
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreColorClass = (score: number | undefined): string => {
        if (score === undefined) return '';
        if (score > 1) return 'score-plus-2';
        if (score > 0) return 'score-plus-1';
        if (score > -1) return 'score-zero';
        if (score > -2) return 'score-minus-1';
        return 'score-minus-2';
    };

    return (
        <div className="central-bank-analyzer">
            <h3>{t('centralBank.title', { currencyCode })}</h3>
            <p className="description">{t('centralBank.description')}</p>

            <div className="source-input-area">
                <div className="url-input-group">
                    <input
                        type="url"
                        value={currentUrl}
                        onChange={(e) => setCurrentUrl(e.target.value)}
                        placeholder={t('centralBank.urlPlaceholder')}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddUrl(); }}}
                    />
                    <button onClick={handleAddUrl} disabled={!currentUrl}>{t('centralBank.addUrlButton')}</button>
                </div>

                <label className="file-upload-button">
                    {t('centralBank.uploadButton')}
                    <input
                        type="file"
                        multiple
                        accept=".pdf,.txt"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </label>
            </div>

            {(urls.length > 0 || files.length > 0) && (
                <div className="source-list-container">
                    <h4>{t('centralBank.sourcesTitle')}</h4>
                    <ul className="source-list">
                        {urls.map((url, index) => (
                            <li key={`url-${index}`}>
                                <span className="source-name">{url}</span>
                                <button className="remove-source-button" onClick={() => handleRemoveUrl(index)}>&times;</button>
                            </li>
                        ))}
                        {files.map((file, index) => (
                            <li key={`file-${index}`}>
                                <span className="source-name">{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                                <button className="remove-source-button" onClick={() => handleRemoveFile(index)}>&times;</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <button className="analyze-sources-button" onClick={handleAnalyze} disabled={isLoading || (urls.length === 0 && files.length === 0)}>
                {isLoading ? t('centralBank.analyzingButton') : t('centralBank.analyzeButton')}
            </button>

            {error && <div className="analysis-error">{error}</div>}

            {result && (
                <div className="analysis-result">
                    <h4>{t('centralBank.resultTitle')}</h4>
                    <div className="ai-reco">
                        <span className={`score-badge ${getScoreColorClass(result.score)}`}>{result.score}</span>
                        <p>{result.rationale}</p>
                    </div>
                    <div className="detail-section">
                        <h4>{t('centralBank.evidenceTitle')}</h4>
                        <p className="raw-data">{result.rawData}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CentralBankAnalyzer;