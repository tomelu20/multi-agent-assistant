import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ChatArea({ messages, onSendMessage, pendingApproval, onApprove }) {
    const [inputText, setInputText] = useState('');
    const [selectedAgent, setSelectedAgent] = useState('Planner Master (3.5)');
    const [showAgentMenu, setShowAgentMenu] = useState(false);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [showDriveModal, setShowDriveModal] = useState(false);
    const [driveFileName, setDriveFileName] = useState('Document_Drive.docx');
    const [attachedFile, setAttachedFile] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const fileInputRef = useRef(null);

    const agentsList = [
        { id: 'planner', name: 'Planner Master', model: '3.5 Flash-Lite' },
        { id: 'calendar', name: 'Calendar Agent', model: '3.8 Flash' },
        { id: 'task', name: 'Task & Document Agent', model: '3.1 Pro' },
        { id: 'memory', name: 'Memory Agent', model: '4 Carbon' },
    ];

    const driveSampleFiles = [
        { name: 'Plan_Licenta.docx', ext: 'DOCX' },
        { name: 'Notite_Examen.pdf', ext: 'PDF' },
        { name: 'Orar_Saptamanal.xlsx', ext: 'XLSX' },
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

    const handleTriggerUploadFiles = () => {
        setShowAttachMenu(false);
        setShowDriveModal(false);
        setTimeout(() => {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
                fileInputRef.current.click();
            } else if (typeof document !== 'undefined') {
                const el = document.getElementById('chat-file-upload-input');
                if (el) {
                    el.value = '';
                    el.click();
                }
            }
        }, 0);
    };

    const handleFileChange = (event) => {
        const file = event?.target?.files?.[0];
        if (!file) return;

        const ext = file.name.includes('.') ? file.name.split('.').pop().toUpperCase() : 'FILE';
        setAttachedFile({
            name: file.name,
            ext,
            size: file.size || 0,
            source: 'local'
        });
    };

    const handleOpenDriveModal = () => {
        setShowAttachMenu(false);
        setShowAgentMenu(false);
        setShowDriveModal(true);
    };

    const handleConfirmDriveFile = (customName) => {
        const cleanName = (customName || driveFileName || '').trim();
        if (!cleanName) return;
        const ext = cleanName.includes('.') ? cleanName.split('.').pop().toUpperCase() : 'DRIVE';
        setAttachedFile({
            name: cleanName,
            ext,
            source: 'drive'
        });
        setShowDriveModal(false);
    };

    const getFileShortTag = (file) => {
        if (!file) return '';
        if (file.ext) return file.ext.toLowerCase();
        if (file.name && file.name.includes('.')) {
            return file.name.split('.').pop().toLowerCase();
        }
        return 'file';
    };

    return (
        <View style={styles.chatContainer}>
            <input
                id="chat-file-upload-input"
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            {(showAttachMenu || showAgentMenu || showDriveModal) && (
                <div
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 95 }}
                    onClick={() => {
                        setShowAttachMenu(false);
                        setShowAgentMenu(false);
                        setShowDriveModal(false);
                    }}
                />
            )}

            <ScrollView contentContainerStyle={styles.messagesScroll} showsVerticalScrollIndicator={false}>
                {messages.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, paddingTop: 80 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', displayContent: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="sparkles" size={28} color="#818cf8" />
                        </div>
                        <Text style={styles.welcomeTitle}>Asistentul tău Multi-Agent este pregătit</Text>
                        <Text style={styles.welcomeSub}>Trimite un obiectiv în limbaj natural, atașează documente sau alege un agent specializat.</Text>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const rawFile = msg && typeof msg.file === 'object' && msg.file !== null ? msg.file : null;
                        const hasFile = Boolean(rawFile && rawFile.name);
                        const rawText = (msg && typeof msg.text === 'string') ? msg.text.trim() : '';
                        const hasText = Boolean(rawText && !(hasFile && rawText === rawFile.name));
                        if (!hasFile && !hasText) return null;

                        return (
                            <View key={index} style={[styles.messageRow, msg.sender === 'user' ? styles.userRow : styles.assistantRow]}>
                                {msg.sender !== 'user' && (
                                    <View style={styles.avatarAgent}>
                                        <Ionicons name="sparkles" size={14} color="#818cf8" />
                                    </View>
                                )}
                                <View style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : styles.assistantBubble]}>
                                    {hasFile && (
                                        <View style={styles.docCardBubble}>
                                            <View style={styles.docCardIconBox}>
                                                <Ionicons name="code-slash" size={15} color="#f97316" />
                                            </View>
                                            <View style={{ gap: 2 }}>
                                                <Text style={styles.docCardTitle} numberOfLines={1}>{rawFile.name}</Text>
                                                <Text style={styles.docCardSub}>{getFileShortTag(rawFile)}</Text>
                                            </View>
                                        </View>
                                    )}
                                    {hasText && (
                                        <Text style={styles.messageText}>{rawText}</Text>
                                    )}
                                </View>
                            </View>
                        );
                    })
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
                    <View style={styles.attachedPreviewCard}>
                        <View style={styles.docCardIconBox}>
                            <Ionicons name="code-slash" size={15} color="#f97316" />
                        </View>
                        <View style={{ gap: 1, marginRight: 4 }}>
                            <Text style={styles.docCardTitle} numberOfLines={1}>{attachedFile.name}</Text>
                            <Text style={styles.docCardSub}>{getFileShortTag(attachedFile)}</Text>
                        </View>
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

                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, position: 'relative', zIndex: 110 }}>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, position: 'relative', zIndex: 120 }}>
                            <TouchableOpacity
                                style={styles.toolBtn}
                                onPress={() => {
                                    setShowAttachMenu(!showAttachMenu);
                                    setShowAgentMenu(false);
                                    setShowDriveModal(false);
                                }}
                            >
                                <Ionicons name="attach-outline" size={18} color="#94a3b8" />
                            </TouchableOpacity>

                            {showAttachMenu && (
                                <View style={styles.attachDropdown}>
                                    <TouchableOpacity style={styles.attachOption} onPress={handleTriggerUploadFiles}>
                                        <Ionicons name="document-outline" size={16} color="#94a3b8" />
                                        <Text style={styles.attachOptionText}>Upload files</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.attachOption} onPress={handleOpenDriveModal}>
                                        <Ionicons name="folder-open-outline" size={16} color="#94a3b8" />
                                        <Text style={styles.attachOptionText}>Add from Drive</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {showDriveModal && (
                                <View style={styles.driveModalCard}>
                                    <Text style={styles.driveModalTitle}>Selectează sau adaugă fișier din Drive</Text>
                                    <View style={{ gap: 4 }}>
                                        {driveSampleFiles.map((item) => (
                                            <TouchableOpacity
                                                key={item.name}
                                                style={styles.driveSampleBtn}
                                                onPress={() => handleConfirmDriveFile(item.name)}
                                            >
                                                <Ionicons name="document-text-outline" size={15} color="#818cf8" />
                                                <Text style={styles.driveSampleText}>{item.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                                        <TextInput
                                            style={styles.driveInput}
                                            value={driveFileName}
                                            onChangeText={setDriveFileName}
                                            placeholder="Nume fișier..."
                                            placeholderTextColor="#64748b"
                                        />
                                        <TouchableOpacity style={styles.driveConfirmBtn} onPress={() => handleConfirmDriveFile(driveFileName)}>
                                            <Text style={styles.driveConfirmText}>Adaugă</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.agentSelectorBtn}
                                onPress={() => {
                                    setShowAgentMenu(!showAgentMenu);
                                    setShowAttachMenu(false);
                                    setShowDriveModal(false);
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
    messageBubble: { padding: 12, borderRadius: 16, gap: 8 },
    userBubble: { backgroundColor: '#4f46e5', borderBottomRightRadius: 4 },
    assistantBubble: { backgroundColor: '#0b0f19', borderWidth: 1, borderColor: '#1e293b', borderBottomLeftRadius: 4 },
    messageText: { fontSize: 14, color: '#f8fafc', lineHeight: 20 },
    docCardBubble: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#1e2028', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, minWidth: 130 },
    docCardIconBox: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(249, 115, 22, 0.14)', justifyContent: 'center', alignItems: 'center' },
    docCardTitle: { fontSize: 13, fontWeight: '700', color: '#f8fafc', maxWidth: 170 },
    docCardSub: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
    approvalBox: { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)', borderRadius: 14, padding: 16, gap: 10, marginTop: 10 },
    approvalTitle: { fontSize: 14, fontWeight: '700', color: '#f59e0b' },
    approvalDesc: { fontSize: 13, color: '#cbd5e1' },
    approveButton: { backgroundColor: '#f59e0b', borderRadius: 8, height: 38, justifyContent: 'center', alignItems: 'center' },
    approveButtonText: { color: '#030712', fontSize: 13, fontWeight: '700' },
    inputAreaWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#030712', borderTopWidth: 1, borderTopColor: '#1e293b', zIndex: 105 },
    attachedPreviewCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1e2028', borderWidth: 1, borderColor: '#334155', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, marginBottom: 8, alignSelf: 'flex-start' },
    inputCard: { backgroundColor: '#0b0f19', borderWidth: 1, borderColor: '#1e293b', borderRadius: 20, padding: 14 },
    mainInput: { color: '#f8fafc', fontSize: 14, maxHeight: 120, textAlignVertical: 'top' },
    toolBtn: { width: 34, height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
    attachDropdown: { position: 'absolute', bottom: 44, left: 0, width: 190, backgroundColor: '#0b0f19', borderWidth: 1, borderColor: '#1e293b', borderRadius: 12, padding: 6, zIndex: 200, gap: 4 },
    attachOption: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, borderRadius: 8 },
    attachOptionText: { fontSize: 13, color: '#cbd5e1' },
    driveModalCard: { position: 'absolute', bottom: 44, left: 0, width: 290, backgroundColor: '#0b0f19', borderWidth: 1, borderColor: '#334155', borderRadius: 14, padding: 12, zIndex: 220, gap: 8 },
    driveModalTitle: { fontSize: 12, fontWeight: '700', color: '#f8fafc' },
    driveSampleBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.03)' },
    driveSampleText: { fontSize: 12, color: '#cbd5e1' },
    driveInput: { flex: 1, height: 34, backgroundColor: '#030712', borderWidth: 1, borderColor: '#1e293b', borderRadius: 8, paddingHorizontal: 8, color: '#f8fafc', fontSize: 12 },
    driveConfirmBtn: { height: 34, paddingHorizontal: 12, backgroundColor: '#4f46e5', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    driveConfirmText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    agentSelectorBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.3)' },
    agentSelectorText: { fontSize: 12, color: '#818cf8', fontWeight: '600' },
    agentDropdown: { position: 'absolute', bottom: 44, left: 0, width: 240, backgroundColor: '#0b0f19', borderWidth: 1, borderColor: '#1e293b', borderRadius: 12, padding: 6, zIndex: 200 },
    agentOption: { padding: 10, borderRadius: 8 },
    agentOptionTitle: { fontSize: 13, fontWeight: '600', color: '#f8fafc' },
    agentOptionSub: { fontSize: 11, color: '#64748b' },
    micBtn: { width: 34, height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
    micBtnActive: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.4)' },
    sendBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
    disclaimerText: { fontSize: 10, color: '#64748b', textAlign: 'center', marginTop: 6 },
});