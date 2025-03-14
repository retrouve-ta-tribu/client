import { FC, useState, useRef, useEffect } from 'react';
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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [newMessage, mockedMessages]);

    const resetInputHeight = () => {
        const input = document.querySelector("textarea");
        if (input) {
            input.style.height = "40px";
        }
    }

    const handleWriteMessage = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewMessage(e.target.value);
        resetInputHeight();
        e.target.style.height = `${e.target.scrollHeight}px`;
    }

    const handleSendMessage = () => {
        console.log(newMessage);
        setNewMessage("");
        resetInputHeight();
    }

    return (
        <>
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-auto no-scrollbar">
                    <div className="flex px-4 flex-col gap-4 w-full">
                        <Message isSent={true} message={{sender: "Vous", content: "Hello"}}/>

                        {mockedMessages.map((message, index) => (
                            <Message key={index} message={message}/>
                        ))}
                        <div ref={messagesEndRef} /> {/* Scroll anchor */}
                    </div>
                </div>
                
                <div className="flex bg-white w-full flex-row pb-8 px-4 gap-4 items-end">
                    <textarea 
                        placeholder="Message" 
                        className="w-full p-2 bg-white border border-gray-300 rounded-md resize-none overflow-auto max-h-32 h-10 no-scrollbar"
                        value={newMessage}
                        onChange={(e) => handleWriteMessage(e)}
                    />

                    <button 
                        onClick={handleSendMessage}
                        className="bg-indigo-500 text-white p-2 w-10 h-10 rounded-md hover:bg-indigo-600 cursor-pointer"
                    >
                        <SendIcon />
                    </button>
                </div>
            </div>
        </>
    );
};

export default Conversation; 