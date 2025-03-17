import { FC, useState, useEffect, useRef } from 'react';
import messageChatService from '../../services/messageChatService';
import { ChatMessage, Group } from '../../services/types';
import authService from '../../services/authService';
import Message from './Message';
import SendIcon from '../icons/SendIcon';

interface ConversationProps {
    group: Group;
    setHasUnreadMessage: (hasUnreadMessage: boolean) => void;
}

const Conversation: FC<ConversationProps> = ({ group, setHasUnreadMessage }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentUser = authService.state.profile;

    useEffect(() => {
        const handleMessages = (updatedMessages: ChatMessage[]) => {
            if (messages.length === 0 && updatedMessages.length > 0) {
                setHasUnreadMessage(true);
            }
            setMessages(updatedMessages);
            scrollToBottom();
        };

        messageChatService.joinChat(group._id, currentUser.id);
        messageChatService.addMessageListener(handleMessages);

        return () => {
            messageChatService.removeMessageListener(handleMessages);
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
        if (!newMessage.trim()) return;
        
        messageChatService.sendMessage(
            newMessage.trim(),
            currentUser?.name,
        );
        setNewMessage("");
        resetInputHeight();
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

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
                        {messages.map((message, index) => (
                            <Message 
                                key={`${message.userId}-${message.timestamp}-${index}`}
                                isSent={message.userId === currentUser?.id}
                                message={{
                                    sender: message.userName || 'Unknown',
                                    content: message.content,
                                    time: formatTime(message.timestamp)
                                }}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                
                <div className="flex bg-white w-full flex-row pb-8 px-4 gap-4 items-end">
                    <textarea 
                        placeholder="Message" 
                        className="w-full p-2 bg-white border border-gray-300 rounded-md resize-none overflow-auto max-h-32 h-10 no-scrollbar"
                        value={newMessage}
                        onChange={handleWriteMessage}
                        onKeyDown={handleKeyDown}
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