import { FC, useState } from 'react';
import Message from './Message';

const mockedMessages = [
    {sender: "John Doe", content: "Hello"},
    {sender: "Will", content: "Hello my friend"},
    {sender: "Patrick", content: "I can't see you!"},
    {sender: "Le laitier", content: "Did you install spunk ?"},
    {sender: "Will", content: "OF COURSE !!!!!"},
]

interface ConversationProps {
    children: React.ReactNode;
}

const Conversation: FC<ConversationProps> = () => {

    return (
        <>
            <div className="flex h-full">
                <div className="flex px-4 flex-col gap-4 w-full h-full pb-24 overflow-auto w-full no-scrollbar">

                    <Message isSent={true} message={{sender: "Vous", content: "Hello"}}/>

                    {mockedMessages.map((message, index) => (
                        <Message key={index} message={message}/>
                    ))}
                </div>
            </div>
            <textarea 
                placeholder="Message" 
                className="w-full p-2 bg-white border border-gray-300 rounded-md absolute bottom-8 resize-none overflow-auto max-h-32 h-10 no-scrollbar"
                onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = `${target.scrollHeight}px`;
                }}
            />
        </>
    );
};

export default Conversation; 