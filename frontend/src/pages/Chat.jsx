import { useState, useEffect, useRef } from 'react';
import { HiSparkles, HiTrash, HiArrowPath } from 'react-icons/hi2';
import { ChatMessage, ChatInput, ChatSuggestions } from '../components/chat';
import { sendMessage, getSuggestions, getChatStatus } from '../api/chat';
import toast from 'react-hot-toast';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState({ configured: false, rateLimit: { remaining: 15 } });
    const messagesEndRef = useRef(null);

    // Load initial data
    useEffect(() => {
        loadSuggestions();
        loadStatus();
        
        // Load messages from localStorage
        const savedMessages = localStorage.getItem('chat_messages');
        if (savedMessages) {
            try {
                setMessages(JSON.parse(savedMessages));
            } catch (e) {
                console.error('Failed to load saved messages');
            }
        }
    }, []);

    // Save messages to localStorage
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('chat_messages', JSON.stringify(messages.slice(-50))); // Keep last 50
        }
    }, [messages]);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadSuggestions = async () => {
        try {
            const response = await getSuggestions();
            if (response.success) {
                setSuggestions(response.data);
            }
        } catch (error) {
            console.error('Failed to load suggestions:', error);
        }
    };

    const loadStatus = async () => {
        try {
            const response = await getChatStatus();
            if (response.success) {
                setStatus(response.data);
            }
        } catch (error) {
            console.error('Failed to load status:', error);
        }
    };

    const handleSendMessage = async (message) => {
        // Add user message
        const userMessage = {
            id: Date.now(),
            content: message,
            isUser: true,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await sendMessage(message);
            
            if (response.success) {
                const aiMessage = {
                    id: Date.now() + 1,
                    content: response.data.message,
                    isUser: false,
                    timestamp: new Date().toISOString(),
                    type: response.data.type,
                    query: response.data.query,
                    explanation: response.data.explanation
                };
                setMessages(prev => [...prev, aiMessage]);
                
                // Update remaining rate limit
                if (response.remaining !== undefined) {
                    setStatus(prev => ({
                        ...prev,
                        rateLimit: { ...prev.rateLimit, remaining: response.remaining }
                    }));
                }
            } else {
                throw new Error(response.message || 'Failed to get response');
            }
        } catch (error) {
            console.error('Chat error:', error);
            
            let errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';
            if (error.response?.status === 429) {
                errorMessage = error.response.data.message || 'Terlalu banyak permintaan. Silakan tunggu sebentar.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            const errorResponse = {
                id: Date.now() + 1,
                content: errorMessage,
                isUser: false,
                timestamp: new Date().toISOString(),
                type: 'error'
            };
            setMessages(prev => [...prev, errorResponse]);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([]);
        localStorage.removeItem('chat_messages');
        toast.success('Riwayat chat dihapus');
    };

    const welcomeMessage = {
        id: 'welcome',
        content: `Halo! 👋 Saya adalah asisten AI yang dapat membantu Anda mencari informasi tentang data asset IT.

Anda bisa bertanya dalam bahasa Indonesia, misalnya:
• "Berapa total asset yang tersedia?"
• "Daftar asset yang sedang dalam perbaikan"
• "Berapa nilai total asset kategori Laptop?"

Silakan ajukan pertanyaan Anda! 🚀`,
        isUser: false,
        timestamp: new Date().toISOString(),
        type: 'general'
    };

    const displayMessages = messages.length === 0 ? [welcomeMessage] : messages;

    return (
        <div className="flex flex-col h-[calc(100vh-120px)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <HiSparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">AI Chat Assistant</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Powered by Gemini 2.0 Flash • {status.rateLimit?.remaining || 0} requests tersisa
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={loadStatus}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Refresh status"
                    >
                        <HiArrowPath className="w-5 h-5" />
                    </button>
                    <button
                        onClick={clearChat}
                        className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Hapus riwayat"
                    >
                        <HiTrash className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 dark:border-gray-700">
                {displayMessages.map((msg) => (
                    <ChatMessage
                        key={msg.id}
                        message={msg.content}
                        isUser={msg.isUser}
                        timestamp={msg.timestamp}
                        type={msg.type}
                        query={msg.query}
                    />
                ))}
                
                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex justify-start mb-4">
                        <div className="flex items-end gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <HiSparkles className="w-5 h-5 text-white animate-pulse" />
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-md">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 0 && (
                <ChatSuggestions
                    suggestions={suggestions}
                    onSelect={handleSendMessage}
                    disabled={isLoading}
                />
            )}

            {/* Input */}
            <ChatInput
                onSend={handleSendMessage}
                disabled={isLoading || !status.configured}
                placeholder={
                    !status.configured 
                        ? "AI tidak tersedia..." 
                        : isLoading 
                            ? "Menunggu response..." 
                            : "Ketik pertanyaan Anda..."
                }
            />
        </div>
    );
};

export default Chat;
