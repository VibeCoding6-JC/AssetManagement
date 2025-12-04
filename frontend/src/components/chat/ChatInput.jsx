import { useState, useRef, useEffect } from 'react';
import { HiPaperAirplane, HiMicrophone, HiXMark } from 'react-icons/hi2';

const ChatInput = ({ onSend, disabled, placeholder = "Ketik pertanyaan Anda..." }) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [message]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSend(message.trim());
            setMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const clearInput = () => {
        setMessage('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.focus();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-end gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-2 shadow-sm">
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={1}
                        className="w-full px-3 py-2 bg-transparent border-none outline-none resize-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 disabled:opacity-50"
                        style={{ maxHeight: '150px' }}
                    />
                    {message && (
                        <button
                            type="button"
                            onClick={clearInput}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <HiXMark className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={!message.trim() || disabled}
                    className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
                >
                    <HiPaperAirplane className="w-5 h-5" />
                </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
                Tekan Enter untuk kirim, Shift+Enter untuk baris baru
            </p>
        </form>
    );
};

export default ChatInput;
