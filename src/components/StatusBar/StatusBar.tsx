import React from 'react';
import './StatusBar.css';

interface StatusBarProps {
    message: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ message }) => {
    return (
        <div className="status-bar" role="status" aria-live="polite">
            <div className="spinner"></div>
            <span>{message}</span>
        </div>
    );
};

export default StatusBar;
