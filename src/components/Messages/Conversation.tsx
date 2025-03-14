import { FC, useState, useEffect } from 'react';
import Message from './Message';
import SendIcon from '../icons/SendIcon';

const mockedMessages = [
    {sender: "John Doe", content: "Hello"},
    {sender: "Will", content: "Hello my friend"},
    {sender: "Patrick", content: "I can't see you!"},
    {sender: "Patrick", content: "I can't see you!"},
    {sender: "Patrick", content: "I can't see you!"},
    {sender: "Patrick", content: "I can't see you!"},
    {sender: "Patrick", content: "I can't see you!"},
    {sender: "Patrick", content: "I can't see you!"},
    {sender: "Patrick", content: "I can't see you!"},
    {sender: "Patrick", content: "I can't see you!"},
    {sender: "Patrick", content: "I can't see you!"},
    {sender: "Patrick", content: "I can't see you!"},
    {sender: "Patrick", content: "I can't see you!"},
    {sender: "Patrick", content: "I can't see you!"},
    {sender: "Patrick", content: "I can't see you!"},
    {sender: "Le laitier", content: "Did you install spunk ?"},
    {sender: "Will", content: "OF COURSE !!!!!"},
]

interface ConversationProps {
    children: React.ReactNode;
}

const Conversation: FC<ConversationProps> = () => {
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        const textarea = document.querySelector('textarea');
        if (textarea) {
            textarea.addEventListener('input', () => {
                textarea.style.height = `${textarea.scrollHeight}px`;
            });
        }
    }, [newMessage]);
    

    const handleWriteMessage = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewMessage(e.target.value);
    }

    const handleSendMessage = () => {
        console.log(newMessage);
        setNewMessage("");
    }


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
            
            <div className="flex bg-white w-full flex-row absolute bottom-0 pb-8 px-4 gap-4 items-end">
                <textarea 
                placeholder="Message" 
                className="w-full p-2 bg-white border border-gray-300 rounded-md resize-none overflow-auto max-h-32 h-10 no-scrollbar"
                value={newMessage}
                onChange={(e) => handleWriteMessage(e)}
                />

                <button 
                    className="bg-indigo-500 text-white p-2 w-10 h-10 rounded-md hover:bg-indigo-600 cursor-pointer"
                    onClick={() => handleSendMessage()}
                >
                    <SendIcon />
                </button>
            </div>
        </>
    );
};

export default Conversation; 