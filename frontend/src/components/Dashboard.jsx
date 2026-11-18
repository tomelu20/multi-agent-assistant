import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import Calendar from './Calendar';
import { api } from '../services/api';

export default function Dashboard({ route, navigation }) {
    const userName = route?.params?.userName || 'Utilizator';
    const userId = route?.params?.userId;
    const accessToken = route?.params?.accessToken;

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeSection, setActiveSection] = useState('chat');

    const [chatHistory, setChatHistory] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [pendingApproval, setPendingApproval] = useState(false);
    const [executionLogs, setExecutionLogs] = useState([]);

    // 1. Preluare istoric chat-uri la montare
    useEffect(() => {
        if (userId) {
            api.getChats(userId).then(chats => {
                setChatHistory(chats);
                if (chats && chats.length > 0) {
                    setCurrentChatId(chats[0].id);
                }
            }).catch(err => console.error("Eroare preluare chat-uri:", err));
        }
    }, [userId]);

    // 2. Creare chat nou (la click pe "Chat Nou / Workflow")
    const handleNewChat = async () => {
        try {
            const newChat = await api.createChat(userId, "Chat Nou");
            setChatHistory(prev => [newChat, ...prev]);
            setCurrentChatId(newChat.id);
            setMessages([]);
            setPendingApproval(false);
        } catch (err) {
            console.error("Eroare creare chat:", err);
        }
    };

    // 3. Trimitere mesaj (dacă nu e selectat niciun chat, creează unul nou automat)
    const handleSendMessage = async (text, file, agent) => {
        let activeId = currentChatId;

        try {
            // Dacă nu avem un chat selectat, îl creăm acum pe loc cu textul primului mesaj
            if (!activeId) {
                const newChat = await api.createChat(userId, text);
                activeId = newChat.id;
                setCurrentChatId(activeId);
                setChatHistory(prev => [newChat, ...prev]);
            }

            // Adăugăm mesajul utilizatorului în interfață instant
            const userMsg = { sender: 'user', text, file, agent };
            setMessages(prev => [...prev, userMsg]);

            // Apelăm backend-ul pentru trimiterea mesajului
            const response = await api.sendMessage(activeId, text);

            setMessages(prev => [
                ...prev,
                { sender: 'assistant', text: response.reply }
            ]);

            setPendingApproval(response.requiresApproval);

            // Actualizăm titlul în Sidebar dacă s-a generat
            if (response.newTitle) {
                setChatHistory(prev => prev.map(chat =>
                    chat.id === activeId ? { ...chat, title: response.newTitle } : chat
                ));
            }

            // Preluăm logurile de execuție
            const logs = await api.getLogs(activeId);
            setExecutionLogs(logs);

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
                { sender: 'assistant', text: response.message }
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
                    selectChat={setCurrentChatId}
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