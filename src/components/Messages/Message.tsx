import { FC, useState } from 'react';

/**
 * Props for the Message component that displays a single chat message
 * @property isSent - Whether the message was sent by the current user
 * @property message - The message data object
 * @property message.sender - Name of the message sender
 * @property message.content - Content of the message
 * @property message.time - Optional timestamp of the message
 */
interface MessageProps {
    isSent: boolean; // describe if the message is considered as sent or received
    message: {
        sender: string;
        content: string;
        time?: string;
    };
}

const Message: FC<MessageProps> = ({message, isSent = false}) => {

    return (
        <div className={`flex ${isSent? 'justify-end': 'justify-start'} w-full`}>
            <div className={`${isSent? 'bg-indigo-200': 'bg-gray-200 '} max-w-4/5 gap-0.5 p-2 rounded-lg text-wrap break-words flex flex-col`}>
                <span className="font-bold text-sm text-gray-600">{message.sender}</span>
                <span>{message.content}</span>
                {message.time &&  <span className="text-xs text-gray-500 w-full text-right">{message.time}</span>}
            </div>
        </div>
    );
};

export default Message; 