import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Dashboard({ route, navigation }) {
    // Preluăm eventuale date trimise de la logare (de ex. numele utilizatorului)
    const userName = route?.params?.userName || 'Utilizator';

    const [requestText, setRequestText] = useState('');
    const [activeTab, setActiveTab] = useState('workflow'); // 'workflow' | 'calendar' | 'tasks' | 'logs'
    const [executionLogs, setExecutionLogs] = useState([
        { id: 1, agent: 'System', action: 'Sistemul a pornit cu succes.', time: 'Acum câteva momente', status: 'success' }
    ]);
    const [isExecuting, setIsExecuting] = useState(false);
    const [pendingApproval, setPendingApproval] = useState(false);

    const handleRunWorkflow = () => {
        if (!requestText.trim()) return;
        setIsExecuting(true);

        // Simulare pași multi-agent bazat pe playbook
        setTimeout(() => {
            setExecutionLogs(prev => [
                { id: Date.now() + 1, agent: 'Planner', action: `Descompunerea obiectivului: "${requestText}" în pași logici.`, time: 'Chiar acum', status: 'success' },
                { id: Date.now() + 2, agent: 'Calendar Agent', action: 'Verificare conflicte în calendar pentru mâine.', time: 'Chiar acum', status: 'success' },
                { id: Date.now() + 3, agent: 'Task/Document Agent', action: 'Generare draft de sarcini bazat pe notițe.', time: 'Chiar acum', status: 'pending' },
                ...prev
            ]);
            setIsExecuting(false);
            setPendingApproval(true);
        }, 1200);
    };

    const handleApproveAction = () => {
        setPendingApproval(false);
        setExecutionLogs(prev => [
            { id: Date.now(), agent: 'User / System', action: 'Aprobare umană acordată. Acțiune executată cu succes în mediul extern.', time: 'Chiar acum', status: 'success' },
            ...prev
        ]);
        alert('Acțiunea a fost aprobată și executată cu succes!');
    };

    const handleLogout = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Bara de sus (Header) */}
                <View style={styles.topNav}>
                    <View style={styles.navBrand}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="sparkles" size={20} color="#818cf8" />
                        </View>
                        <Text style={styles.navTitle}>Productivity Assistant</Text>
                    </View>

                    <View style={styles.navRight}>
                        <View style={styles.userInfoBadge}>
                            <Ionicons name="person-circle-outline" size={20} color="#94a3b8" />
                            <Text style={styles.userNameText}>Salut, {userName}</Text>
                        </View>
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={18} color="#ef4444" />
                            <Text style={styles.logoutText}>Deconectare</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Conținutul Principal */}
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

                    {/* Secțiunea de Introducere Obiectiv / Request */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="flash-outline" size={20} color="#818cf8" />
                            <Text style={styles.cardTitle}>Intrare Limbaj Natural & Workflow</Text>
                        </View>
                        <Text style={styles.cardSubtitle}>
                            Exemplu: "Planifică mâine în jurul întâlnirilor existente, adaugă două ore pentru teză și creează task-uri din notițe."
                        </Text>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Scrie cererea ta aici..."
                                placeholderTextColor="#64748b"
                                value={requestText}
                                onChangeText={setRequestText}
                                multiline
                            />
                            <TouchableOpacity
                                style={[styles.runButton, isExecuting && styles.disabledButton]}
                                onPress={handleRunWorkflow}
                                disabled={isExecuting}
                            >
                                <Ionicons name="play" size={16} color="#fff" />
                                <Text style={styles.runButtonText}>{isExecuting ? 'Se procesează...' : 'Rulează Asistentul'}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Aprobare umană obligatorie pentru acțiuni write/state-changing */}
                        {pendingApproval && (
                            <View style={styles.approvalBox}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Ionicons name="alert-circle" size={20} color="#f59e0b" />
                                    <Text style={styles.approvalTitle}>Necesită aprobare umană</Text>
                                </View>
                                <Text style={styles.approvalDesc}>
                                    Asistentul dorește să modifice starea externă (creare task-uri și adăugare evenimente în calendar).
                                </Text>
                                <TouchableOpacity style={styles.approveButton} onPress={handleApproveAction}>
                                    <Text style={styles.approveButtonText}>Aprobă și Execută</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Secțiune de Tab-uri / Statistici Rapide */}
                    <View style={styles.tabsRow}>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'workflow' && styles.tabButtonActive]}
                            onPress={() => setActiveTab('workflow')}
                        >
                            <Ionicons name="git-network-outline" size={16} color={activeTab === 'workflow' ? '#818cf8' : '#64748b'} />
                            <Text style={[styles.tabButtonText, activeTab === 'workflow' && styles.tabButtonTextActive]}>Jurnal Execuție</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'calendar' && styles.tabButtonActive]}
                            onPress={() => setActiveTab('calendar')}
                        >
                            <Ionicons name="calendar-outline" size={16} color={activeTab === 'calendar' ? '#818cf8' : '#64748b'} />
                            <Text style={[styles.tabButtonText, activeTab === 'calendar' && styles.tabButtonTextActive]}>Calendar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'tasks' && styles.tabButtonActive]}
                            onPress={() => setActiveTab('tasks')}
                        >
                            <Ionicons name="checkbox-outline" size={16} color={activeTab === 'tasks' ? '#818cf8' : '#64748b'} />
                            <Text style={[styles.tabButtonText, activeTab === 'tasks' && styles.tabButtonTextActive]}>Task-uri & Note</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Afișare dinamică în funcție de tab-ul selectat */}
                    {activeTab === 'workflow' && (
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Istoric Acțiuni Agenți (Execution Log)</Text>
                            <View style={styles.logList}>
                                {executionLogs.map((log) => (
                                    <View key={log.id} style={styles.logItem}>
                                        <View style={styles.logBadge}>
                                            <Text style={styles.logBadgeText}>{log.agent}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.logText}>{log.action}</Text>
                                            <Text style={styles.logTime}>{log.time}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {activeTab === 'calendar' && (
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Sincronizare Calendar</Text>
                            <Text style={styles.placeholderText}>Calendarul tău este sincronizat. Nu există conflicte majore detectate pentru ziua de mâine.</Text>
                        </View>
                    )}

                    {activeTab === 'tasks' && (
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Task-uri Active & Documente</Text>
                            <Text style={styles.placeholderText}>Aici poți vedea task-urile generate automat din notițe și documente.</Text>
                        </View>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#030712' },
    topNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
        backgroundColor: '#0b0f19',
    },
    navBrand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    logoContainer: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    navTitle: { fontSize: 16, fontWeight: '700', color: '#f8fafc' },
    navRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    userInfoBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    userNameText: { fontSize: 13, color: '#cbd5e1', fontWeight: '500' },
    logoutButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: 'rgba(239, 68, 68, 0.1)' },
    logoutText: { fontSize: 12, color: '#ef4444', fontWeight: '600' },
    scrollContainer: { padding: 20, gap: 16 },
    card: {
        backgroundColor: '#0b0f19',
        borderWidth: 1,
        borderColor: '#1e293b',
        borderRadius: 20,
        padding: 20,
        gap: 12,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    cardTitle: { fontSize: 16, fontWeight: '600', color: '#f8fafc' },
    cardSubtitle: { fontSize: 12, color: '#94a3b8', lineHeight: 18 },
    inputContainer: { gap: 10, marginTop: 4 },
    textInput: {
        height: 90,
        backgroundColor: '#030712',
        borderWidth: 1,
        borderColor: '#1e293b',
        borderRadius: 12,
        padding: 12,
        color: '#f8fafc',
        fontSize: 14,
        textAlignVertical: 'top',
    },
    runButton: {
        flexDirection: 'row',
        height: 44,
        backgroundColor: '#4f46e5',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    disabledButton: { opacity: 0.6 },
    runButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    approvalBox: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
        borderRadius: 12,
        padding: 14,
        gap: 8,
        marginTop: 6,
    },
    approvalTitle: { fontSize: 13, fontWeight: '700', color: '#f59e0b' },
    approvalDesc: { fontSize: 12, color: '#cbd5e1' },
    approveButton: {
        backgroundColor: '#f59e0b',
        borderRadius: 8,
        height: 38,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    approveButtonText: { color: '#030712', fontSize: 12, fontWeight: '700' },
    tabsRow: { flexDirection: 'row', gap: 10 },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        backgroundColor: '#0b0f19',
        borderWidth: 1,
        borderColor: '#1e293b',
        borderRadius: 12,
    },
    tabButtonActive: {
        borderColor: '#818cf8',
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
    },
    tabButtonText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
    tabButtonTextActive: { color: '#f8fafc', fontWeight: '600' },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: '#f8fafc', marginBottom: 8 },
    logList: { gap: 10 },
    logItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
    },
    logBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        borderRadius: 6,
    },
    logBadgeText: { fontSize: 10, color: '#818cf8', fontWeight: '600' },
    logText: { fontSize: 12, color: '#cbd5e1' },
    logTime: { fontSize: 10, color: '#64748b', marginTop: 2 },
    placeholderText: { fontSize: 13, color: '#64748b' },
});