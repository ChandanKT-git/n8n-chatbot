import React from 'react';
import { useChats } from '../../hooks';
import { MessageCircle, Plus, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatListProps {
    selectedChatId?: string;
    onChatSelect: (chatId: string) => void;
    onNewChat: () => void;
}

export function ChatList({ selectedChatId, onChatSelect, onNewChat }: ChatListProps) {
    const { chats, loading, createChat, creating } = useChats();

    const handleNewChat = async () => {
        const chatId = await createChat('New Chat');
        if (chatId) {
            onChatSelect(chatId);
        }
    };

    if (loading) {
        return (
            <div className="w-80 bg-gray-50 border-r border-gray-200 p-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <button
                    onClick={handleNewChat}
                    disabled={creating}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Plus size={20} />
                    {creating ? 'Creating...' : 'New Chat'}
                </button>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
                {chats.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
                        <p>No chats yet</p>
                        <p className="text-sm">Create your first chat to get started</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {chats.map((chat) => {
                            const lastMessage = chat.messages[0];
                            const isSelected = chat.id === selectedChatId;

                            return (
                                <button
                                    key={chat.id}
                                    onClick={() => onChatSelect(chat.id)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors ${isSelected
                                            ? 'bg-blue-100 border-blue-200 border'
                                            : 'hover:bg-gray-100 border border-transparent'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-medium truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'
                                                }`}>
                                                {chat.title}
                                            </h3>

                                            {lastMessage && (
                                                <p className="text-sm text-gray-600 truncate mt-1">
                                                    {lastMessage.is_bot ? '🤖 ' : ''}
                                                    {lastMessage.content}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                <Clock size={12} />
                                                <span>
                                                    {formatDistanceToNow(new Date(chat.updated_at), { addSuffix: true })}
                                                </span>
                                                <span>•</span>
                                                <span>{chat.messages_aggregate.aggregate.count} messages</span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}