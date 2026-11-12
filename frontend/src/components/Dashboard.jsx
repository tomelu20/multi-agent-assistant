import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';

export default function Dashboard({ route, navigation }) {
    const userName = route?.params?.userName || 'Utilizator';
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeSection, setActiveSection] = useState('chat');

    const [chatHistory, setChatHistory] = useState([
        { id: 1, title: 'Planificare zi de mâine & Teză' },
        { id: 2, title: 'Sincronizare Calendar & Notițe' }
    ]);
    const [currentChatId, setCurrentChatId] = useState(1);
    const [messages, setMessages] = useState([]);
    const [pendingApproval, setPendingApproval] = useState(false);

    const handleSendMessage = (text, file, agent) => {
        const newMsg = { sender: 'user', text, file, agent };
        setMessages(prev => [...prev, newMsg]);

        setTimeout(() => {
            setMessages(prev => [
                ...prev,
                {
                    sender: 'assistant',
                    text: `[${agent}] Am preluat cererea ta. Am descompus-o în pași prin Planner și am verificat calendarul.`
                }
            ]);
            setPendingApproval(true);
        }, 1200);
    };

    const handleApprove = () => {
        setPendingApproval(false);
        setMessages(prev => [
            ...prev,
            { sender: 'assistant', text: '✅ Aprobare umană confirmată. Acțiunile externe au fost executate cu succes!' }
        ]);
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
                    <View style={styles.contentSection}>
                        <Text style={styles.sectionTitle}>Sincronizare Calendar</Text>
                        <Text style={styles.sectionSub}>Gestionarea programului și detectarea conflictelor de timp.</Text>
                    </View>
                )}

                {activeSection === 'logs' && (
                    <View style={styles.contentSection}>
                        <Text style={styles.sectionTitle}>Jurnal de Execuție (Execution Logs)</Text>
                        <Text style={styles.sectionSub}>Istoricul acțiunilor fiecărui agent specializat în parte.</Text>
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
                        <Text style={styles.sectionSub}>Controlul pe termen lung și scurt al memoriei asistentului.</Text>
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
    sectionSub: { fontSize: 14, color: '#94a3b8' }
});