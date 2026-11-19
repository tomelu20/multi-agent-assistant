import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import Calendar from './Calendar';
import { api } from '../services/api';

const STORAGE_USER_ID_KEY = 'productivity_assistant_user_id';
const STORAGE_USER_NAME_KEY = 'productivity_assistant_user_name';

export default function Dashboard({ route, navigation }) {
    const paramUserId = route?.params?.userId;
    const paramUserName = route?.params?.userName;
    const accessToken = route?.params?.accessToken;

    const [userId, setUserId] = useState(() => {
        if (paramUserId) return paramUserId;
        try {
            return typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_USER_ID_KEY) : null;
        } catch (_) {
            return null;
        }
    });

    const [userName, setUserName] = useState(() => {
        if (paramUserName) return paramUserName;
        try {
            return (typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_USER_NAME_KEY)) || 'Utilizator';
        } catch (_) {
            return 'Utilizator';
        }
    });

    useEffect(() => {
        if (paramUserId) {
            setUserId(paramUserId);
            try {
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(STORAGE_USER_ID_KEY, String(paramUserId));
                }
            } catch (_) {}
        }
        if (paramUserName) {
            setUserName(paramUserName);
            try {
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(STORAGE_USER_NAME_KEY, String(paramUserName));
                }
            } catch (_) {}
        }
    }, [paramUserId, paramUserName]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeSection, setActiveSection] = useState('chat');

    const [chatHistory, setChatHistory] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [isDraftChat, setIsDraftChat] = useState(false);
    const [messages, setMessages] = useState([]);
    const [pendingApproval, setPendingApproval] = useState(false);
    const [executionLogs, setExecutionLogs] = useState([]);

    const loadChatSession = useCallback(async (chatId) => {
        if (!chatId) {
            setCurrentChatId(null);
            setIsDraftChat(false);
            setMessages([]);
            setPendingApproval(false);
            setExecutionLogs([]);
            return;
        }

        setCurrentChatId(chatId);
        setIsDraftChat(false);

        try {
            const data = await api.getChatMessages(chatId);
            if (data && Array.isArray(data.messages)) {
                setMessages(data.messages);
            } else {
                setMessages([]);
            }
            setPendingApproval(Boolean(data?.requiresApproval));

            const logs = await api.getLogs(chatId);
            setExecutionLogs(Array.isArray(logs) ? logs : []);
        } catch (err) {
            console.error("Eroare încărcare istoric chat:", err);
        }
    }, []);

    // 1. Preluare istoric chat-uri la montare și încărcarea primului chat dacă există
    useEffect(() => {
        api.getChats(userId).then(chats => {
            const list = Array.isArray(chats) ? chats : [];
            setChatHistory(list);
            if (list.length > 0) {
                if (list[0].user_id) {
                    setUserId(list[0].user_id);
                    try {
                        if (typeof window !== 'undefined') {
                            window.localStorage.setItem(STORAGE_USER_ID_KEY, String(list[0].user_id));
                        }
                    } catch (_) {}
                }
                loadChatSession(list[0].id);
            }
        }).catch(err => console.error("Eroare preluare chat-uri:", err));
    }, [userId, loadChatSession]);

    // 2. Creare chat nou (la click pe "Chat Nou / Workflow") — rămâne pe același draft gol dacă nu s-a scris nimic
    const handleNewChat = () => {
        if (isDraftChat && messages.length === 0) {
            setCurrentChatId(null);
            setMessages([]);
            setPendingApproval(false);
            setExecutionLogs([]);
            return;
        }
        setCurrentChatId(null);
        setIsDraftChat(true);
        setMessages([]);
        setPendingApproval(false);
        setExecutionLogs([]);
    };

    // 3. Trimitere mesaj / document (păstrează fișierul ca obiect file în istoric, fără răspuns automat când este doar fișier)
    const handleSendMessage = async (text, file, agent) => {
        let activeId = currentChatId;
        const cleanText = (text && text.trim()) ? text.trim() : '';
        const normalizedFile = file && file.name
            ? {
                name: file.name,
                ext: file.ext || (file.name.includes('.') ? file.name.split('.').pop().toUpperCase() : 'FILE'),
                size: file.size || 0,
                source: file.source || 'local'
            }
            : null;
        const topicFallback = cleanText || (normalizedFile ? normalizedFile.name : '');

        try {
            if (!activeId) {
                const newChat = await api.createChat(userId, topicFallback, normalizedFile);
                activeId = newChat.id;
                setCurrentChatId(activeId);
                setIsDraftChat(false);
                setChatHistory(prev => [newChat, ...prev]);
            }

            const userMsg = { sender: 'user', text: cleanText, file: normalizedFile, agent };
            setMessages(prev => [...prev, userMsg]);

            const response = await api.sendMessage(activeId, cleanText, normalizedFile);

            if (!normalizedFile && response?.reply) {
                setMessages(prev => [
                    ...prev,
                    { sender: 'assistant', text: response.reply, file: null }
                ]);
                setPendingApproval(Boolean(response?.requiresApproval));
            } else {
                setPendingApproval(false);
            }

            if (response?.newTitle) {
                setChatHistory(prev => prev.map(chat =>
                    chat.id === activeId ? { ...chat, title: response.newTitle } : chat
                ));
            }

            const logs = await api.getLogs(activeId);
            setExecutionLogs(Array.isArray(logs) ? logs : []);

        } catch (err) {
            console.error("Eroare trimitere mesaj:", err);
        }
    };

    // 4. Aprobare umană (Human-in-the-Loop)
    const handleApprove = async () => {
        if (!currentChatId) return;
        try {
            const response = await api.approveAction(currentChatId);
            setPendingApproval(false);
            setMessages(prev => [
                ...prev,
                { sender: 'assistant', text: response.message, file: null }
            ]);
        } catch (err) {
            console.error("Eroare aprobare:", err);
        }
    };

    const handleLogout = () => {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topNav}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity style={styles.menuToggleBtn} onPress={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <Ionicons name="menu-outline" size={20} color="#f8fafc" />
                    </TouchableOpacity>
                    <View style={styles.navBrand}>
                        <Ionicons name="sparkles" size={18} color="#818cf8" />
                        <Text style={styles.navTitle}>Productivity Assistant</Text>
                    </View>
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <View style={styles.userBadge}>
                        <Ionicons name="person-circle-outline" size={18} color="#94a3b8" />
                        <Text style={styles.userBadgeText}>Salut, {userName}</Text>
                    </View>
                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={16} color="#ef4444" />
                        <Text style={styles.logoutText}>Deconectare</Text>
                    </TouchableOpacity>
                </div>
            </View>

            <View style={styles.mainLayout}>
                <Sidebar
                    isOpen={isSidebarOpen}
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                    chatHistory={chatHistory}
                    selectChat={loadChatSession}
                    currentChatId={currentChatId}
                    onNewChat={handleNewChat}
                />

                {activeSection === 'chat' && (
                    <ChatArea
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        pendingApproval={pendingApproval}
                        onApprove={handleApprove}
                    />
                )}

                {activeSection === 'calendar' && (
                    <Calendar userId={userId} accessToken={accessToken} />
                )}

                {activeSection === 'logs' && (
                    <View style={styles.contentSection}>
                        <Text style={styles.sectionTitle}>Jurnal de Execuție (Execution Logs)</Text>
                        <Text style={styles.sectionSub}>Istoricul acțiunilor fiecărui agent specializat.</Text>
                        {executionLogs.map((log, index) => (
                            <View key={index} style={styles.logCard}>
                                <Text style={styles.logText}>Agent: {log.agent_name} | Tool: {log.tool_name}</Text>
                                <Text style={styles.logSubText}>Status: {log.success ? 'Succes' : 'Eșuat'} ({log.timestamp})</Text>
                            </View>
                        ))}
                    </View>
                )}

                {activeSection === 'tasks' && (
                    <View style={styles.contentSection}>
                        <Text style={styles.sectionTitle}>Task-uri & Note</Text>
                        <Text style={styles.sectionSub}>Sarcini extrase automat din note și documente.</Text>
                    </View>
                )}

                {activeSection === 'memory' && (
                    <View style={styles.contentSection}>
                        <Text style={styles.sectionTitle}>Memorie & Preferințe Utilizator</Text>
                        <Text style={styles.sectionSub}>Controlul pe termen lung și scurt al memoriei.</Text>
                    </View>
                )}

                {activeSection === 'metrics' && (
                    <View style={styles.contentSection}>
                        <Text style={styles.sectionTitle}>Metrici de Evaluare (Evaluation Plan)</Text>
                        <Text style={styles.sectionSub}>Rate de succes, latență, costuri model și eficiență.</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#030712' },
    topNav: { height: 56, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#1e293b', backgroundColor: '#0b0f19' },
    menuToggleBtn: { width: 34, height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
    navBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    navTitle: { fontSize: 15, fontWeight: '700', color: '#f8fafc' },
    userBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    userBadgeText: { fontSize: 13, color: '#cbd5e1', fontWeight: '500' },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: 'rgba(239, 68, 68, 0.1)' },
    logoutText: { fontSize: 12, color: '#ef4444', fontWeight: '600' },
    mainLayout: { flex: 1, flexDirection: 'row' },
    contentSection: { flex: 1, padding: 32, backgroundColor: '#030712', gap: 8 },
    sectionTitle: { fontSize: 22, fontWeight: '700', color: '#f8fafc' },
    sectionSub: { fontSize: 14, color: '#94a3b8' },
    logCard: { backgroundColor: '#0b0f19', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1e293b', marginTop: 8 },
    logText: { color: '#818cf8', fontSize: 13, fontWeight: '600' },
    logSubText: { color: '#94a3b8', fontSize: 11, marginTop: 4 }
});