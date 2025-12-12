import React from 'react';

interface LoadingSpinnerProps {
    size?: number;
    className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 24, className = '' }) => {
    const scale = size / 200; // Original design is 200px

    return (
        <div
            className={`loadingio-spinner-spinner-2by998twmg8 ${className}`}
            style={{ width: size, height: size }}
        >
            <div
                className="ldio-yzaezf3dcmj"
                style={{ transform: `translateZ(0) scale(${scale})` }}
            >
                <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
