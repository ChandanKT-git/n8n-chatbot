import React, { useState } from 'react';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import { MessageCircle } from 'lucide-react';

export function ChatLayout() {
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

    const handleChatSelect = (chatId: string) => {
        setSelectedChatId(chatId);
    };

    const handleNewChat = () => {
        // This will be handled by ChatList component
    };

    return (
        <div className="h-screen flex bg-white">
            {/* Chat List Sidebar */}
            <ChatList
                selectedChatId={selectedChatId || undefined}
                onChatSelect={handleChatSelect}
                onNewChat={handleNewChat}
            />

            {/* Chat Window */}
            {selectedChatId ? (
                <ChatWindow chatId={selectedChatId} />
            ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center text-gray-500">
                        <MessageCircle size={64} className="mx-auto mb-4 opacity-30" />
                        <h2 className="text-xl font-medium mb-2">Welcome to AI Chat</h2>
                        <p className="text-gray-400">Select a chat or create a new one to get started</p>
                    </div>
                </div>
            )}
        </div>
    );
}