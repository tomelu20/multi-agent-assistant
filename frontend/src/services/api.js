const API_URL = 'http://127.0.0.1:8000/api';

export const api = {
    async getChats(userId) {
        const url = userId ? `${API_URL}/chats?user_id=${userId}` : `${API_URL}/chats`;
        const res = await fetch(url);
        return res.json();
    },

    async getChatMessages(chatId) {
        const res = await fetch(`${API_URL}/chats/${chatId}/messages`);
        return res.json();
    },

    async createChat(userId, rawRequest = "Chat Nou") {
        const res = await fetch(`${API_URL}/chats?user_id=${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ raw_request: rawRequest })
        });
        return res.json();
    },

    async sendMessage(chatId, text) {
        const res = await fetch(`${API_URL}/chats/${chatId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ raw_request: text })
        });
        return res.json();
    },

    async approveAction(chatId) {
        const res = await fetch(`${API_URL}/chats/${chatId}/approve`, {
            method: 'POST'
        });
        return res.json();
    },

    async getLogs(chatId) {
        const res = await fetch(`${API_URL}/chats/${chatId}/logs`);
        return res.json();
    }
};