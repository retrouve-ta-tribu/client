import { FC, useState } from 'react';

interface MessageProps {
    children: React.ReactNode;
}

const Message: FC<MessageProps> = ({message, isSent = false}) => {

    return (
        <div className={`flex ${isSent? 'justify-end': 'justify-start'} w-full`}>
            <div className={`${isSent? 'bg-indigo-200': 'bg-gray-200 '} max-w-4/5  p-2 rounded-lg text-wrap break-words flex flex-col`}>
                <span className="font-bold text-sm text-gray-600">{message.sender}</span>
                <span>{message.content}</span>
            </div>
        </div>
    );
};

export default Message; 