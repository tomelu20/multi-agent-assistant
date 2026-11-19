const API_URL = 'http://127.0.0.1:8000/api';
const CALENDAR_API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const buildAuthHeaders = (accessToken, extraHeaders = {}) => {
    const headers = { ...extraHeaders };
    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }
    return headers;
};

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

    async createChat(userId, rawRequest = "Chat Nou", file = null) {
        const res = await fetch(`${API_URL}/chats?user_id=${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ raw_request: rawRequest, file })
        });
        return res.json();
    },

    async sendMessage(chatId, text, file = null) {
        const res = await fetch(`${API_URL}/chats/${chatId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ raw_request: text, file })
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
    },

    async getCalendarEvents(accessToken) {
        const res = await fetch(`${CALENDAR_API_URL}/calendar/events`, {
            headers: buildAuthHeaders(accessToken),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || 'Evenimentele nu au putut fi încărcate.');
        }
        return data;
    },

    async createCalendarEvent(accessToken, eventData) {
        const res = await fetch(`${CALENDAR_API_URL}/calendar/events`, {
            method: 'POST',
            headers: buildAuthHeaders(accessToken, {
                'Content-Type': 'application/json',
            }),
            body: JSON.stringify(eventData),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || 'Evenimentul nu a putut fi salvat.');
        }
        return data;
    },

    async deleteCalendarEvent(accessToken, eventId) {
        const res = await fetch(`${CALENDAR_API_URL}/calendar/events/${eventId}`, {
            method: 'DELETE',
            headers: buildAuthHeaders(accessToken),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || 'Evenimentul nu a putut fi șters.');
        }
        return data;
    }
};