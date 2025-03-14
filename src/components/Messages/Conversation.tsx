import { FC, useState } from 'react';
import Message from './Message';

interface ConversationProps {
    children: React.ReactNode;
}

const Conversation: FC<ConversationProps> = () => {

    return (
        <div className="flex flex-col px-4 gap-4">
        <Message message={{sender: "John Doe", content: "Hello"}}/>
        <Message message={{sender: "Jane", content: "Hello my friend"}}/>
        <Message message={{sender: "Will", content: "Hello my friend Hello my friend Hello my friend Hello my friend Hello my friend Hello my friend Hello my friend Hello my friend Hello my friend Hello my friend "}}/>
        <Message message={{sender: "Kaarththigan", content: "Hello00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"}}/>
        </div>
    );
};

export default Conversation; 