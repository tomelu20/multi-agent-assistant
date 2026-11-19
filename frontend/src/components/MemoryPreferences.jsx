import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const INITIAL_MEMORIES = [
    {
        id: 'm1',
        memory_type: 'long_term',
        KEY: 'working_hours',
        value: 'Interval preferat de lucru profund: 09:00 - 13:00 (Luni - Vineri)',
        updated_at: '18-11-2026',
    },
    {
        id: 'm2',
        memory_type: 'long_term',
        KEY: 'meeting_buffer',
        value: 'Păstrează minim 15 minute pauză între ședințe consecutive',
        updated_at: '17-11-2026',
    },
    {
        id: 'm3',
        memory_type: 'long_term',
        KEY: 'thesis_focus',
        value: 'Proiect prioritar curent: Multi-Agent Personal Productivity Assistant',
        updated_at: '15-11-2026',
    },
    {
        id: 'm4',
        memory_type: 'short_term',
        KEY: 'active_session_context',
        value: 'Utilizatorul pregătește demo-ul pentru evaluarea sistemului multi-agent.',
        updated_at: 'Sesiunea curentă',
    },
    {
        id: 'm5',
        memory_type: 'short_term',
        KEY: 'last_uploaded_doc',
        value: 'Plan_Licenta.docx (analizat în workflow-ul activ)',
        updated_at: 'Sesiunea curentă',
    },
];

export default function MemoryPreferences() {
    const [memories, setMemories] = useState(INITIAL_MEMORIES);
    const [useMemoryInPlanner, setUseMemoryInPlanner] = useState(true);
    const [requireWriteApproval, setRequireWriteApproval] = useState(true);
    const [newType, setNewType] = useState('long_term');
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');

    const longTermMemories = memories.filter(m => m.memory_type === 'long_term');
    const shortTermMemories = memories.filter(m => m.memory_type === 'short_term');

    const handleAddMemory = () => {
        if (!newKey.trim() || !newValue.trim()) return;
        const created = {
            id: `mem-${Date.now()}`,
            memory_type: newType,
            KEY: newKey.trim().toLowerCase().replace(/\s+/g, '_'),
            value: newValue.trim(),
            updated_at: newType === 'short_term' ? 'Sesiunea curentă' : 'Chiar acum',
        };
        setMemories(prev => [created, ...prev]);
        setNewKey('');
        setNewValue('');
    };

    const handleDeleteMemory = (id) => {
        setMemories(prev => prev.filter(m => m.id !== id));
    };

    const handleClearShortTerm = () => {
        setMemories(prev => prev.filter(m => m.memory_type !== 'short_term'));
    };

    return (
        <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <View>
                    <Text style={styles.pageTitle}>Memorie & Preferințe Utilizator</Text>
                    <Text style={styles.pageSub}>
                        Control transparent asupra contextului pe termen scurt și preferințelor persistente (GDPR / User-controlled deletion).
                    </Text>
                </View>

                <View style={styles.togglesGroup}>
                    <View style={styles.switchCard}>
                        <View>
                            <Text style={styles.switchTitle}>Reutilizare Context în Planner</Text>
                            <Text style={styles.switchSub}>{useMemoryInPlanner ? 'Activ (cu memorie)' : 'Dezactivat (baseline fără memorie)'}</Text>
                        </View>
                        <Switch
                            value={useMemoryInPlanner}
                            onValueChange={setUseMemoryInPlanner}
                            trackColor={{ false: '#1e293b', true: '#4f46e5' }}
                            thumbColor="#f8fafc"
                        />
                    </View>

                    <View style={styles.switchCard}>
                        <View>
                            <Text style={styles.switchTitle}>Human-in-the-Loop</Text>
                            <Text style={styles.switchSub}>Aprobare obligatorie la scriere</Text>
                        </View>
                        <Switch
                            value={requireWriteApproval}
                            onValueChange={setRequireWriteApproval}
                            trackColor={{ false: '#1e293b', true: '#10b981' }}
                            thumbColor="#f8fafc"
                        />
                    </View>
                </View>
            </View>

            {/* Add Memory Form */}
            <View style={styles.addCard}>
                <Text style={styles.sectionLabel}>ADAUGĂ INTRARE ÎN MEMORIE (USER_MEMORIES)</Text>
                <View style={styles.formRow}>
                    <View style={styles.typeSwitch}>
                        <TouchableOpacity
                            style={[styles.typeBtn, newType === 'long_term' && styles.typeBtnActive]}
                            onPress={() => setNewType('long_term')}
                        >
                            <Text style={[styles.typeBtnText, newType === 'long_term' && styles.typeBtnTextActive]}>Long-Term</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeBtn, newType === 'short_term' && styles.typeBtnActive]}
                            onPress={() => setNewType('short_term')}
                        >
                            <Text style={[styles.typeBtnText, newType === 'short_term' && styles.typeBtnTextActive]}>Short-Term</Text>
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={[styles.input, { width: 200 }]}
                        placeholder="Cheie (ex: preferred_language)"
                        placeholderTextColor="#64748b"
                        value={newKey}
                        onChangeText={setNewKey}
                    />

                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Valoare / Preferință (ex: Răspunde concis în limba română)"
                        placeholderTextColor="#64748b"
                        value={newValue}
                        onChangeText={setNewValue}
                    />

                    <TouchableOpacity style={styles.saveBtn} onPress={handleAddMemory}>
                        <Ionicons name="add-circle-outline" size={16} color="#fff" />
                        <Text style={styles.saveBtnText}>Salvează în Memorie</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Two Columns: Long-Term vs Short-Term */}
            <View style={styles.columnsSplit}>
                {/* Long-Term Memory */}
                <View style={styles.memoryColumn}>
                    <View style={styles.colHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Ionicons name="server-outline" size={16} color="#818cf8" />
                            <Text style={styles.colTitle}>Memorie pe Termen Lung ({longTermMemories.length})</Text>
                        </View>
                        <Text style={styles.colBadge}>Persistentă SQL</Text>
                    </View>

                    <ScrollView contentContainerStyle={styles.cardsList} showsVerticalScrollIndicator={false}>
                        {longTermMemories.map(item => (
                            <View key={item.id} style={styles.memCard}>
                                <View style={styles.memTop}>
                                    <Text style={styles.memKey}>{item.KEY}</Text>
                                    <TouchableOpacity onPress={() => handleDeleteMemory(item.id)} style={styles.deleteBtn}>
                                        <Ionicons name="trash-outline" size={15} color="#f87171" />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.memValue}>{item.value}</Text>
                                <Text style={styles.memDate}>Actualizat: {item.updated_at}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Short-Term Memory */}
                <View style={styles.memoryColumn}>
                    <View style={styles.colHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Ionicons name="flash-outline" size={16} color="#34d399" />
                            <Text style={styles.colTitle}>Memorie pe Termen Scurt ({shortTermMemories.length})</Text>
                        </View>
                        {shortTermMemories.length > 0 && (
                            <TouchableOpacity style={styles.clearBtn} onPress={handleClearShortTerm}>
                                <Text style={styles.clearBtnText}>Resetează sesiunea</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <ScrollView contentContainerStyle={styles.cardsList} showsVerticalScrollIndicator={false}>
                        {shortTermMemories.length === 0 ? (
                            <Text style={styles.emptyText}>Contextul sesiunii curente este gol.</Text>
                        ) : (
                            shortTermMemories.map(item => (
                                <View key={item.id} style={[styles.memCard, { borderColor: 'rgba(52, 211, 153, 0.25)' }]}>
                                    <View style={styles.memTop}>
                                        <Text style={[styles.memKey, { color: '#34d399' }]}>{item.KEY}</Text>
                                        <TouchableOpacity onPress={() => handleDeleteMemory(item.id)} style={styles.deleteBtn}>
                                            <Ionicons name="trash-outline" size={15} color="#f87171" />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.memValue}>{item.value}</Text>
                                    <Text style={styles.memDate}>{item.updated_at}</Text>
                                </View>
                            ))
                        )}
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#030712', gap: 16 },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0b0f19', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', flexWrap: 'wrap', gap: 12 },
    pageTitle: { fontSize: 19, fontWeight: '700', color: '#f8fafc' },
    pageSub: { fontSize: 13, color: '#94a3b8', marginTop: 4, maxWidth: 560 },
    togglesGroup: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
    switchCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#030712', borderWidth: 1, borderColor: '#1e293b', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
    switchTitle: { fontSize: 12, fontWeight: '700', color: '#f8fafc' },
    switchSub: { fontSize: 10, color: '#94a3b8' },

    addCard: { backgroundColor: '#0b0f19', borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', padding: 14, gap: 10 },
    sectionLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', letterSpacing: 0.7 },
    formRow: { flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
    typeSwitch: { flexDirection: 'row', backgroundColor: '#030712', borderRadius: 10, padding: 3, borderWidth: 1, borderColor: '#1e293b' },
    typeBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 7 },
    typeBtnActive: { backgroundColor: '#4f46e5' },
    typeBtnText: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
    typeBtnTextActive: { color: '#fff', fontWeight: '600' },
    input: { height: 38, backgroundColor: '#030712', borderWidth: 1, borderColor: '#1e293b', borderRadius: 10, paddingHorizontal: 12, color: '#f8fafc', fontSize: 13 },
    saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#4f46e5', height: 38, paddingHorizontal: 14, borderRadius: 10 },
    saveBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },

    columnsSplit: { flex: 1, flexDirection: 'row', gap: 16 },
    memoryColumn: { flex: 1, backgroundColor: '#0b0f19', borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', padding: 16, gap: 12 },
    colHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1e293b', paddingBottom: 10 },
    colTitle: { fontSize: 14, fontWeight: '700', color: '#f8fafc' },
    colBadge: { fontSize: 10, color: '#818cf8', backgroundColor: 'rgba(99, 102, 241, 0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, fontWeight: '600' },
    clearBtn: { backgroundColor: 'rgba(239, 68, 68, 0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    clearBtnText: { fontSize: 11, color: '#f87171', fontWeight: '600' },

    cardsList: { gap: 10 },
    memCard: { backgroundColor: '#030712', borderWidth: 1, borderColor: '#1e293b', borderRadius: 12, padding: 12, gap: 6 },
    memTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    memKey: { fontSize: 12, fontWeight: '700', color: '#818cf8', fontFamily: 'monospace' },
    deleteBtn: { padding: 4 },
    memValue: { fontSize: 13, color: '#e2e8f0', lineHeight: 19 },
    memDate: { fontSize: 10, color: '#64748b' },
    emptyText: { fontSize: 12, color: '#64748b', fontStyle: 'italic' },
});