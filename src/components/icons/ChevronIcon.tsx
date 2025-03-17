import { FC } from 'react';

interface ChevronIconProps {
    className?: string;
    direction?: 'up' | 'down' | 'left' | 'right';
}

const ChevronIcon: FC<ChevronIconProps> = ({ className = 'w-6 h-6', direction = 'up' }) => {
    const getPath = () => {
        switch (direction) {
            case 'down':
                return 'M19.5 8.25l-7.5 7.5-7.5-7.5';
            case 'left':
                return 'M15.75 19.5L8.25 12l7.5-7.5';
            case 'right':
                return 'M8.25 4.5l7.5 7.5-7.5 7.5';
            case 'up':
            default:
                return 'M4.5 15.75l7.5-7.5 7.5 7.5';
        }
    };

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={className}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={getPath()}
            />
        </svg>
    );
};

export default ChevronIcon; 