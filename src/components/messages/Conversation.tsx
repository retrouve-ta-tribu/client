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
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
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

        const handleTypingUsers = (users: string[]) => {
            setTypingUsers(users.filter(name => name !== currentUser?.name));
        };

        messageChatService.joinChat(group._id, currentUser.id);
        messageChatService.addMessageListener(handleMessages);
        messageChatService.addTypingListener(handleTypingUsers);

        return () => {
            messageChatService.removeMessageListener(handleMessages);
            messageChatService.removeTypingListener(handleTypingUsers);
            messageChatService.leaveChat();
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
        const content = e.target.value;
        setNewMessage(content);
        resetInputHeight();
        e.target.style.height = `${e.target.scrollHeight}px`;
        
        messageChatService.setTyping(content.trim().length > 0, currentUser?.name);
    }

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        
        messageChatService.setTyping(false, currentUser?.name);
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
                <div className="block h-full no-scrollbar overflow-auto justify-end items-end">
                    <div className="flex px-4 flex-col gap-4 w-full h-fit-content">
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
                        {typingUsers.length > 0 && (
                            <div className="text-sm text-gray-500 italic">
                                {typingUsers.length === 1 
                                    ? `${typingUsers[0]} est en train d'écrire...`
                                    : `${typingUsers.join(', ')} sont en train d'écrire...`}
                            </div>
                        )}
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
                        className="bg-blue-500 text-white p-2 w-10 h-10 rounded-md hover:bg-blue-600 cursor-pointer"
                    >
                        <SendIcon />
                    </button>
                </div>
            </div>
        </>
    );
};

export default Conversation; 