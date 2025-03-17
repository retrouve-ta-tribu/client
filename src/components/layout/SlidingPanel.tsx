import { FC, useState } from 'react';
import ChevronIcon from '../icons/ChevronIcon';

interface SlidingPanelProps {
    children: React.ReactNode;
    hasNotification?: boolean;
    setHasNotification?: (hasNotification: boolean) => void;
}

const SlidingPanel: FC<SlidingPanelProps> = ({ children, hasNotification, setHasNotification }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div 
            className={`fixed bottom-0 border-t border-gray-200 left-0 right-0 bg-white transition-all duration-300 ease-in-out h-[80vh] transform ${
                isExpanded 
                    ? 'translate-y-0 shadow-[0_-4rem_12rem_-4rem_rgba(0,0,0,0.5)]' 
                    : 'translate-y-[calc(100%-58px)] shadow-[0_-3rem_3rem_-3rem_rgba(0,0,0,0.25)]'
            }`}
        >
            {hasNotification && !isExpanded && (
                <div className="bg-blue-500 w-4 h-4 rounded-full absolute top-5 left-1/2 -translate-x-8 z-10 animate-pulse"></div>
            )}
                <button
                    onClick={() => {setIsExpanded(!isExpanded); setHasNotification(false);}}
                    className="absolute top-0 left-1/2 -translate-x-1/2 cursor-pointer hover:bg-gray-200 p-4 w-full flex justify-center border-b border-gray-200 bg-white"
            >
                <ChevronIcon 
                    direction={isExpanded ? 'down' : 'up'} 
                    className={`w-6 h-6 transition-transform duration-300`}
                />
            </button>
            
            <div className="pt-16 overflow-y-auto h-full">
                {children}
            </div>
        </div>
    );
};

export default SlidingPanel; 