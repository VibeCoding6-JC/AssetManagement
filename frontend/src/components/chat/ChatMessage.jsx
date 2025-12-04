import { HiUser, HiSparkles, HiDatabase, HiExclamationCircle } from 'react-icons/hi2';
import dayjs from 'dayjs';

const ChatMessage = ({ message, isUser, timestamp, type, query }) => {
    const formatTime = (time) => {
        return dayjs(time).format('HH:mm');
    };

    if (isUser) {
        return (
            <div className="flex justify-end mb-4">
                <div className="flex items-end gap-2 max-w-[80%]">
                    <div className="flex flex-col items-end">
                        <div className="bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-br-md">
                            <p className="text-sm whitespace-pre-wrap">{message}</p>
                        </div>
                        <span className="text-xs text-gray-400 mt-1">{formatTime(timestamp)}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <HiUser className="w-5 h-5 text-white" />
                    </div>
                </div>
            </div>
        );
    }

    // AI Response
    return (
        <div className="flex justify-start mb-4">
            <div className="flex items-end gap-2 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <HiSparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                    <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-md">
                        {type === 'error' ? (
                            <div className="flex items-start gap-2 text-red-600 dark:text-red-400">
                                <HiExclamationCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <p className="text-sm whitespace-pre-wrap">{message}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{message}</p>
                        )}
                        
                        {/* Show query info for database responses */}
                        {type === 'database' && query && (
                            <details className="mt-3 text-xs">
                                <summary className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1">
                                    <HiDatabase className="w-3 h-3" />
                                    Lihat Query
                                </summary>
                                <pre className="mt-2 p-2 bg-gray-200 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400 overflow-x-auto">
                                    {query}
                                </pre>
                            </details>
                        )}
                    </div>
                    <span className="text-xs text-gray-400 mt-1">{formatTime(timestamp)}</span>
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;
