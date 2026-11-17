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

const isValidTime = (value) => {
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
    return match !== null;
};

const getTimeInMinutes = (value) => {
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
};

export default function Calendar({ accessToken }) {
    const [currentDate, setCurrentDate] = useState(() => new Date());
    const [selectedDate, setSelectedDate] = useState(() => formatDateToRO(new Date()));
    const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'day' | 'year'
    const [showViewDropdown, setShowViewDropdown] = useState(false);

    const [events, setEvents] = useState([]);
    const [requestError, setRequestError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Stări formular adăugare
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newTime, setNewTime] = useState('10:00');
    const [newEndTime, setNewEndTime] = useState('11:00');

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

    // Zilele săptămânii începând de Luni (format românesc)
    const daysOfWeek = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];

    const prevPeriod = () => {
        if (viewMode === 'month') {
            setCurrentDate(new Date(year, month - 1, 1));
        } else if (viewMode === 'year') {
            setCurrentDate(new Date(year - 1, month, 1));
        } else if (viewMode === 'week') {
            const d = new Date(currentDate);
            d.setDate(d.getDate() - 7);
            setCurrentDate(d);
        } else if (viewMode === 'day') {
            const d = new Date(currentDate);
            d.setDate(d.getDate() - 1);
            setCurrentDate(d);
            setSelectedDate(formatDateToRO(d));
        }
    };

    const nextPeriod = () => {
        if (viewMode === 'month') {
            setCurrentDate(new Date(year, month + 1, 1));
        } else if (viewMode === 'year') {
            setCurrentDate(new Date(year + 1, month, 1));
        } else if (viewMode === 'week') {
            const d = new Date(currentDate);
            d.setDate(d.getDate() + 7);
            setCurrentDate(d);
        } else if (viewMode === 'day') {
            const d = new Date(currentDate);
            d.setDate(d.getDate() + 1);
            setCurrentDate(d);
            setSelectedDate(formatDateToRO(d));
        }
    };

    // Calcul pentru luna principală (începând de luni)
    const firstDayOfMonth = new Date(year, month, 1);
    let firstDayIndex = firstDayOfMonth.getDay() - 1; // 0 = Luni, 6 = Duminică
    if (firstDayIndex === -1) firstDayIndex = 6; // Duminica devine 6
    const totalDays = new Date(year, month + 1, 0).getDate();

    const calendarDays = [];
    for (let i = 0; i < firstDayIndex; i++) {
        calendarDays.push({ empty: true, id: `empty-${i}` });
    }
    for (let d = 1; d <= totalDays; d++) {
        const cellDate = new Date(year, month, d);
        const dateString = formatDateToRO(cellDate);
        calendarDays.push({ empty: false, dayNumber: d, dateString, id: dateString });
    }

    // Mini-calendar date logic (începând de luni)
    const [miniDate, setMiniDate] = useState(() => new Date());
    const miniYear = miniDate.getFullYear();
    const miniMonth = miniDate.getMonth();
    const miniFirstDayObj = new Date(miniYear, miniMonth, 1);
    let miniFirstDayIndex = miniFirstDayObj.getDay() - 1;
    if (miniFirstDayIndex === -1) miniFirstDayIndex = 6;
    const miniTotalDays = new Date(miniYear, miniMonth + 1, 0).getDate();

    const miniCalendarDays = [];
    for (let i = 0; i < miniFirstDayIndex; i++) {
        const prevMonthDays = new Date(miniYear, miniMonth, 0).getDate();
        const dNum = prevMonthDays - miniFirstDayIndex + i + 1;
        miniCalendarDays.push({ empty: true, dayNumber: dNum, id: `mini-empty-${i}` });
    }
    for (let d = 1; d <= miniTotalDays; d++) {
        const cellDate = new Date(miniYear, miniMonth, d);
        const dateString = formatDateToRO(cellDate);
        miniCalendarDays.push({ empty: false, dayNumber: d, dateString, id: `mini-${dateString}` });
    }

    const handleAddEvent = async () => {
        if (!newTitle.trim()) {
            setRequestError('Introdu titlul evenimentului.');
            return;
        }

        const startTime = newTime.trim();
        const endTime = newEndTime.trim();
        if (!isValidTime(startTime) || !isValidTime(endTime)) {
            setRequestError('Introdu ore valide în formatul HH:MM.');
            return;
        }
        if (endTime <= startTime) {
            setRequestError('Ora de terminare trebuie să fie după ora de început.');
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
                    time: startTime,
                    end_time: endTime,
                }),
            });

            const savedEvent = await response.json();
            if (!response.ok) {
                throw new Error(savedEvent.detail || 'Evenimentul nu a putut fi salvat.');
            }

            setEvents(previousEvents => [...previousEvents, savedEvent]);
            setNewTitle('');
            setNewTime('10:00');
            setNewEndTime('11:00');
            setShowAddModal(false);
        } catch (error) {
            console.error('Eroare la salvarea evenimentului:', error);
            setRequestError(error instanceof Error ? error.message : 'Eroare de conexiune cu serverul.');
        }
    };

    const handleDeleteEvent = async (eventId) => {
        setRequestError('');
        try {
            const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Evenimentul nu a putut fi șters.');
            }

            setEvents(previousEvents => previousEvents.filter(ev => ev.id !== eventId));
        } catch (error) {
            console.error('Eroare la ștergerea evenimentului:', error);
            setRequestError(error instanceof Error ? error.message : 'Eroare de conexiune cu serverul.');
        }
    };

    const selectedDayEvents = events.filter(e => e.date === selectedDate);

    // Calcul săptămână de Luni până Duminică
    const getWeekDays = () => {
        const curr = new Date(currentDate);
        const dayOfWeek = curr.getDay(); // 0 = Dum, 1 = Lun ... 6 = Sâm
        const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

        const monday = new Date(curr);
        monday.setDate(curr.getDate() + distanceToMonday);

        const week = [];
        for (let i = 0; i < 7; i++) {
            const nextDay = new Date(monday);
            nextDay.setDate(monday.getDate() + i);
            week.push({
                dayName: daysOfWeek[i].toUpperCase(),
                dayNumber: nextDay.getDate(),
                dateString: formatDateToRO(nextDay)
            });
        }
        return week;
    };

    const hours24 = Array.from({ length: 24 }, (_, i) => {
        const hourNum = i;
        const displayLabel = hourNum === 0 ? '12 AM' : hourNum < 12 ? `${hourNum} AM` : hourNum === 12 ? '12 PM' : `${hourNum - 12} PM`;
        return { hourNum, label: displayLabel };
    });
    const activeTimeGridColumns = viewMode === 'day' ? [selectedDate] : getWeekDays().map(day => day.dateString);

    return (
        <View style={styles.container}>
            {/* Bara de sus / Control Calendar & Dropdown View Mode */}
            <View style={styles.topBar}>
                <View style={styles.monthNavigator}>
                    <Text style={styles.monthTitle}>
                        {viewMode === 'year' ? `${year}` : `${monthNames[month]} ${year}`}
                    </Text>
                    <View style={styles.navButtons}>
                        <TouchableOpacity style={styles.navBtn} onPress={prevPeriod}>
                            <Ionicons name="chevron-back" size={16} color="#f8fafc" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navBtn} onPress={nextPeriod}>
                            <Ionicons name="chevron-forward" size={16} color="#f8fafc" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.topBarRight}>
                    {/* Selector Vizualizare (Month, Week, Day, Year) */}
                    <View style={styles.dropdownContainer}>
                        <TouchableOpacity
                            style={styles.viewDropdownBtn}
                            onPress={() => setShowViewDropdown(!showViewDropdown)}
                        >
                            <Text style={styles.viewDropdownText}>
                                {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
                            </Text>
                            <Ionicons name="chevron-down" size={14} color="#f8fafc" />
                        </TouchableOpacity>

                        {showViewDropdown && (
                            <View style={styles.dropdownMenu}>
                                <TouchableOpacity style={styles.dropdownItem} onPress={() => { setViewMode('day'); setShowViewDropdown(false); }}>
                                    <Text style={styles.dropdownItemText}>Day</Text>
                                    <Text style={styles.dropdownShortcut}>D</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.dropdownItem} onPress={() => { setViewMode('week'); setShowViewDropdown(false); }}>
                                    <Text style={styles.dropdownItemText}>Week</Text>
                                    <Text style={styles.dropdownShortcut}>W</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.dropdownItem} onPress={() => { setViewMode('month'); setShowViewDropdown(false); }}>
                                    <Text style={styles.dropdownItemText}>Month</Text>
                                    <Text style={styles.dropdownShortcut}>M</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.dropdownItem} onPress={() => { setViewMode('year'); setShowViewDropdown(false); }}>
                                    <Text style={styles.dropdownItemText}>Year</Text>
                                    <Text style={styles.dropdownShortcut}>Y</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
                        <Ionicons name="add" size={16} color="#fff" />
                        <Text style={styles.addBtnText}>Adaugă Eveniment</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Layout principal */}
            <View style={styles.mainContent}>
                {/* Panou Lateral Stânga: Mini Calendar (Luni - Duminică) */}
                <View style={styles.leftSidebar}>
                    <TouchableOpacity style={styles.createMainBtn} onPress={() => setShowAddModal(true)}>
                        <Ionicons name="add" size={20} color="#fff" />
                        <Text style={styles.createMainBtnText}>Create</Text>
                    </TouchableOpacity>

                    <View style={styles.miniCalendarCard}>
                        <View style={styles.miniHeader}>
                            <Text style={styles.miniMonthTitle}>{monthNames[miniMonth]} {miniYear}</Text>
                            <View style={styles.miniNav}>
                                <TouchableOpacity onPress={() => setMiniDate(new Date(miniYear, miniMonth - 1, 1))}>
                                    <Ionicons name="chevron-back" size={14} color="#94a3b8" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setMiniDate(new Date(miniYear, miniMonth + 1, 1))}>
                                    <Ionicons name="chevron-forward" size={14} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.miniDaysOfWeek}>
                            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                                <Text key={i} style={styles.miniDayName}>{d}</Text>
                            ))}
                        </View>
                        <View style={styles.miniDaysGrid}>
                            {miniCalendarDays.map((item) => {
                                const isSelected = selectedDate === item.dateString;
                                const isToday = item.dateString === formatDateToRO(new Date());
                                return (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[
                                            styles.miniCell,
                                            isSelected && styles.miniSelectedCell,
                                            isToday && !isSelected && styles.miniTodayCell
                                        ]}
                                        onPress={() => {
                                            if (!item.empty && item.dateString) {
                                                setSelectedDate(item.dateString);
                                            }
                                        }}
                                    >
                                        <Text style={[
                                            styles.miniCellText,
                                            item.empty && styles.miniEmptyText,
                                            isSelected && styles.miniSelectedText,
                                            isToday && styles.miniTodayText
                                        ]}>
                                            {item.dayNumber}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </View>

                {/* Grila Calendarului Principal */}
                <View style={styles.calendarGridContainer}>
                    {viewMode === 'month' && (
                        <>
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
                                                {dayEvents.map((ev) => (
                                                    <View key={ev.id} style={styles.miniEventBadge}>
                                                        <View style={styles.dotIndicator} />
                                                        <Text numberOfLines={1} style={styles.miniEventText}>
                                                            {ev.time !== 'All Day' ? `${ev.time}${ev.end_time ? ` - ${ev.end_time}` : ''} ` : ''}{ev.title}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </ScrollView>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </>
                    )}

                    {(viewMode === 'day' || viewMode === 'week') && (
                        <View style={styles.timeGridViewContainer}>
                            {/* Antet zile (Luni - Duminică) */}
                            <View style={styles.timeGridHeaderRow}>
                                <View style={styles.timeColumnHeader}><Text style={styles.timeColHeaderText}>GMT+2</Text></View>
                                {viewMode === 'day' ? (
                                    <View style={[styles.timeDayHeaderCol, styles.selectedTimeCol]}>
                                        <Text style={styles.timeDayHeaderName}>
                                            {daysOfWeek[new Date(selectedDate.split('-').reverse().join('-')).getDay() === 0 ? 6 : new Date(selectedDate.split('-').reverse().join('-')).getDay() - 1]}
                                        </Text>
                                        <Text style={styles.timeDayHeaderCircle}>{selectedDate.split('-')[0]}</Text>
                                    </View>
                                ) : (
                                    getWeekDays().map((w, idx) => (
                                        <TouchableOpacity
                                            key={idx}
                                            style={[styles.timeDayHeaderCol, selectedDate === w.dateString && styles.selectedTimeCol]}
                                            onPress={() => setSelectedDate(w.dateString)}
                                        >
                                            <Text style={styles.timeDayHeaderName}>{w.dayName}</Text>
                                            <Text style={[styles.timeDayHeaderNum, w.dateString === formatDateToRO(new Date()) && styles.todayText]}>
                                                {w.dayNumber}
                                            </Text>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </View>

                            {/* Corp cu Scroll de la 00:00 la 23:59 */}
                            <ScrollView style={styles.timeGridScroll} showsVerticalScrollIndicator={true}>
                                {hours24.map((hObj) => {
                                    const hourEvents = events.filter(event =>
                                        activeTimeGridColumns.includes(event.date) &&
                                        getTimeInMinutes(event.time) >= hObj.hourNum * 60 &&
                                        getTimeInMinutes(event.time) < (hObj.hourNum + 1) * 60
                                    );
                                    return (
                                        <View key={hObj.hourNum} style={[styles.hourRow, hourEvents.length > 0 && styles.hourRowWithEvent]}>
                                            <View style={styles.hourLabelContainer}>
                                                <Text style={styles.hourLabelText}>{hObj.hourNum === 0 ? '' : hObj.label}</Text>
                                            </View>
                                            {activeTimeGridColumns.map((colDate, cIdx) => {
                                                const slotEvents = events.filter(e => {
                                                    if (e.date !== colDate) return false;
                                                    const eventMinutes = getTimeInMinutes(e.time);
                                                    return eventMinutes >= hObj.hourNum * 60 && eventMinutes < (hObj.hourNum + 1) * 60;
                                                });

                                                return (
                                                    <TouchableOpacity
                                                        key={cIdx}
                                                        style={styles.hourCell}
                                                        onPress={() => {
                                                            setSelectedDate(colDate);
                                                            setNewTime(`${String(hObj.hourNum).padStart(2, '0')}:00`);
                                                            setNewEndTime(hObj.hourNum === 23
                                                                ? '23:59'
                                                                : `${String(hObj.hourNum + 1).padStart(2, '0')}:00`);
                                                            setShowAddModal(true);
                                                        }}
                                                    >
                                                        {slotEvents.map(ev => (
                                                            <View
                                                                key={ev.id}
                                                                style={[
                                                                    styles.gridEventBlock,
                                                                    {
                                                                        top: (getTimeInMinutes(ev.time) % 60) * (50 / 60),
                                                                        height: Math.max(
                                                                            20,
                                                                            ((getTimeInMinutes(ev.end_time || ev.time) -
                                                                                getTimeInMinutes(ev.time)) || 30) * (50 / 60)
                                                                        ),
                                                                    },
                                                                ]}
                                                            >
                                                                <Text numberOfLines={1} style={styles.gridEventText}>
                                                                    {ev.time}{ev.end_time ? ` - ${ev.end_time}` : ''} {ev.title}
                                                                </Text>
                                                            </View>
                                                        ))}
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    )}

                    {viewMode === 'year' && (
                        <View style={styles.yearViewContainer}>
                            <Text style={styles.yearViewTitle}>Anul {year}</Text>
                            <ScrollView contentContainerStyle={styles.yearMonthsGrid}>
                                {monthNames.map((mName, mIdx) => (
                                    <TouchableOpacity
                                        key={mIdx}
                                        style={styles.yearMonthCard}
                                        onPress={() => {
                                            setCurrentDate(new Date(year, mIdx, 1));
                                            setViewMode('month');
                                        }}
                                    >
                                        <Text style={styles.yearMonthName}>{mName}</Text>
                                        <Text style={styles.yearMonthCount}>
                                            {events.filter(e => {
                                                const parts = e.date.split('-');
                                                return parseInt(parts[1]) === mIdx + 1 && parseInt(parts[2]) === year;
                                            }).length} evenimente
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>

                {/* Panou Lateral Dreapta pentru Ziua Selectată */}
                <View style={styles.sidePanel}>
                    <Text style={styles.sidePanelTitle}>Agenda pentru</Text>
                    <Text style={styles.sidePanelDate}>{selectedDate}</Text>
                    {requestError ? <Text style={styles.errorText}>{requestError}</Text> : null}
                    {isLoading ? <Text style={styles.noEventsText}>Se încarcă evenimentele...</Text> : null}

                    <ScrollView contentContainerStyle={styles.sideEventsList} showsVerticalScrollIndicator={false}>
                        {!isLoading && selectedDayEvents.length === 0 ? (
                            <Text style={styles.noEventsText}>Niciun eveniment programat în această zi.</Text>
                        ) : (
                            selectedDayEvents.map((ev) => (
                                <View key={ev.id} style={styles.sideEventCard}>
                                    <Ionicons name="time-outline" size={14} color="#818cf8" />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.sideEventTitle}>{ev.title}</Text>
                                        <Text style={styles.sideEventTime}>
                                            {ev.time}{ev.end_time ? ` - ${ev.end_time}` : ''}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleDeleteEvent(ev.id)}
                                        style={styles.deleteBtn}
                                    >
                                        <Ionicons name="trash-outline" size={16} color="#f87171" />
                                    </TouchableOpacity>
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
                                placeholder="Ora de început (ex: 14:00)"
                                placeholderTextColor="#64748b"
                                value={newTime}
                                onChangeText={setNewTime}
                                maxLength={5}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Ora de terminare (ex: 15:00)"
                                placeholderTextColor="#64748b"
                                value={newEndTime}
                                onChangeText={setNewEndTime}
                                maxLength={5}
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
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0b0f19',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#1e293b',
        zIndex: 50,
        overflow: 'visible'
    },
    topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 60 },
    monthNavigator: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    monthTitle: { fontSize: 18, fontWeight: '700', color: '#f8fafc' },
    navButtons: { flexDirection: 'row', gap: 6 },
    navBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },

    dropdownContainer: { position: 'relative', zIndex: 100 },
    viewDropdownBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#334155' },
    viewDropdownText: { color: '#f8fafc', fontSize: 13, fontWeight: '600' },
    dropdownMenu: {
        position: 'absolute',
        top: 42,
        right: 0,
        backgroundColor: '#0b0f19',
        borderWidth: 1,
        borderColor: '#1e293b',
        borderRadius: 10,
        width: 140,
        padding: 4,
        zIndex: 999,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 6
    },
    dropdownItem: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6 },
    dropdownItemText: { color: '#f8fafc', fontSize: 13 },
    dropdownShortcut: { color: '#64748b', fontSize: 12 },

    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#4f46e5', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
    addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

    mainContent: { flex: 1, flexDirection: 'row', gap: 16, zIndex: 1 },

    leftSidebar: { width: 220, gap: 12 },
    createMainBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#4f46e5', paddingVertical: 12, borderRadius: 24, shadowColor: '#4f46e5', shadowOpacity: 0.4, shadowRadius: 8 },
    createMainBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    miniCalendarCard: { backgroundColor: '#0b0f19', borderRadius: 14, borderWidth: 1, borderColor: '#1e293b', padding: 12 },
    miniHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    miniMonthTitle: { fontSize: 12, fontWeight: '700', color: '#f8fafc' },
    miniNav: { flexDirection: 'row', gap: 8 },
    miniDaysOfWeek: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    miniDayName: { fontSize: 10, fontWeight: '600', color: '#64748b', width: 20, textAlign: 'center' },
    miniDaysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    miniCell: { width: '14.28%', height: 26, justifyContent: 'center', alignItems: 'center', marginVertical: 1 },
    miniCellText: { fontSize: 11, color: '#cbd5e1' },
    miniEmptyText: { color: '#475569' },
    miniTodayCell: { borderWidth: 1, borderColor: '#4f46e5', borderRadius: 13 },
    miniTodayText: { color: '#818cf8', fontWeight: '700' },
    miniSelectedCell: { backgroundColor: '#4f46e5', borderRadius: 13 },
    miniSelectedText: { color: '#fff', fontWeight: '700' },

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

    timeGridViewContainer: { flex: 1, display: 'flex', flexDirection: 'column' },
    timeGridHeaderRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#1e293b', paddingBottom: 6 },
    timeColumnHeader: { width: 60, alignItems: 'center', justifyContent: 'center' },
    timeColHeaderText: { fontSize: 10, color: '#64748b', fontWeight: '600' },
    timeDayHeaderCol: { flex: 1, alignItems: 'center', padding: 4, borderRadius: 8 },
    selectedTimeCol: { backgroundColor: 'rgba(99, 102, 241, 0.15)' },
    timeDayHeaderName: { fontSize: 10, color: '#64748b', fontWeight: '600' },
    timeDayHeaderNum: { fontSize: 13, color: '#f8fafc', fontWeight: '700', marginTop: 2 },
    timeDayHeaderCircle: { fontSize: 13, color: '#fff', backgroundColor: '#4f46e5', width: 24, height: 24, borderRadius: 12, textAlign: 'center', lineHeight: 24, fontWeight: '700', marginTop: 2 },
    timeGridScroll: { flex: 1 },
    hourRow: { flexDirection: 'row', height: 50, borderBottomWidth: 0.5, borderBottomColor: '#1e293b', overflow: 'visible' },
    hourRowWithEvent: { zIndex: 1, elevation: 1 },
    hourLabelContainer: { width: 60, alignItems: 'flex-end', paddingRight: 8, paddingTop: 4 },
    hourLabelText: { fontSize: 10, color: '#64748b', fontWeight: '500' },
    hourCell: { flex: 1, borderLeftWidth: 0.5, borderLeftColor: '#1e293b', padding: 2, position: 'relative', overflow: 'visible' },
    gridEventBlock: { position: 'absolute', left: 2, right: 2, zIndex: 2, backgroundColor: 'rgba(99, 102, 241, 0.7)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, overflow: 'hidden' },
    gridEventText: { fontSize: 11, color: '#f8fafc', fontWeight: '600' },

    yearViewContainer: { flex: 1, padding: 8 },
    yearViewTitle: { fontSize: 18, fontWeight: '700', color: '#f8fafc', marginBottom: 12 },
    yearMonthsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    yearMonthCard: { width: '30%', backgroundColor: '#030712', borderWidth: 1, borderColor: '#1e293b', borderRadius: 12, padding: 12, alignItems: 'center', gap: 6 },
    yearMonthName: { fontSize: 14, fontWeight: '700', color: '#f8fafc' },
    yearMonthCount: { fontSize: 11, color: '#818cf8' },

    sidePanel: { width: 280, backgroundColor: '#0b0f19', borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', padding: 16, gap: 12 },
    sidePanelTitle: { fontSize: 12, color: '#64748b', fontWeight: '600', textTransform: 'uppercase' },
    sidePanelDate: { fontSize: 16, fontWeight: '700', color: '#f8fafc', marginBottom: 4 },
    sideEventsList: { gap: 8 },
    noEventsText: { fontSize: 12, color: '#64748b', fontStyle: 'italic', marginTop: 10 },
    errorText: { fontSize: 12, color: '#f87171', marginTop: 4 },
    sideEventCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#030712', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#1e293b' },
    sideEventTitle: { fontSize: 13, fontWeight: '600', color: '#f8fafc' },
    sideEventTime: { fontSize: 11, color: '#94a3b8' },
    deleteBtn: { padding: 4 },

    inlineModal: { backgroundColor: '#030712', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#1e293b', gap: 8, marginTop: 'auto' },
    modalTitle: { fontSize: 12, fontWeight: '600', color: '#f8fafc' },
    input: { height: 36, backgroundColor: '#0b0f19', borderWidth: 1, borderColor: '#1e293b', borderRadius: 8, paddingHorizontal: 10, color: '#f8fafc', fontSize: 12 },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 6, marginTop: 4 },
    cancelBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: '#1e293b' },
    cancelBtnText: { fontSize: 11, color: '#cbd5e1' },
    saveBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: '#4f46e5' },
    saveBtnText: { fontSize: 11, color: '#fff', fontWeight: '600' }
});