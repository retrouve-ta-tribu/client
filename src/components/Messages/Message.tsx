import { FC, useState } from 'react';

interface MessageProps {
    children: React.ReactNode;
}

const Message: FC<MessageProps> = ({message}) => {

    return (
        <div className="flex w-full">
            <div className="max-w-4/5 bg-gray-200 p-2 rounded-lg text-wrap break-words flex flex-col">
                <span className="font-bold text-sm text-gray-500">{message.sender}</span>
                <span>{message.content}</span>
            </div>
        </div>
    );
};

export default Message; 