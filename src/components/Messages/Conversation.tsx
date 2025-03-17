import { FC, useState, useEffect, useRef } from 'react';
import locationSharingService from '../../services/locationSharingService';
import { ChatMessage } from '../../services/types';
import authService from '../../services/authService';
import Message from './Message';
import SendIcon from '../icons/SendIcon';

const Conversation: FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentUser = authService.state.profile;

    useEffect(() => {
        const handleMessages = (updatedMessages: ChatMessage[]) => {
            setMessages(updatedMessages);
            scrollToBottom();
        };

        locationSharingService.addChatMessageListener(handleMessages);

        return () => {
            locationSharingService.removeChatMessageListener(handleMessages);
        };
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [newMessage, messages]);

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
        locationSharingService.sendMessage(
            newMessage.trim(),
            currentUser?.name,
            currentUser?.picture,
        );
        setNewMessage("");
        resetInputHeight();
    }

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <div className="flex flex-col h-full">
                <div className="flex-1 flex overflow-auto no-scrollbar justify-end items-end">
                    <div className="flex px-4 flex-col gap-4 w-full">
                        <Message isSent={true} message={{sender: "Vous", content: "Hello", time: "12:00"}}/>

                        {messages.map((message, index) => (
                            <Message key={index} isSent={message.userId === currentUser?.id} message={{sender: message.userName, content: message.content, time: formatTime(message.timestamp)}}/>
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