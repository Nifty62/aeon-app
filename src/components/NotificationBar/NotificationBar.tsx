import React from 'react';
import './NotificationBar.css';

interface NotificationBarProps {
    message: string;
    onConfirm: () => void;
    onDismiss: () => void;
}

const NotificationBar: React.FC<NotificationBarProps> = ({ message, onConfirm, onDismiss }) => {
    return (
        <div className="notification-bar" role="alert">
            <p className="notification-message">{message}</p>
            <div className="notification-actions">
                <button onClick={onConfirm} className="notification-button confirm">Yes</button>
                <button onClick={onDismiss} className="notification-button dismiss">No</button>
            </div>
        </div>
    );
};

export default NotificationBar;