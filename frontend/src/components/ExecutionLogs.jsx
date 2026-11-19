import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MOCK_STEPS = [
    { id: 's1', step_number: 1, assigned_role: 'Planner Master', description: 'Descompunere obiectiv și verificare constrângeri temporale', status: 'completed' },
    { id: 's2', step_number: 2, assigned_role: 'Calendar Agent', description: 'Interogare evenimente existente și identificare ferestre libere', status: 'completed' },
    { id: 's3', step_number: 3, assigned_role: 'Task & Document Agent', description: 'Extragere sarcini acționabile din notițele atașate', status: 'completed' },
    { id: 's4', step_number: 4, assigned_role: 'Human Approval Gate', description: 'Așteptare confirmare utilizator pentru scriere în calendar & DB', status: 'pending_approval' },
];

const MOCK_LOGS = [
    {
        id: 'log-1',
        agent_name: 'Planner Master',
        tool_name: 'decompose_goal',
        input_payload: '{"goal": "Planifică ziua de mâine și extrage task-uri din notițe"}',
        output_payload: '{"steps_count": 4, "requires_approval": true}',
        latency_ms: 412,
        approx_cost: 0.0004,
        success: true,
        timestamp: '2026-11-19 20:14:02',
    },
    {
        id: 'log-2',
        agent_name: 'Calendar Agent',
        tool_name: 'read_calendar_events',
        input_payload: '{"date": "20-11-2026", "timezone": "Europe/Bucharest"}',
        output_payload: '{"events_found": 2, "free_slots": ["11:00-13:00", "15:30-18:00"]}',
        latency_ms: 185,
        approx_cost: 0.0002,
        success: true,
        timestamp: '2026-11-19 20:14:03',
    },
    {
        id: 'log-3',
        agent_name: 'Task & Document Agent',
        tool_name: 'parse_document_notes',
        input_payload: '{"file": "Plan_Licenta.docx", "extract_deadlines": true}',
        output_payload: '{"draft_tasks": 3, "confidence": 0.96}',
        latency_ms: 640,
        approx_cost: 0.0011,
        success: true,
        timestamp: '2026-11-19 20:14:04',
    },
    {
        id: 'log-4',
        agent_name: 'Calendar Agent',
        tool_name: 'propose_schedule_slot',
        input_payload: '{"title": "Lucru Licență (2h)", "slot": "11:00-13:00"}',
        output_payload: '{"error": "Conflict detectat la prima încercare; replanificat pe 15:30-17:30"}',
        latency_ms: 230,
        approx_cost: 0.0003,
        success: false,
        timestamp: '2026-11-19 20:14:05',
    },
];

export default function ExecutionLogs({ executionLogs = [], currentChatId }) {
    const logsSource = executionLogs.length > 0 ? executionLogs : MOCK_LOGS;
    const [selectedAgent, setSelectedAgent] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'SUCCESS' | 'FAILED'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLog, setSelectedLog] = useState(logsSource[0] || null);

    const agents = ['ALL', ...Array.from(new Set(logsSource.map(l => l.agent_name)))];

    const filteredLogs = useMemo(() => {
        return logsSource.filter(log => {
            const matchesAgent = selectedAgent === 'ALL' || log.agent_name === selectedAgent;
            const matchesStatus =
                statusFilter === 'ALL' ||
                (statusFilter === 'SUCCESS' && log.success) ||
                (statusFilter === 'FAILED' && !log.success);
            const q = searchQuery.toLowerCase();
            const matchesSearch =
                !q ||
                log.agent_name?.toLowerCase().includes(q) ||
                log.tool_name?.toLowerCase().includes(q) ||
                log.input_payload?.toLowerCase().includes(q);
            return matchesAgent && matchesStatus && matchesSearch;
        });
    }, [logsSource, selectedAgent, statusFilter, searchQuery]);

    const stats = useMemo(() => {
        const total = logsSource.length;
        const okCount = logsSource.filter(l => l.success).length;
        const totalLatency = logsSource.reduce((acc, l) => acc + (l.latency_ms || 0), 0);
        const totalCost = logsSource.reduce((acc, l) => acc + (l.approx_cost || 0), 0);
        return {
            total,
            successRate: total ? Math.round((okCount / total) * 100) : 100,
            totalLatency,
            totalCost: totalCost.toFixed(4),
        };
    }, [logsSource]);

    const formatJson = (raw) => {
        if (!raw) return '—';
        try {
            return JSON.stringify(JSON.parse(raw), null, 2);
        } catch {
            return raw;
        }
    };

    return (
        <View style={styles.container}>
            {/* Header + KPI Strip */}
            <View style={styles.topBar}>
                <View>
                    <View style={styles.titleRow}>
                        <Text style={styles.pageTitle}>Jurnal de Execuție & Audit Multi-Agent</Text>
                        <View style={styles.workflowBadge}>
                            <Ionicons name="git-commit-outline" size={13} color="#818cf8" />
                            <Text style={styles.workflowBadgeText}>
                                {currentChatId ? `Workflow #${String(currentChatId).slice(0, 8)}` : 'Demo Trace Activ'}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.pageSub}>
                        Trasabilitate completă pentru planificare, tool-calling, latență și validare umană.
                    </Text>
                </View>

                <View style={styles.kpiRow}>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiLabel}>Apeluri Tool</Text>
                        <Text style={styles.kpiValue}>{stats.total}</Text>
                    </View>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiLabel}>Rată Succes</Text>
                        <Text style={[styles.kpiValue, { color: '#34d399' }]}>{stats.successRate}%</Text>
                    </View>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiLabel}>Latență Totală</Text>
                        <Text style={styles.kpiValue}>{stats.totalLatency} ms</Text>
                    </View>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiLabel}>Cost Estimat</Text>
                        <Text style={[styles.kpiValue, { color: '#818cf8' }]}>${stats.totalCost}</Text>
                    </View>
                </View>
            </View>

            {/* Planner Steps Pipeline */}
            <View style={styles.pipelineCard}>
                <Text style={styles.cardSectionTitle}>PLANNER STEPS (DECOMPUNERE WORKFLOW)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepsRow}>
                    {MOCK_STEPS.map((step, idx) => {
                        const isDone = step.status === 'completed';
                        return (
                            <React.Fragment key={step.id}>
                                <View style={[styles.stepBox, !isDone && styles.stepBoxPending]}>
                                    <View style={styles.stepHeader}>
                                        <View style={[styles.stepNumBadge, !isDone && { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                                            <Text style={[styles.stepNumText, !isDone && { color: '#f59e0b' }]}>
                                                Pas {step.step_number}
                                            </Text>
                                        </View>
                                        <Text style={styles.stepRole}>{step.assigned_role}</Text>
                                        <Ionicons
                                            name={isDone ? 'checkmark-circle' : 'time'}
                                            size={15}
                                            color={isDone ? '#34d399' : '#f59e0b'}
                                        />
                                    </View>
                                    <Text style={styles.stepDesc} numberOfLines={2}>{step.description}</Text>
                                </View>
                                {idx < MOCK_STEPS.length - 1 && (
                                    <Ionicons name="arrow-forward" size={16} color="#475569" style={{ alignSelf: 'center' }} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Main Split: Logs Table/Feed + Payload Inspector */}
            <View style={styles.mainSplit}>
                <View style={styles.logsListPanel}>
                    {/* Filter Bar */}
                    <View style={styles.filterBar}>
                        <View style={styles.searchBox}>
                            <Ionicons name="search" size={15} color="#64748b" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Filtrează după agent, tool sau payload..."
                                placeholderTextColor="#64748b"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        <View style={styles.statusPills}>
                            {[
                                { id: 'ALL', label: 'Toate' },
                                { id: 'SUCCESS', label: 'Succes' },
                                { id: 'FAILED', label: 'Eșuate / Retry' },
                            ].map(st => (
                                <TouchableOpacity
                                    key={st.id}
                                    style={[styles.pillBtn, statusFilter === st.id && styles.pillBtnActive]}
                                    onPress={() => setStatusFilter(st.id)}
                                >
                                    <Text style={[styles.pillText, statusFilter === st.id && styles.pillTextActive]}>
                                        {st.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Agent Chips */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 34 }} contentContainerStyle={{ gap: 6 }}>
                        {agents.map(ag => (
                            <TouchableOpacity
                                key={ag}
                                style={[styles.agentChip, selectedAgent === ag && styles.agentChipActive]}
                                onPress={() => setSelectedAgent(ag)}
                            >
                                <Text style={[styles.agentChipText, selectedAgent === ag && styles.agentChipTextActive]}>
                                    {ag === 'ALL' ? 'Toți Agenții' : ag}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Logs Feed */}
                    <ScrollView contentContainerStyle={styles.logsScroll} showsVerticalScrollIndicator={false}>
                        {filteredLogs.map((log, index) => {
                            const isSelected = selectedLog?.id === log.id;
                            return (
                                <TouchableOpacity
                                    key={log.id || index}
                                    style={[styles.logRowCard, isSelected && styles.logRowCardSelected]}
                                    onPress={() => setSelectedLog(log)}
                                >
                                    <View style={[styles.statusBarIndicator, { backgroundColor: log.success ? '#34d399' : '#f87171' }]} />
                                    <View style={{ flex: 1, gap: 4 }}>
                                        <View style={styles.logRowTop}>
                                            <View style={styles.logAgentRow}>
                                                <Ionicons name="hardware-chip-outline" size={14} color="#818cf8" />
                                                <Text style={styles.logAgentName}>{log.agent_name}</Text>
                                                <Text style={styles.logToolBadge}>{log.tool_name}()</Text>
                                            </View>
                                            <Text style={styles.logTimestamp}>{log.timestamp}</Text>
                                        </View>

                                        <Text style={styles.logPreviewPayload} numberOfLines={1}>
                                            {log.output_payload || log.input_payload}
                                        </Text>

                                        <View style={styles.logMetaFooter}>
                                            <View style={[styles.statusTag, { backgroundColor: log.success ? 'rgba(52, 211, 153, 0.12)' : 'rgba(248, 113, 113, 0.12)' }]}>
                                                <Text style={[styles.statusTagText, { color: log.success ? '#34d399' : '#f87171' }]}>
                                                    {log.success ? 'SUCCESS' : 'WARNING / RETRY'}
                                                </Text>
                                            </View>
                                            {log.latency_ms != null && (
                                                <Text style={styles.metaMetric}>⏱ {log.latency_ms} ms</Text>
                                            )}
                                            {log.approx_cost != null && (
                                                <Text style={styles.metaMetric}>💳 ${Number(log.approx_cost).toFixed(4)}</Text>
                                            )}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Right Inspector Panel */}
                <View style={styles.inspectorPanel}>
                    <View style={styles.inspectorHeader}>
                        <Ionicons name="code-working-outline" size={18} color="#818cf8" />
                        <Text style={styles.inspectorTitle}>Payload Inspector</Text>
                    </View>

                    {selectedLog ? (
                        <ScrollView contentContainerStyle={{ gap: 14 }} showsVerticalScrollIndicator={false}>
                            <View style={styles.inspectorMetaBox}>
                                <Text style={styles.inspectorLabel}>AGENT & FUNCȚIE</Text>
                                <Text style={styles.inspectorMainVal}>{selectedLog.agent_name}</Text>
                                <Text style={styles.inspectorSubVal}>{selectedLog.tool_name}</Text>
                            </View>

                            <View>
                                <Text style={styles.inspectorLabel}>INPUT PAYLOAD (STRUCTURED ARGS)</Text>
                                <View style={styles.codeBlock}>
                                    <Text style={styles.codeText}>{formatJson(selectedLog.input_payload)}</Text>
                                </View>
                            </View>

                            <View>
                                <Text style={styles.inspectorLabel}>OUTPUT PAYLOAD (TOOL RESPONSE)</Text>
                                <View style={styles.codeBlock}>
                                    <Text style={[styles.codeText, { color: selectedLog.success ? '#a5f3fc' : '#fca5a5' }]}>
                                        {formatJson(selectedLog.output_payload)}
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>
                    ) : (
                        <Text style={styles.emptyInspector}>Selectează o înregistrare din jurnal pentru a inspecta datele.</Text>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#030712', gap: 16 },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0b0f19', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', flexWrap: 'wrap', gap: 12 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    pageTitle: { fontSize: 19, fontWeight: '700', color: '#f8fafc' },
    pageSub: { fontSize: 13, color: '#94a3b8', marginTop: 4 },
    workflowBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(99, 102, 241, 0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.3)' },
    workflowBadgeText: { fontSize: 11, color: '#818cf8', fontWeight: '600' },

    kpiRow: { flexDirection: 'row', gap: 10 },
    kpiCard: { backgroundColor: '#030712', borderWidth: 1, borderColor: '#1e293b', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, minWidth: 96 },
    kpiLabel: { fontSize: 10, color: '#64748b', fontWeight: '600', textTransform: 'uppercase' },
    kpiValue: { fontSize: 16, fontWeight: '700', color: '#f8fafc', marginTop: 2 },

    pipelineCard: { backgroundColor: '#0b0f19', borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', padding: 14, gap: 10 },
    cardSectionTitle: { fontSize: 11, fontWeight: '700', color: '#64748b', letterSpacing: 0.8 },
    stepsRow: { flexDirection: 'row', alignItems: 'stretch', gap: 10 },
    stepBox: { width: 245, backgroundColor: '#030712', borderWidth: 1, borderColor: '#1e293b', borderRadius: 12, padding: 10, gap: 6 },
    stepBoxPending: { borderColor: 'rgba(245, 158, 11, 0.4)', backgroundColor: 'rgba(245, 158, 11, 0.04)' },
    stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    stepNumBadge: { backgroundColor: 'rgba(99, 102, 241, 0.15)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
    stepNumText: { fontSize: 10, fontWeight: '700', color: '#818cf8' },
    stepRole: { flex: 1, fontSize: 12, fontWeight: '600', color: '#f8fafc' },
    stepDesc: { fontSize: 11, color: '#94a3b8', lineHeight: 16 },

    mainSplit: { flex: 1, flexDirection: 'row', gap: 16 },
    logsListPanel: { flex: 2, backgroundColor: '#0b0f19', borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', padding: 16, gap: 12 },
    filterBar: { flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
    searchBox: { flex: 1, minWidth: 200, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#030712', borderWidth: 1, borderColor: '#1e293b', borderRadius: 10, paddingHorizontal: 12, height: 38 },
    searchInput: { flex: 1, color: '#f8fafc', fontSize: 13 },
    statusPills: { flexDirection: 'row', backgroundColor: '#030712', borderRadius: 10, padding: 3, borderWidth: 1, borderColor: '#1e293b' },
    pillBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 7 },
    pillBtnActive: { backgroundColor: '#4f46e5' },
    pillText: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
    pillTextActive: { color: '#fff', fontWeight: '600' },

    agentChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: '#030712', borderWidth: 1, borderColor: '#1e293b' },
    agentChipActive: { backgroundColor: 'rgba(99, 102, 241, 0.15)', borderColor: '#818cf8' },
    agentChipText: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
    agentChipTextActive: { color: '#818cf8', fontWeight: '600' },

    logsScroll: { gap: 8, paddingTop: 4 },
    logRowCard: { flexDirection: 'row', backgroundColor: '#030712', borderRadius: 12, borderWidth: 1, borderColor: '#1e293b', padding: 12, gap: 12 },
    logRowCardSelected: { borderColor: '#818cf8', backgroundColor: 'rgba(99, 102, 241, 0.06)' },
    statusBarIndicator: { width: 4, borderRadius: 2 },
    logRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    logAgentRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    logAgentName: { fontSize: 13, fontWeight: '700', color: '#f8fafc' },
    logToolBadge: { fontSize: 11, color: '#818cf8', backgroundColor: 'rgba(99, 102, 241, 0.12)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, fontFamily: 'monospace' },
    logTimestamp: { fontSize: 11, color: '#64748b' },
    logPreviewPayload: { fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' },
    logMetaFooter: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 2 },
    statusTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    statusTagText: { fontSize: 10, fontWeight: '700' },
    metaMetric: { fontSize: 11, color: '#cbd5e1' },

    inspectorPanel: { flex: 1, minWidth: 300, backgroundColor: '#0b0f19', borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', padding: 16, gap: 12 },
    inspectorHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: '#1e293b', paddingBottom: 10 },
    inspectorTitle: { fontSize: 14, fontWeight: '700', color: '#f8fafc' },
    inspectorMetaBox: { backgroundColor: '#030712', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#1e293b', gap: 2 },
    inspectorLabel: { fontSize: 10, fontWeight: '700', color: '#64748b', marginBottom: 4, letterSpacing: 0.6 },
    inspectorMainVal: { fontSize: 14, fontWeight: '700', color: '#f8fafc' },
    inspectorSubVal: { fontSize: 12, color: '#818cf8', fontFamily: 'monospace' },
    codeBlock: { backgroundColor: '#030712', borderWidth: 1, borderColor: '#1e293b', borderRadius: 10, padding: 12 },
    codeText: { fontSize: 12, color: '#cbd5e1', fontFamily: 'monospace', lineHeight: 18 },
    emptyInspector: { fontSize: 13, color: '#64748b', fontStyle: 'italic' },
});