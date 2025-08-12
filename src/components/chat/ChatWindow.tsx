import React, { useState, useRef, useEffect } from 'react';
import { useMessages } from '../../hooks';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatWindowProps {
    chatId: string;
}

export function ChatWindow({ chatId }: ChatWindowProps) {
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { messages, loading, sending, sendMessage, sendMessageWithAI, subscriptionState, refetch } = useMessages(chatId);

    // Debug subscription and messages
    console.log('Subscription state:', subscriptionState);
    console.log('Messages count:', messages.length);
    console.log('All messages:', messages);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || sending) return;

        const userMessage = message.trim();
        setMessage('');

        console.log('Sending user message:', userMessage);

        // Send user message first
        const success = await sendMessage(userMessage, false);
        console.log('User message sent successfully:', success);

        if (success) {
            // Then send to AI for response
            console.log('Sending to AI...');
            const aiSuccess = await sendMessageWithAI(userMessage);
            console.log('AI message sent successfully:', aiSuccess);

            if (aiSuccess) {
                // The AI Action should return the actual AI message
                // Let's check what the AI response contains
                console.log('AI call successful, checking for AI message in response...');

                // Force refetch messages to get the AI response
                console.log('Refetching messages to get AI response...');
                setTimeout(async () => {
                    // Small delay to ensure AI message is saved
                    await refetch();
                    console.log('Messages refetched!');
                }, 3000); // Increased delay to 3 seconds
            }
        } else {
            console.error('Failed to send user message, not sending to AI');
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin mx-auto mb-4" size={32} />
                    <p className="text-gray-600">Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <Bot size={48} className="mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                            <p>Send a message to begin chatting with AI</p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-3 ${msg.is_bot ? 'justify-start' : 'justify-end'}`}
                        >
                            {msg.is_bot && (
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Bot size={16} className="text-blue-600" />
                                    </div>
                                </div>
                            )}

                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.is_bot
                                ? 'bg-gray-100 text-gray-900'
                                : 'bg-blue-600 text-white'
                                }`}>
                                <p className="text-sm">{msg.content}</p>
                                <p className={`text-xs mt-1 ${msg.is_bot ? 'text-gray-500' : 'text-blue-100'
                                    }`}>
                                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                </p>
                            </div>

                            {!msg.is_bot && (
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                        <User size={16} className="text-white" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}

                {sending && (
                    <div className="flex gap-3 justify-start">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Bot size={16} className="text-blue-600" />
                            </div>
                        </div>
                        <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-sm">AI is thinking...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        disabled={sending}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || sending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        {sending ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Send size={16} />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}