import { HiLightBulb } from 'react-icons/hi2';

const ChatSuggestions = ({ suggestions, onSelect, disabled }) => {
    if (!suggestions || suggestions.length === 0) return null;

    return (
        <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                <HiLightBulb className="w-4 h-4" />
                <span>Coba tanyakan:</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        onClick={() => onSelect(suggestion)}
                        disabled={disabled}
                        className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ChatSuggestions;
