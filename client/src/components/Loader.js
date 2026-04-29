import React from 'react';
import './Loader.css';

export default function Loader({ size = 60 }) {
    const spinnerStyle = {
        width: `${size}px`,
        height: `${size}px`,
        borderWidth: `${Math.max(4, size / 10)}px`
    };

    return (
        <div className="loaderContainer">
            <div className="spinner" style={spinnerStyle}></div>
        </div>
    );
}
