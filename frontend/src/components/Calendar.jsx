import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const formatDateToRO = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

export default function Calendar({ accessToken }) {
    const [currentDate, setCurrentDate] = useState(() => new Date());
    const [selectedDate, setSelectedDate] = useState(() => formatDateToRO(new Date()));
    const [events, setEvents] = useState([]);
    const [requestError, setRequestError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Stări formular adăugare
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newTime, setNewTime] = useState('10:00');

    useEffect(() => {
        let isCurrent = true;

        const loadEvents = async () => {
            setIsLoading(true);
            setRequestError('');
            if (!accessToken) {
                setEvents([]);
                setRequestError('Sesiunea a expirat. Autentifică-te din nou pentru a folosi calendarul.');
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/calendar/events`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.detail || 'Evenimentele nu au putut fi încărcate.');
                }
                if (isCurrent) setEvents(data);
            } catch (error) {
                console.error('Eroare la încărcarea calendarului:', error);
                if (isCurrent) {
                    setRequestError(error instanceof Error ? error.message : 'Evenimentele nu au putut fi încărcate.');
                }
            } finally {
                if (isCurrent) setIsLoading(false);
            }
        };

        loadEvents();
        return () => {
            isCurrent = false;
        };
    }, [accessToken]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-11

    const monthNames = [
        "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
        "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"
    ];

    const daysOfWeek = ['Dum', "Lun", "Mar", "Mie", "Joi", "Vin", "Sâm"];

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const calendarDays = [];
    for (let i = 0; i < firstDayIndex; i++) {
        calendarDays.push({ empty: true, id: `empty-${i}` });
    }
    for (let d = 1; d <= totalDays; d++) {
        const cellDate = new Date(year, month, d);
        const dateString = formatDateToRO(cellDate);
        calendarDays.push({ empty: false, dayNumber: d, dateString, id: dateString });
    }

    const handleAddEvent = async () => {
        if (!newTitle.trim()) {
            setRequestError('Introdu titlul evenimentului.');
            return;
        }

        setRequestError('');

        try {
            const response = await fetch(`${API_BASE_URL}/calendar/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    title: newTitle.trim(),
                    date: selectedDate,
                    time: newTime.trim(),
                }),
            });

            const savedEvent = await response.json();
            if (!response.ok) {
                throw new Error(savedEvent.detail || 'Evenimentul nu a putut fi salvat.');
            }

            setEvents(previousEvents => [...previousEvents, savedEvent]);
            setNewTitle('');
            setNewTime('10:00');
            setShowAddModal(false);
        } catch (error) {
            console.error('Eroare la salvarea evenimentului:', error);
            setRequestError(error instanceof Error ? error.message : 'Eroare de conexiune cu serverul.');
        }
    };

    const selectedDayEvents = events.filter(e => e.date === selectedDate);

    return (
        <View style={styles.container}>
            {/* Bara de sus / Control Calendar */}
            <View style={styles.topBar}>
                <View style={styles.monthNavigator}>
                    <Text style={styles.monthTitle}>{monthNames[month]} {year}</Text>
                    <View style={styles.navButtons}>
                        <TouchableOpacity style={styles.navBtn} onPress={prevMonth}>
                            <Ionicons name="chevron-back" size={16} color="#f8fafc" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navBtn} onPress={nextMonth}>
                            <Ionicons name="chevron-forward" size={16} color="#f8fafc" />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
                    <Ionicons name="add" size={16} color="#fff" />
                    <Text style={styles.addBtnText}>Adaugă Eveniment</Text>
                </TouchableOpacity>
            </View>

            {/* Layout principal */}
            <View style={styles.mainContent}>
                {/* Grila Calendarului */}
                <View style={styles.calendarGridContainer}>
                    <View style={styles.weekDaysRow}>
                        {daysOfWeek.map((d, index) => (
                            <Text key={index} style={styles.weekDayText}>{d}</Text>
                        ))}
                    </View>

                    <View style={styles.daysGrid}>
                        {calendarDays.map((item) => {
                            if (item.empty) {
                                return <View key={item.id} style={[styles.dayCell, styles.emptyCell]} />;
                            }
                            const dayEvents = events.filter(e => e.date === item.dateString);
                            const isSelected = selectedDate === item.dateString;
                            const isToday = item.dateString === formatDateToRO(new Date());

                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.dayCell, isSelected && styles.selectedCell]}
                                    onPress={() => setSelectedDate(item.dateString)}
                                >
                                    <View style={styles.dayHeaderCell}>
                                        <Text style={[styles.dayNumberText, isToday && styles.todayText]}>
                                            {item.dayNumber}
                                        </Text>
                                    </View>
                                    <ScrollView style={styles.eventsListMini} showsVerticalScrollIndicator={false}>
                                        {dayEvents.map((ev, idx) => (
                                            <View key={idx} style={styles.miniEventBadge}>
                                                <View style={styles.dotIndicator} />
                                                <Text numberOfLines={1} style={styles.miniEventText}>
                                                    {ev.time !== 'All Day' ? `${ev.time} ` : ''}{ev.title}
                                                </Text>
                                            </View>
                                        ))}
                                    </ScrollView>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Panou Lateral pentru Ziua Selectată */}
                <View style={styles.sidePanel}>
                    <Text style={styles.sidePanelTitle}>Agenda pentru</Text>
                    <Text style={styles.sidePanelDate}>{selectedDate}</Text>
                    {requestError ? <Text style={styles.errorText}>{requestError}</Text> : null}
                    {isLoading ? <Text style={styles.noEventsText}>Se încarcă evenimentele...</Text> : null}

                    <ScrollView contentContainerStyle={styles.sideEventsList} showsVerticalScrollIndicator={false}>
                        {!isLoading && selectedDayEvents.length === 0 ? (
                            <Text style={styles.noEventsText}>Niciun eveniment programat în această zi.</Text>
                        ) : (
                            selectedDayEvents.map((ev, index) => (
                                <View key={index} style={styles.sideEventCard}>
                                    <Ionicons name="time-outline" size={14} color="#818cf8" />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.sideEventTitle}>{ev.title}</Text>
                                        <Text style={styles.sideEventTime}>{ev.time}</Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    {showAddModal && (
                        <View style={styles.inlineModal}>
                            <Text style={styles.modalTitle}>Eveniment nou pe {selectedDate}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Titlu (ex: Întâlnire)"
                                placeholderTextColor="#64748b"
                                value={newTitle}
                                onChangeText={setNewTitle}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Ora (ex: 14:00)"
                                placeholderTextColor="#64748b"
                                value={newTime}
                                onChangeText={setNewTime}
                            />
                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                                    <Text style={styles.cancelBtnText}>Anulează</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleAddEvent}>
                                    <Text style={styles.saveBtnText}>Salvează</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#030712', gap: 16 },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0b0f19', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#1e293b' },
    monthNavigator: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    monthTitle: { fontSize: 18, fontWeight: '700', color: '#f8fafc' },
    navButtons: { flexDirection: 'row', gap: 6 },
    navBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#4f46e5', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
    addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

    mainContent: { flex: 1, flexDirection: 'row', gap: 16 },
    calendarGridContainer: { flex: 3, backgroundColor: '#0b0f19', borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', padding: 12, display: 'flex', flexDirection: 'column' },
    weekDaysRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#1e293b', paddingBottom: 8, marginBottom: 8 },
    weekDayText: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: '#64748b' },

    daysGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap' },
    dayCell: { width: '14.28%', height: '20%', borderWidth: 0.5, borderColor: '#1e293b', padding: 4, justifyContent: 'flex-start' },
    emptyCell: { backgroundColor: 'rgba(255,255,255,0.01)' },
    selectedCell: { backgroundColor: 'rgba(99, 102, 241, 0.1)', borderColor: '#818cf8' },
    dayHeaderCell: { alignItems: 'flex-end', marginBottom: 2 },
    dayNumberText: { fontSize: 12, color: '#cbd5e1', fontWeight: '500' },
    todayText: { color: '#fff', backgroundColor: '#4f46e5', width: 20, height: 20, textAlign: 'center', borderRadius: 10, overflow: 'hidden', lineHeight: 20, fontSize: 11 },

    eventsListMini: { flex: 1 },
    miniEventBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(99, 102, 241, 0.2)', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, marginBottom: 2 },
    dotIndicator: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#818cf8' },
    miniEventText: { fontSize: 10, color: '#f8fafc' },

    sidePanel: { width: 280, backgroundColor: '#0b0f19', borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', padding: 16, gap: 12 },
    sidePanelTitle: { fontSize: 12, color: '#64748b', fontWeight: '600', textTransform: 'uppercase' },
    sidePanelDate: { fontSize: 16, fontWeight: '700', color: '#f8fafc', marginBottom: 4 },
    sideEventsList: { gap: 8 },
    noEventsText: { fontSize: 12, color: '#64748b', fontStyle: 'italic', marginTop: 10 },
    errorText: { fontSize: 12, color: '#f87171', marginTop: 4 },
    sideEventCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#030712', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#1e293b' },
    sideEventTitle: { fontSize: 13, fontWeight: '600', color: '#f8fafc' },
    sideEventTime: { fontSize: 11, color: '#94a3b8' },

    inlineModal: { backgroundColor: '#030712', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#1e293b', gap: 8, marginTop: 'auto' },
    modalTitle: { fontSize: 12, fontWeight: '600', color: '#f8fafc' },
    input: { height: 36, backgroundColor: '#0b0f19', borderWidth: 1, borderColor: '#1e293b', borderRadius: 8, paddingHorizontal: 10, color: '#f8fafc', fontSize: 12 },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 6, marginTop: 4 },
    cancelBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: '#1e293b' },
    cancelBtnText: { fontSize: 11, color: '#cbd5e1' },
    saveBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: '#4f46e5' },
    saveBtnText: { fontSize: 11, color: '#fff', fontWeight: '600' }
});