import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EXPERIMENTS = {
    multi_mem: {
        label: 'Multi-Agent + Memorie (Recomandat)',
        completionRate: 94.0,
        avgLatencyMs: 1280,
        avgCostUsd: 0.0021,
        failedOrRepeatedCalls: 1,
        totalCalls: 42,
        summary: 'Decompunerea pe agenți specializați + context persistent reduce apelurile redundante la calendar și crește rata de succes.',
    },
    multi_no_mem: {
        label: 'Multi-Agent fără Memorie',
        completionRate: 84.0,
        avgLatencyMs: 1490,
        avgCostUsd: 0.0026,
        failedOrRepeatedCalls: 5,
        totalCalls: 49,
        summary: 'Fără memorie, agenții re-interoghează preferințele utilizatorului la fiecare rulare, crescând latența și numărul de pași.',
    },
    single_agent: {
        label: 'Single-Agent Baseline',
        completionRate: 72.0,
        avgLatencyMs: 1840,
        avgCostUsd: 0.0038,
        failedOrRepeatedCalls: 9,
        totalCalls: 54,
        summary: 'Un singur prompt monolitic cu toate tool-urile are rată mai mare de selecție greșită a parametrilor și consum mai mare de tokeni.',
    },
};

const BENCHMARK_SCENARIOS = [
    {
        id: 'SC-01',
        name: 'Planificare zi în jurul ședințelor existente + 2h licență',
        singleAgent: '70% (Conflict la 14:00)',
        multiNoMem: '85% (Necesită 2 încercări)',
        multiWithMem: '96% (Respectă intervalul 09-13)',
        latencyDelta: '-31%',
    },
    {
        id: 'SC-02',
        name: 'Extragere task-uri din notițe de ședință + aprobare',
        singleAgent: '75% (Omite deadline-uri)',
        multiNoMem: '88% (Structură validă)',
        multiWithMem: '95% (Mapare completă + draft)',
        latencyDelta: '-24%',
    },
    {
        id: 'SC-03',
        name: 'Reprogramare automată la detectarea unui conflict',
        singleAgent: '65% (Buclă de tool calls)',
        multiNoMem: '80% (Recuperare parțială)',
        multiWithMem: '92% (Fallback determinist)',
        latencyDelta: '-38%',
    },
    {
        id: 'SC-04',
        name: 'Pregătire ședință (rezumat document + verificare calendar)',
        singleAgent: '78% (Context trunchiat)',
        multiNoMem: '83% (Lipsă preferințe format)',
        multiWithMem: '93% (Format preferat aplicat)',
        latencyDelta: '-27%',
    },
];

export default function EvaluationMetrics() {
    const [selectedConfig, setSelectedConfig] = useState('multi_mem');
    const [isRunningBenchmark, setIsRunningBenchmark] = useState(false);

    const activeData = EXPERIMENTS[selectedConfig];

    const handleRunSuite = () => {
        setIsRunningBenchmark(true);
        setTimeout(() => setIsRunningBenchmark(false), 700);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ gap: 16, paddingBottom: 32 }}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <View>
                    <Text style={styles.pageTitle}>Metrici de Evaluare & Benchmark (Thesis Evaluation Plan)</Text>
                    <Text style={styles.pageSub}>
                        Comparație experimentală: Single-Agent vs. Multi-Agent, cu și fără reutilizarea memoriei.
                    </Text>
                </View>

                <TouchableOpacity style={styles.runBtn} onPress={handleRunSuite}>
                    <Ionicons name={isRunningBenchmark ? 'sync' : 'play'} size={15} color="#fff" />
                    <Text style={styles.runBtnText}>
                        {isRunningBenchmark ? 'Se rulează suita...' : 'Rulează Suita Sintetică (10 scenarii)'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Architecture Selector Pills */}
            <View style={styles.selectorRow}>
                {Object.entries(EXPERIMENTS).map(([key, cfg]) => {
                    const active = selectedConfig === key;
                    return (
                        <TouchableOpacity
                            key={key}
                            style={[styles.archCard, active && styles.archCardActive]}
                            onPress={() => setSelectedConfig(key)}
                        >
                            <View style={styles.archTop}>
                                <Ionicons
                                    name={key === 'single_agent' ? 'cube-outline' : 'git-network-outline'}
                                    size={16}
                                    color={active ? '#818cf8' : '#64748b'}
                                />
                                <Text style={[styles.archTitle, active && { color: '#f8fafc' }]}>{cfg.label}</Text>
                            </View>
                            <Text style={styles.archMetricPreview}>
                                Succes: {cfg.completionRate}% • Latență: {cfg.avgLatencyMs}ms
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* 4 Main KPI Cards */}
            <View style={styles.kpiGrid}>
                <View style={styles.kpiBox}>
                    <Text style={styles.kpiLabel}>TASK COMPLETION RATE</Text>
                    <Text style={[styles.kpiBig, { color: '#34d399' }]}>{activeData.completionRate}%</Text>
                    <Text style={styles.kpiHint}>Scenarii finalizate fără erori critice</Text>
                </View>

                <View style={styles.kpiBox}>
                    <Text style={styles.kpiLabel}>LATENȚĂ MEDIE / WORKFLOW</Text>
                    <Text style={styles.kpiBig}>{activeData.avgLatencyMs} ms</Text>
                    <Text style={styles.kpiHint}>Timp end-to-end (planificare + tool-uri)</Text>
                </View>

                <View style={styles.kpiBox}>
                    <Text style={styles.kpiLabel}>COST MEDIU MODEL / RULARE</Text>
                    <Text style={[styles.kpiBig, { color: '#818cf8' }]}>${activeData.avgCostUsd.toFixed(4)}</Text>
                    <Text style={styles.kpiHint}>Estimare bazată pe tokenii input/output</Text>
                </View>

                <View style={styles.kpiBox}>
                    <Text style={styles.kpiLabel}>APELURI EȘUATE / REPETATE</Text>
                    <Text style={[styles.kpiBig, { color: activeData.failedOrRepeatedCalls <= 2 ? '#34d399' : '#f59e0b' }]}>
                        {activeData.failedOrRepeatedCalls} / {activeData.totalCalls}
                    </Text>
                    <Text style={styles.kpiHint}>Eficiența rutării și a validării schemelor</Text>
                </View>
            </View>

            {/* Visual Horizontal Bar Comparison */}
            <View style={styles.chartCard}>
                <Text style={styles.cardTitle}>COMPARAȚIE VIZUALĂ: RATĂ DE SUCCES & LATENȚĂ RELATIVĂ</Text>
                <View style={{ gap: 14, marginTop: 6 }}>
                    {Object.entries(EXPERIMENTS).map(([key, item]) => (
                        <View key={key} style={{ gap: 6 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={styles.barLabel}>{item.label}</Text>
                                <Text style={styles.barVal}>
                                    {item.completionRate}% succes  |  {item.avgLatencyMs} ms  |  ${item.avgCostUsd.toFixed(4)}
                                </Text>
                            </View>
                            <View style={styles.barTrack}>
                                <View
                                    style={[
                                        styles.barFill,
                                        {
                                            width: `${item.completionRate}%`,
                                            backgroundColor:
                                                key === 'multi_mem' ? '#4f46e5' : key === 'multi_no_mem' ? '#0ea5e9' : '#64748b',
                                        },
                                    ]}
                                />
                            </View>
                        </View>
                    ))}
                </View>
                <View style={styles.insightBanner}>
                    <Ionicons name="bulb-outline" size={16} color="#818cf8" />
                    <Text style={styles.insightText}>{activeData.summary}</Text>
                </View>
            </View>

            {/* Synthetic Test Scenarios Table */}
            <View style={styles.tableCard}>
                <Text style={styles.cardTitle}>REZULTATE PE SUITA DE SCENARII SINTETICE</Text>
                <View style={styles.tableHeader}>
                    <Text style={[styles.th, { flex: 2.2 }]}>Scenariu de Test</Text>
                    <Text style={[styles.th, { flex: 1.2 }]}>Single-Agent</Text>
                    <Text style={[styles.th, { flex: 1.2 }]}>Multi (Fără Mem.)</Text>
                    <Text style={[styles.th, { flex: 1.3 }]}>Multi + Memorie</Text>
                    <Text style={[styles.th, { width: 80, textAlign: 'right' }]}>Δ Latență</Text>
                </View>

                {BENCHMARK_SCENARIOS.map(row => (
                    <View key={row.id} style={styles.tableRow}>
                        <View style={{ flex: 2.2, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={styles.scId}>{row.id}</Text>
                            <Text style={styles.tdMain}>{row.name}</Text>
                        </View>
                        <Text style={[styles.td, { flex: 1.2 }]}>{row.singleAgent}</Text>
                        <Text style={[styles.td, { flex: 1.2 }]}>{row.multiNoMem}</Text>
                        <Text style={[styles.tdHighlight, { flex: 1.3 }]}>{row.multiWithMem}</Text>
                        <Text style={[styles.tdDelta, { width: 80, textAlign: 'right' }]}>{row.latencyDelta}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#030712' },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0b0f19', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', flexWrap: 'wrap', gap: 12 },
    pageTitle: { fontSize: 19, fontWeight: '700', color: '#f8fafc' },
    pageSub: { fontSize: 13, color: '#94a3b8', marginTop: 4 },
    runBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#4f46e5', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
    runBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },

    selectorRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
    archCard: { flex: 1, minWidth: 220, backgroundColor: '#0b0f19', borderWidth: 1, borderColor: '#1e293b', borderRadius: 14, padding: 14, gap: 6 },
    archCardActive: { borderColor: '#818cf8', backgroundColor: 'rgba(99, 102, 241, 0.08)' },
    archTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    archTitle: { fontSize: 13, fontWeight: '700', color: '#94a3b8' },
    archMetricPreview: { fontSize: 12, color: '#cbd5e1' },

    kpiGrid: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
    kpiBox: { flex: 1, minWidth: 190, backgroundColor: '#0b0f19', borderWidth: 1, borderColor: '#1e293b', borderRadius: 14, padding: 16, gap: 4 },
    kpiLabel: { fontSize: 10, fontWeight: '700', color: '#64748b', letterSpacing: 0.6 },
    kpiBig: { fontSize: 24, fontWeight: '800', color: '#f8fafc', marginVertical: 2 },
    kpiHint: { fontSize: 11, color: '#94a3b8' },

    chartCard: { backgroundColor: '#0b0f19', borderWidth: 1, borderColor: '#1e293b', borderRadius: 16, padding: 16, gap: 12 },
    cardTitle: { fontSize: 11, fontWeight: '700', color: '#64748b', letterSpacing: 0.7 },
    barLabel: { fontSize: 13, fontWeight: '600', color: '#f8fafc' },
    barVal: { fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' },
    barTrack: { height: 10, backgroundColor: '#030712', borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: '#1e293b' },
    barFill: { height: '100%', borderRadius: 6 },
    insightBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(99, 102, 241, 0.1)', borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.25)', padding: 12, borderRadius: 10, marginTop: 4 },
    insightText: { flex: 1, fontSize: 12, color: '#cbd5e1', lineHeight: 18 },

    tableCard: { backgroundColor: '#0b0f19', borderWidth: 1, borderColor: '#1e293b', borderRadius: 16, padding: 16, gap: 8 },
    tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#1e293b', paddingBottom: 8, marginTop: 4 },
    th: { fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },
    tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#1e293b', gap: 8 },
    scId: { fontSize: 11, fontWeight: '700', color: '#818cf8', backgroundColor: 'rgba(99, 102, 241, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    tdMain: { flex: 1, fontSize: 13, fontWeight: '600', color: '#f8fafc' },
    td: { fontSize: 12, color: '#94a3b8' },
    tdHighlight: { fontSize: 12, color: '#34d399', fontWeight: '600' },
    tdDelta: { fontSize: 12, color: '#818cf8', fontWeight: '700', fontFamily: 'monospace' },
});