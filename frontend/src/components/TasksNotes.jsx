import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const INITIAL_TASKS = [
    {
        id: 't1',
        title: 'Finalizare capitol Arhitectură Multi-Agent & Diagramă',
        source: 'Plan_Licenta.docx',
        dueDate: '20-11-2026',
        priority: 'high',
        status: 'draft_approval', // 'draft_approval' | 'todo' | 'done'
        estimatedDuration: '2h',
    },
    {
        id: 't2',
        title: 'Rulare suită de 10 scenarii sintetice pentru evaluare',
        source: 'Notite_Examen.pdf',
        dueDate: '21-11-2026',
        priority: 'high',
        status: 'draft_approval',
        estimatedDuration: '1h 30m',
    },
    {
        id: 't3',
        title: 'Verificare validări Pydantic pentru endpoint-ul de calendar',
        source: 'Chat Workflow #1',
        dueDate: '19-11-2026',
        priority: 'medium',
        status: 'todo',
        estimatedDuration: '45m',
    },
    {
        id: 't4',
        title: 'Configurare schemă SQL Server (users, workflows, execution_logs)',
        source: 'Manual',
        dueDate: '18-11-2026',
        priority: 'low',
        status: 'done',
        estimatedDuration: '1h',
    },
];

const INITIAL_NOTES = [
    {
        id: 'n1',
        title: 'Plan_Licenta.docx',
        type: 'DOCX',
        updatedAt: 'Azi, 19:40',
        extractedCount: 2,
        excerpt: 'Obiectiv săptămâna 11: compararea variantei single-agent cu multi-agent pe aceleași task-uri și măsurarea latenței.',
    },
    {
        id: 'n2',
        title: 'Notite_Sedinta_Coordonator.txt',
        type: 'TXT',
        updatedAt: 'Ieri, 16:15',
        extractedCount: 1,
        excerpt: 'De adăugat buton explicit de Human Approval înainte de orice acțiune de scriere (create task / calendar event).',
    },
];

export default function TasksNotes() {
    const [tasks, setTasks] = useState(INITIAL_TASKS);
    const [notes, setNotes] = useState(INITIAL_NOTES);
    const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'DRAFT' | 'TODO' | 'DONE'
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('medium');
    const [quickNoteText, setQuickNoteText] = useState('');

    const draftTasks = tasks.filter(t => t.status === 'draft_approval');

    const visibleTasks = tasks.filter(t => {
        if (activeTab === 'DRAFT') return t.status === 'draft_approval';
        if (activeTab === 'TODO') return t.status === 'todo';
        if (activeTab === 'DONE') return t.status === 'done';
        return true;
    });

    const handleApproveDraft = (id) => {
        setTasks(prev => prev.map(t => (t.id === id ? { ...t, status: 'todo' } : t)));
    };

    const handleApproveAllDrafts = () => {
        setTasks(prev => prev.map(t => (t.status === 'draft_approval' ? { ...t, status: 'todo' } : t)));
    };

    const handleRejectDraft = (id) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const handleToggleDone = (id) => {
        setTasks(prev =>
            prev.map(t => {
                if (t.id !== id) return t;
                return { ...t, status: t.status === 'done' ? 'todo' : 'done' };
            })
        );
    };

    const handleAddTask = () => {
        if (!newTaskTitle.trim()) return;
        const created = {
            id: `t-${Date.now()}`,
            title: newTaskTitle.trim(),
            source: 'Adăugat manual',
            dueDate: '20-11-2026',
            priority: newTaskPriority,
            status: 'todo',
            estimatedDuration: '1h',
        };
        setTasks(prev => [created, ...prev]);
        setNewTaskTitle('');
    };

    const handleExtractFromNote = () => {
        if (!quickNoteText.trim()) return;
        const lines = quickNoteText
            .split('\n')
            .map(l => l.replace(/^[-*•]\s*/, '').trim())
            .filter(Boolean);

        const extracted = lines.map((line, i) => ({
            id: `ext-${Date.now()}-${i}`,
            title: line,
            source: 'Notiță Rapidă (AI Extract)',
            dueDate: '20-11-2026',
            priority: 'medium',
            status: 'draft_approval',
            estimatedDuration: '45m',
        }));

        setTasks(prev => [...extracted, ...prev]);
        setNotes(prev => [
            {
                id: `n-${Date.now()}`,
                title: `Notiță_${new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}.txt`,
                type: 'NOTE',
                updatedAt: 'Chiar acum',
                extractedCount: extracted.length,
                excerpt: quickNoteText.trim(),
            },
            ...prev,
        ]);
        setQuickNoteText('');
    };

    const priorityStyle = (p) => {
        if (p === 'high') return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', label: 'Ridicată' };
        if (p === 'medium') return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', label: 'Medie' };
        return { bg: 'rgba(52, 211, 153, 0.15)', text: '#34d399', label: 'Scăzută' };
    };

    return (
        <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <View>
                    <Text style={styles.pageTitle}>Task-uri & Note Inteligente</Text>
                    <Text style={styles.pageSub}>
                        Sarcini extrase de Task & Document Agent cu validare umană înainte de salvare definitivă.
                    </Text>
                </View>

                {draftTasks.length > 0 && (
                    <TouchableOpacity style={styles.approveAllBtn} onPress={handleApproveAllDrafts}>
                        <Ionicons name="checkmark-done-outline" size={16} color="#030712" />
                        <Text style={styles.approveAllText}>Aprobă toate draft-urile ({draftTasks.length})</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.mainSplit}>
                {/* Left Column: Task Management */}
                <View style={styles.tasksPanel}>
                    {/* Quick Add Task Bar */}
                    <View style={styles.addTaskRow}>
                        <TextInput
                            style={styles.taskInput}
                            placeholder="Adaugă un task nou..."
                            placeholderTextColor="#64748b"
                            value={newTaskTitle}
                            onChangeText={setNewTaskTitle}
                        />
                        <View style={styles.prioritySelector}>
                            {['low', 'medium', 'high'].map(p => (
                                <TouchableOpacity
                                    key={p}
                                    style={[styles.prioChip, newTaskPriority === p && styles.prioChipActive]}
                                    onPress={() => setNewTaskPriority(p)}
                                >
                                    <Text style={styles.prioChipText}>{p === 'high' ? '!' : p === 'medium' ? '•' : '↓'}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.addBtn} onPress={handleAddTask}>
                            <Ionicons name="add" size={18} color="#fff" />
                            <Text style={styles.addBtnText}>Adaugă</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabsRow}>
                        {[
                            { id: 'ALL', label: `Toate (${tasks.length})` },
                            { id: 'DRAFT', label: `Necesită Aprobare (${draftTasks.length})` },
                            { id: 'TODO', label: `Active (${tasks.filter(t => t.status === 'todo').length})` },
                            { id: 'DONE', label: `Finalizate (${tasks.filter(t => t.status === 'done').length})` },
                        ].map(tab => (
                            <TouchableOpacity
                                key={tab.id}
                                style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
                                onPress={() => setActiveTab(tab.id)}
                            >
                                <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Task Cards List */}
                    <ScrollView contentContainerStyle={styles.tasksList} showsVerticalScrollIndicator={false}>
                        {visibleTasks.map(task => {
                            const isDraft = task.status === 'draft_approval';
                            const isDone = task.status === 'done';
                            const prio = priorityStyle(task.priority);

                            return (
                                <View
                                    key={task.id}
                                    style={[
                                        styles.taskCard,
                                        isDraft && styles.taskCardDraft,
                                        isDone && styles.taskCardDone,
                                    ]}
                                >
                                    {!isDraft ? (
                                        <TouchableOpacity onPress={() => handleToggleDone(task.id)} style={styles.checkboxBtn}>
                                            <Ionicons
                                                name={isDone ? 'checkbox' : 'square-outline'}
                                                size={20}
                                                color={isDone ? '#34d399' : '#818cf8'}
                                            />
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={styles.draftIconBox}>
                                            <Ionicons name="sparkles" size={16} color="#f59e0b" />
                                        </View>
                                    )}

                                    <View style={{ flex: 1, gap: 6 }}>
                                        <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>{task.title}</Text>
                                        <View style={styles.taskMetaRow}>
                                            <View style={[styles.badge, { backgroundColor: prio.bg }]}>
                                                <Text style={[styles.badgeText, { color: prio.text }]}>{prio.label}</Text>
                                            </View>
                                            <View style={styles.sourceBadge}>
                                                <Ionicons name="document-text-outline" size={11} color="#94a3b8" />
                                                <Text style={styles.sourceText}>{task.source}</Text>
                                            </View>
                                            <Text style={styles.dueText}>📅 {task.dueDate} • ⏱ {task.estimatedDuration}</Text>
                                        </View>
                                    </View>

                                    {isDraft ? (
                                        <View style={styles.draftActions}>
                                            <TouchableOpacity style={styles.approveMiniBtn} onPress={() => handleApproveDraft(task.id)}>
                                                <Ionicons name="checkmark" size={16} color="#030712" />
                                                <Text style={styles.approveMiniText}>Aprobă</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.rejectMiniBtn} onPress={() => handleRejectDraft(task.id)}>
                                                <Ionicons name="close" size={16} color="#f87171" />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <TouchableOpacity onPress={() => handleRejectDraft(task.id)} style={{ padding: 4 }}>
                                            <Ionicons name="trash-outline" size={16} color="#64748b" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Right Column: Notes & AI Task Extractor */}
                <View style={styles.notesPanel}>
                    <View style={styles.extractorCard}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Ionicons name="wand-outline" size={16} color="#818cf8" />
                            <Text style={styles.extractorTitle}>Extractor AI din Notițe</Text>
                        </View>
                        <Text style={styles.extractorSub}>
                            Lipește notițe de ședință (câte o idee pe rând) pentru a genera draft-uri de task-uri.
                        </Text>
                        <TextInput
                            style={styles.noteTextArea}
                            multiline
                            placeholder="- Pregătește slide-urile pentru demo&#10;- Verifică costurile pe token în logs"
                            placeholderTextColor="#64748b"
                            value={quickNoteText}
                            onChangeText={setQuickNoteText}
                        />
                        <TouchableOpacity style={styles.extractBtn} onPress={handleExtractFromNote}>
                            <Ionicons name="sparkles-outline" size={15} color="#fff" />
                            <Text style={styles.extractBtnText}>Extrage Draft Task-uri</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.notesSectionTitle}>DOCUMENTE & NOTE PROCESATE</Text>
                    <ScrollView contentContainerStyle={{ gap: 10 }} showsVerticalScrollIndicator={false}>
                        {notes.map(note => (
                            <View key={note.id} style={styles.noteCard}>
                                <View style={styles.noteHeader}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Ionicons name="document-attach-outline" size={15} color="#818cf8" />
                                        <Text style={styles.noteTitle}>{note.title}</Text>
                                    </View>
                                    <Text style={styles.noteTime}>{note.updatedAt}</Text>
                                </View>
                                <Text style={styles.noteExcerpt} numberOfLines={3}>{note.excerpt}</Text>
                                <Text style={styles.noteFooter}>✓ {note.extractedCount} task-uri identificate</Text>
                            </View>
                        ))}
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
    pageSub: { fontSize: 13, color: '#94a3b8', marginTop: 4 },
    approveAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f59e0b', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
    approveAllText: { color: '#030712', fontSize: 12, fontWeight: '700' },

    mainSplit: { flex: 1, flexDirection: 'row', gap: 16 },
    tasksPanel: { flex: 2, backgroundColor: '#0b0f19', borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', padding: 16, gap: 12 },
    addTaskRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    taskInput: { flex: 1, height: 40, backgroundColor: '#030712', borderWidth: 1, borderColor: '#1e293b', borderRadius: 10, paddingHorizontal: 12, color: '#f8fafc', fontSize: 13 },
    prioritySelector: { flexDirection: 'row', backgroundColor: '#030712', borderRadius: 10, borderWidth: 1, borderColor: '#1e293b', padding: 3, gap: 2 },
    prioChip: { width: 28, height: 32, borderRadius: 7, justifyContent: 'center', alignItems: 'center' },
    prioChipActive: { backgroundColor: '#1e293b' },
    prioChipText: { color: '#cbd5e1', fontSize: 12, fontWeight: '700' },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#4f46e5', height: 40, paddingHorizontal: 14, borderRadius: 10 },
    addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

    tabsRow: { flexDirection: 'row', gap: 6, borderBottomWidth: 1, borderBottomColor: '#1e293b', paddingBottom: 10, flexWrap: 'wrap' },
    tabBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#030712' },
    tabBtnActive: { backgroundColor: 'rgba(99, 102, 241, 0.16)', borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.4)' },
    tabText: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
    tabTextActive: { color: '#818cf8', fontWeight: '700' },

    tasksList: { gap: 10 },
    taskCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#030712', borderWidth: 1, borderColor: '#1e293b', borderRadius: 12, padding: 12 },
    taskCardDraft: { borderColor: 'rgba(245, 158, 11, 0.45)', backgroundColor: 'rgba(245, 158, 11, 0.04)' },
    taskCardDone: { opacity: 0.6 },
    checkboxBtn: { padding: 2 },
    draftIconBox: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(245, 158, 11, 0.15)', justifyContent: 'center', alignItems: 'center' },
    taskTitle: { fontSize: 14, fontWeight: '600', color: '#f8fafc' },
    taskTitleDone: { textDecorationLine: 'line-through', color: '#94a3b8' },
    taskMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    badgeText: { fontSize: 10, fontWeight: '700' },
    sourceBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#0b0f19', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#1e293b' },
    sourceText: { fontSize: 11, color: '#94a3b8' },
    dueText: { fontSize: 11, color: '#64748b' },

    draftActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    approveMiniBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f59e0b', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    approveMiniText: { color: '#030712', fontSize: 11, fontWeight: '700' },
    rejectMiniBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(239, 68, 68, 0.12)', justifyContent: 'center', alignItems: 'center' },

    notesPanel: { flex: 1, minWidth: 300, backgroundColor: '#0b0f19', borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', padding: 16, gap: 12 },
    extractorCard: { backgroundColor: '#030712', borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.3)', borderRadius: 12, padding: 12, gap: 8 },
    extractorTitle: { fontSize: 13, fontWeight: '700', color: '#f8fafc' },
    extractorSub: { fontSize: 11, color: '#94a3b8', lineHeight: 16 },
    noteTextArea: { height: 84, backgroundColor: '#0b0f19', borderWidth: 1, borderColor: '#1e293b', borderRadius: 8, padding: 10, color: '#f8fafc', fontSize: 12, textAlignVertical: 'top' },
    extractBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#4f46e5', height: 36, borderRadius: 8 },
    extractBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },

    notesSectionTitle: { fontSize: 11, fontWeight: '700', color: '#64748b', letterSpacing: 0.7, marginTop: 4 },
    noteCard: { backgroundColor: '#030712', borderWidth: 1, borderColor: '#1e293b', borderRadius: 12, padding: 12, gap: 6 },
    noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    noteTitle: { fontSize: 13, fontWeight: '600', color: '#f8fafc' },
    noteTime: { fontSize: 10, color: '#64748b' },
    noteExcerpt: { fontSize: 12, color: '#94a3b8', lineHeight: 17 },
    noteFooter: { fontSize: 11, color: '#34d399', fontWeight: '500' },
});