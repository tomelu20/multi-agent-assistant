import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Sidebar({ isOpen, toggleSidebar, activeSection, setActiveSection, chatHistory, selectChat, currentChatId }) {
    const [searchQuery, setSearchQuery] = useState('');
    const screenWidth = Dimensions.get('window').width;
    const isMobile = screenWidth < 768; // Detectare ecran mic de telefon

    const filteredChats = chatHistory.filter(chat =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Dacă este pe mobil și sidebar-ul este închis, nu îl afișăm deloc în flux
    if (isMobile && !isOpen) {
        return null;
    }

    // Pe mobil, când este deschis, devine overlay absolut peste conținut
    const sidebarStyles = isMobile ? [styles.expandedContainer, styles.mobileOverlay] : (!isOpen ? styles.collapsedContainer : styles.expandedContainer);

    if (!isOpen && !isMobile) {
        return (
            <View style={styles.collapsedContainer}>
                <TouchableOpacity style={styles.iconButton} onPress={toggleSidebar}>
                    <Ionicons name="menu-outline" size={22} color="#f8fafc" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => setActiveSection('chat')}>
                    <Ionicons name="add-outline" size={22} color="#818cf8" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => setActiveSection('search')}>
                    <Ionicons name="search-outline" size={20} color="#94a3b8" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => setActiveSection('calendar')}>
                    <Ionicons name="calendar-outline" size={20} color="#94a3b8" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => setActiveSection('logs')}>
                    <Ionicons name="git-network-outline" size={20} color="#94a3b8" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => setActiveSection('tasks')}>
                    <Ionicons name="checkbox-outline" size={20} color="#94a3b8" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => setActiveSection('memory')}>
                    <Ionicons name="brain-outline" size={20} color="#94a3b8" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => setActiveSection('metrics')}>
                    <Ionicons name="bar-chart-outline" size={20} color="#94a3b8" />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <>
            {/* Fundal întunecat pentru închiderea drawer-ului pe mobil la click în afara lui */}
            {isMobile && isOpen && (
                <div
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 150 }}
                    onClick={toggleSidebar}
                />
            )}

            <View style={sidebarStyles}>
                <View style={styles.sidebarHeader}>
                    <View style={styles.brandRow}>
                        <Ionicons name="sparkles" size={20} color="#818cf8" />
                        <Text style={styles.brandTitle}>Productivity</Text>
                    </View>
                    <TouchableOpacity onPress={toggleSidebar} style={styles.iconButton}>
                        <Ionicons name="panel-left-close-outline" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.newChatBtn} onPress={() => { setActiveSection('chat'); if(isMobile) toggleSidebar(); }}>
                    <Ionicons name="add" size={18} color="#818cf8" />
                    <Text style={styles.newChatText}>Chat Nou / Workflow</Text>
                </TouchableOpacity>

                <View style={styles.searchBox}>
                    <Ionicons name="search" size={16} color="#64748b" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Caută în chat-uri..."
                        placeholderTextColor="#64748b"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <Ionicons name="filter-outline" size={14} color="#64748b" />
                </View>

                <View style={styles.navSection}>
                    <Text style={styles.sectionHeaderTitle}>Meniu Aplicație</Text>
                    <TouchableOpacity
                        style={[styles.navItem, activeSection === 'calendar' && styles.navItemActive]}
                        onPress={() => { setActiveSection('calendar'); if(isMobile) toggleSidebar(); }}
                    >
                        <Ionicons name="calendar-outline" size={18} color={activeSection === 'calendar' ? '#818cf8' : '#94a3b8'} />
                        <Text style={[styles.navItemText, activeSection === 'calendar' && styles.navItemTextActive]}>Calendar & Sincronizare</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.navItem, activeSection === 'logs' && styles.navItemActive]}
                        onPress={() => { setActiveSection('logs'); if(isMobile) toggleSidebar(); }}
                    >
                        <Ionicons name="git-network-outline" size={18} color={activeSection === 'logs' ? '#818cf8' : '#94a3b8'} />
                        <Text style={[styles.navItemText, activeSection === 'logs' && styles.navItemTextActive]}>Jurnal de Execuție (Logs)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.navItem, activeSection === 'tasks' && styles.navItemActive]}
                        onPress={() => { setActiveSection('tasks'); if(isMobile) toggleSidebar(); }}
                    >
                        <Ionicons name="checkbox-outline" size={18} color={activeSection === 'tasks' ? '#818cf8' : '#94a3b8'} />
                        <Text style={[styles.navItemText, activeSection === 'tasks' && styles.navItemTextActive]}>Task-uri & Note</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.navItem, activeSection === 'memory' && styles.navItemActive]}
                        onPress={() => { setActiveSection('memory'); if(isMobile) toggleSidebar(); }}
                    >
                        <Ionicons name="brain-outline" size={18} color={activeSection === 'memory' ? '#818cf8' : '#94a3b8'} />
                        <Text style={[styles.navItemText, activeSection === 'memory' && styles.navItemTextActive]}>Memorie & Preferințe</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.navItem, activeSection === 'metrics' && styles.navItemActive]}
                        onPress={() => { setActiveSection('metrics'); if(isMobile) toggleSidebar(); }}
                    >
                        <Ionicons name="bar-chart-outline" size={18} color={activeSection === 'metrics' ? '#818cf8' : '#94a3b8'} />
                        <Text style={[styles.navItemText, activeSection === 'metrics' && styles.navItemTextActive]}>Metrici de Evaluare</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ flex: 1, marginTop: 10 }}>
                    <Text style={styles.sectionHeaderTitle}>Istoric Conversații</Text>
                    <ScrollView contentContainerStyle={styles.historyList} showsVerticalScrollIndicator={false}>
                        {filteredChats.map((chat) => (
                            <TouchableOpacity
                                key={chat.id}
                                style={[styles.historyItem, currentChatId === chat.id && styles.historyItemActive]}
                                onPress={() => { selectChat(chat.id); setActiveSection('chat'); if(isMobile) toggleSidebar(); }}
                            >
                                <Ionicons name="chatbubble-outline" size={14} color={currentChatId === chat.id ? '#818cf8' : '#64748b'} />
                                <Text numberOfLines={1} style={[styles.historyText, currentChatId === chat.id && styles.historyTextActive]}>
                                    {chat.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    collapsedContainer: { width: 64, backgroundColor: '#0b0f19', borderRightWidth: 1, borderRightColor: '#1e293b', alignItems: 'center', paddingVertical: 16, gap: 16 },
    expandedContainer: { width: 280, backgroundColor: '#0b0f19', borderRightWidth: 1, borderRightColor: '#1e293b', padding: 14, display: 'flex', flexDirection: 'column' },
    mobileOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, zIndex: 160, height: '100%', shadowColor: '#000', shadowOpacity: 0.8, shadowRadius: 20 },
    sidebarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    brandTitle: { fontSize: 15, fontWeight: '700', color: '#f8fafc' },
    iconButton: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
    newChatBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(99, 102, 241, 0.1)', borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.3)', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 14 },
    newChatText: { fontSize: 13, fontWeight: '600', color: '#818cf8' },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#030712', borderWidth: 1, borderColor: '#1e293b', borderRadius: 10, paddingHorizontal: 10, height: 38, marginBottom: 16, gap: 8 },
    searchInput: { flex: 1, color: '#f8fafc', fontSize: 13 },
    navSection: { gap: 4, marginBottom: 16 },
    sectionHeaderTitle: { fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6, marginLeft: 4 },
    navItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
    navItemActive: { backgroundColor: 'rgba(99, 102, 241, 0.08)' },
    navItemText: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
    navItemTextActive: { color: '#f8fafc', fontWeight: '600' },
    historyList: { gap: 4 },
    historyItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
    historyItemActive: { backgroundColor: '#1e293b' },
    historyText: { fontSize: 12, color: '#94a3b8' },
    historyTextActive: { color: '#f8fafc', fontWeight: '600' }
});