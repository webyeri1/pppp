import React from 'react';

interface SpinnerProps {
    small?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ small = false }) => {
    const sizeClasses = small ? 'w-4 h-4' : 'w-6 h-6';
    return (
        <div className={`${sizeClasses} border-2 border-dashed rounded-full animate-spin border-indigo-600`}></div>
    );
};

export default Spinner;