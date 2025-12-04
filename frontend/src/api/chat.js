import axios from './axios';

/**
 * Send a chat message
 */
export const sendMessage = async (message) => {
    const response = await axios.post('/chat', { message });
    return response.data;
};

/**
 * Get chat service status
 */
export const getChatStatus = async () => {
    const response = await axios.get('/chat/status');
    return response.data;
};

/**
 * Get suggested questions
 */
export const getSuggestions = async () => {
    const response = await axios.get('/chat/suggestions');
    return response.data;
};

export default {
    sendMessage,
    getChatStatus,
    getSuggestions
};
