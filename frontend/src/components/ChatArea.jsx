import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ChatArea({ messages, onSendMessage, pendingApproval, onApprove }) {
    const [inputText, setInputText] = useState('');
    const [selectedAgent, setSelectedAgent] = useState('Planner Master (3.5)');
    const [showAgentMenu, setShowAgentMenu] = useState(false);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [attachedFile, setAttachedFile] = useState(null);
    const [isRecording, setIsRecording] = useState(false);

    const agentsList = [
        { id: 'planner', name: 'Planner Master', model: '3.5 Flash-Lite' },
        { id: 'calendar', name: 'Calendar Agent', model: '3.8 Flash' },
        { id: 'task', name: 'Task & Document Agent', model: '3.1 Pro' },
        { id: 'memory', name: 'Memory Agent', model: '4 Carbon' },
    ];

    const handleSend = () => {
        if (!inputText.trim() && !attachedFile) return;
        onSendMessage(inputText, attachedFile, selectedAgent);
        setInputText('');
        setAttachedFile(null);
    };

    const handleVoiceRecording = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Browserul tău nu suportă recunoașterea vocală.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'ro-RO';
        recognition.interimResults = true;

        if (!isRecording) {
            recognition.start();
            setIsRecording(true);
            setInputText('Ascultare activă...');

            recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                setInputText(transcript);
            };

            recognition.onerror = () => {
                setIsRecording(false);
                setInputText('');
            };

            recognition.onend = () => {
                setIsRecording(false);
            };
        } else {
            recognition.stop();
            setIsRecording(false);
        }
    };

    const handleSelectAttachment = (typeName) => {
        setAttachedFile({ name: typeName, type: 'document' });
        setShowAttachMenu(false);
    };

    return (
        <View style={styles.chatContainer}>
            {/* Fundal invizibil pentru a închide meniurile la click în afara lor */}
            {(showAttachMenu || showAgentMenu) && (
                <div
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }}
                    onClick={() => { setShowAttachMenu(false); setShowAgentMenu(false); }}
                />
            )}

            <ScrollView contentContainerStyle={styles.messagesScroll} showsVerticalScrollIndicator={false}>
                {messages.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, paddingTop: 80 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="sparkles" size={28} color="#818cf8" />
                        </div>
                        <Text style={styles.welcomeTitle}>Asistentul tău Multi-Agent este pregătit</Text>
                        <Text style={styles.welcomeSub}>Trimite un obiectiv în limbaj natural, atașează documente sau alege un agent specializat.</Text>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <View key={index} style={[styles.messageRow, msg.sender === 'user' ? styles.userRow : styles.assistantRow]}>
                            {msg.sender !== 'user' && (
                                <View style={styles.avatarAgent}>
                                    <Ionicons name="sparkles" size={14} color="#818cf8" />
                                </View>
                            )}
                            <View style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : styles.assistantBubble]}>
                                <Text style={styles.messageText}>{msg.text}</Text>
                                {msg.file && (
                                    <View style={styles.fileBadge}>
                                        <Ionicons name="document-attach-outline" size={14} color="#818cf8" />
                                        <Text style={styles.fileBadgeText}>{msg.file.name}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))
                )}

                {pendingApproval && (
                    <View style={styles.approvalBox}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Ionicons name="alert-circle" size={20} color="#f59e0b" />
                            <Text style={styles.approvalTitle}>Aprobare Umană Necesară (Write Action)</Text>
                        </View>
                        <Text style={styles.approvalDesc}>Asistentul dorește să creeze task-uri în baza de date și să modifice calendarul extern.</Text>
                        <TouchableOpacity style={styles.approveButton} onPress={onApprove}>
                            <Text style={styles.approveButtonText}>Aprobă și Execută Acțiunea</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            <View style={styles.inputAreaWrapper}>
                {attachedFile && (
                    <View style={styles.attachedPreview}>
                        <Ionicons name="document" size={16} color="#818cf8" />
                        <Text style={styles.attachedName}>{attachedFile.name}</Text>
                        <TouchableOpacity onPress={() => setAttachedFile(null)}>
                            <Ionicons name="close-circle" size={16} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.inputCard}>
                    <TextInput
                        style={styles.mainInput}
                        placeholder="Întreabă asistentul sau dă o comandă..."
                        placeholderTextColor="#64748b"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />

                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                        {/* Buton Atașare & Meniu Popup (Doar Upload files și Add from Drive) */}
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, position: 'relative' }}>
                            <TouchableOpacity
                                style={styles.toolBtn}
                                onPress={() => {
                                    setShowAttachMenu(!showAttachMenu);
                                    setShowAgentMenu(false); // Închide meniul de agenți dacă era deschis
                                }}
                            >
                                <Ionicons name="attach-outline" size={18} color="#94a3b8" />
                            </TouchableOpacity>

                            {showAttachMenu && (
                                <View style={styles.attachDropdown}>
                                    <TouchableOpacity style={styles.attachOption} onPress={() => handleSelectAttachment('Upload file.pdf')}>
                                        <Ionicons name="document-outline" size={16} color="#94a3b8" />
                                        <Text style={styles.attachOptionText}>Upload files</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.attachOption} onPress={() => handleSelectAttachment('Drive Document.docx')}>
                                        <Ionicons name="folder-open-outline" size={16} color="#94a3b8" />
                                        <Text style={styles.attachOptionText}>Add from Drive</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Selector Agent */}
                            <TouchableOpacity
                                style={styles.agentSelectorBtn}
                                onPress={() => {
                                    setShowAgentMenu(!showAgentMenu);
                                    setShowAttachMenu(false); // Închide meniul de atașamente dacă era deschis
                                }}
                            >
                                <Ionicons name="hardware-chip-outline" size={14} color="#818cf8" />
                                <Text style={styles.agentSelectorText}>{selectedAgent}</Text>
                                <Ionicons name="chevron-down" size={12} color="#94a3b8" />
                            </TouchableOpacity>

                            {showAgentMenu && (
                                <View style={styles.agentDropdown}>
                                    {agentsList.map((ag) => (
                                        <TouchableOpacity
                                            key={ag.id}
                                            style={styles.agentOption}
                                            onPress={() => { setSelectedAgent(`${ag.name} (${ag.model})`); setShowAgentMenu(false); }}
                                        >
                                            <Text style={styles.agentOptionTitle}>{ag.name}</Text>
                                            <Text style={styles.agentOptionSub}>{ag.model}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </div>

                        {/* Microfon & Buton Trimite */}
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <TouchableOpacity
                                style={[styles.micBtn, isRecording && styles.micBtnActive]}
                                onPress={handleVoiceRecording}
                                title="Vorbește (Speech-to-Text)"
                            >
                                <Ionicons name={isRecording ? "mic" : "mic-outline"} size={18} color={isRecording ? "#ef4444" : "#94a3b8"} />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                                <Ionicons name="arrow-up" size={18} color="#fff" />
                            </TouchableOpacity>
                        </div>
                    </div>
                </View>
                <Text style={styles.disclaimerText}>Asistentul AI poate comite erori. Verifică acțiunile critice.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    chatContainer: { flex: 1, backgroundColor: '#030712', display: 'flex', flexDirection: 'column', position: 'relative' },
    messagesScroll: { padding: 24, gap: 16, paddingBottom: 140 },
    welcomeTitle: { fontSize: 20, fontWeight: '700', color: '#f8fafc', textAlign: 'center' },
    welcomeSub: { fontSize: 13, color: '#94a3b8', textAlign: 'center', maxWidth: 440, lineHeight: 20 },
    messageRow: { flexDirection: 'row', gap: 12, maxWidth: '80%' },
    userRow: { alignSelf: 'flex-end' },
    assistantRow: { alignSelf: 'flex-start' },
    avatarAgent: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(99, 102, 241, 0.15)', borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.3)', justifyContent: 'center', alignItems: 'center', marginTop: 4 },
    messageBubble: { padding: 14, borderRadius: 16, gap: 8 },
    userBubble: { backgroundColor: '#4f46e5', borderBottomRightRadius: 4 },
    assistantBubble: { backgroundColor: '#0b0f19', borderWidth: 1, borderColor: '#1e293b', borderBottomLeftRadius: 4 },
    messageText: { fontSize: 14, color: '#f8fafc', lineHeight: 20 },
    fileBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: 6, borderRadius: 8 },
    fileBadgeText: { fontSize: 12, color: '#818cf8', fontWeight: '500' },
    approvalBox: { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)', borderRadius: 14, padding: 16, gap: 10, marginTop: 10 },
    approvalTitle: { fontSize: 14, fontWeight: '700', color: '#f59e0b' },
    approvalDesc: { fontSize: 13, color: '#cbd5e1' },
    approveButton: { backgroundColor: '#f59e0b', borderRadius: 8, height: 38, justifyContent: 'center', alignItems: 'center' },
    approveButtonText: { color: '#030712', fontSize: 13, fontWeight: '700' },
    inputAreaWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#030712', borderTopWidth: 1, borderTopColor: '#1e293b' },
    attachedPreview: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0b0f19', borderWidth: 1, borderColor: '#1e293b', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginBottom: 8, alignSelf: 'flex-start' },
    attachedName: { fontSize: 12, color: '#818cf8' },
    inputCard: { backgroundColor: '#0b0f19', borderWidth: 1, borderColor: '#1e293b', borderRadius: 20, padding: 14 },
    mainInput: { color: '#f8fafc', fontSize: 14, maxHeight: 120, textAlignVertical: 'top' },
    toolBtn: { width: 34, height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
    attachDropdown: { position: 'absolute', bottom: 44, left: 0, width: 180, backgroundColor: '#0b0f19', borderWidth: 1, borderColor: '#1e293b', borderRadius: 12, padding: 6, zIndex: 100, gap: 4 },
    attachOption: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, borderRadius: 8 },
    attachOptionText: { fontSize: 13, color: '#cbd5e1' },
    agentSelectorBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.3)' },
    agentSelectorText: { fontSize: 12, color: '#818cf8', fontWeight: '600' },
    agentDropdown: { position: 'absolute', bottom: 44, left: 0, width: 240, backgroundColor: '#0b0f19', borderWidth: 1, borderColor: '#1e293b', borderRadius: 12, padding: 6, zIndex: 100 },
    agentOption: { padding: 10, borderRadius: 8 },
    agentOptionTitle: { fontSize: 13, fontWeight: '600', color: '#f8fafc' },
    agentOptionSub: { fontSize: 11, color: '#64748b' },
    micBtn: { width: 34, height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
    micBtnActive: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.4)' },
    sendBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
    disclaimerText: { fontSize: 10, color: '#64748b', textAlign: 'center', marginTop: 6 },
});