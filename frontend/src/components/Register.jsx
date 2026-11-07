import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Register({ navigation }) {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handlePhoneChange = (text) => {
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length <= 10) {
            setPhone(cleaned);
        }
    };

    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const handleRegister = () => {
        if (phone.length > 10) {
            alert('Numărul de telefon poate avea maximum 10 cifre!');
            return;
        }
        alert('Înregistrare reușită!');
    };

    const handleGoogleLogin = () => {
        alert('Redirecționare Google OAuth...');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    <View style={styles.card}>
                        <View style={styles.header}>
                            <View style={styles.logoContainer}>
                                <Ionicons name="sparkles" size={28} color="#818cf8" />
                            </View>
                            <Text style={styles.title}>Productivity Assistant</Text>
                            <Text style={styles.subtitle}>Sistem inteligent multi-agent pentru fluxul tău de lucru</Text>

                            {/* Tab-uri Autentificare / Înregistrare */}
                            <View style={styles.tabsContainer}>
                                <TouchableOpacity
                                    style={styles.tabInactive}
                                    onPress={() => navigation.navigate('Login')}
                                >
                                    <Text style={styles.tabTextInactive}>Autentificare</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.tabActive}>
                                    <Text style={styles.tabTextActive}>Înregistrare</Text>
                                    <View style={styles.activeIndicator} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Nume</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Popescu"
                                        placeholderTextColor="#64748b"
                                        value={name}
                                        onChangeText={setName}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Prenume</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Andrei"
                                        placeholderTextColor="#64748b"
                                        value={surname}
                                        onChangeText={setSurname}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="nume@exemplu.ro"
                                    placeholderTextColor="#64748b"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Număr de telefon (max. 10 cifre)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0712345678"
                                    placeholderTextColor="#64748b"
                                    value={phone}
                                    onChangeText={handlePhoneChange}
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Parolă</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={[styles.input, { paddingRight: 40 }]}
                                        placeholder="••••••••"
                                        placeholderTextColor="#64748b"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeIcon}
                                        onPress={() => setShowPassword(!showPassword)}
                                    >
                                        <Ionicons
                                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                                            size={18}
                                            color="#64748b"
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.checklist}>
                                    <View style={styles.checkColumn}>
                                        <CheckItem text="Min. 8 caractere" isValid={hasMinLength} />
                                        <CheckItem text="O literă mică" isValid={hasLowerCase} />
                                        <CheckItem text="Un caracter special (!@#$%^&*)" isValid={hasSpecialChar} />
                                    </View>
                                    <View style={styles.checkColumn}>
                                        <CheckItem text="O literă mare" isValid={hasUpperCase} />
                                        <CheckItem text="Un număr" isValid={hasNumber} />
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity style={styles.submitButton} onPress={handleRegister}>
                                <Text style={styles.submitButtonText}>Creează cont</Text>
                            </TouchableOpacity>

                            <View style={styles.dividerContainer}>
                                <View style={styles.line} />
                                <Text style={styles.dividerText}>SAU ÎNREGISTREAZĂ-TE CU</Text>
                                <View style={styles.line} />
                            </View>

                            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                                <Image
                                    source={{ uri: 'https://www.vectorlogo.zone/logos/google/google-icon.svg' }}
                                    style={{ width: 18, height: 18, resizeMode: 'contain' }}
                                />
                                <Text style={styles.googleButtonText}>Google</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function CheckItem({ text, isValid }) {
    return (
        <View style={styles.checkItemRow}>
            <View style={[styles.dot, isValid && styles.dotValid]} />
            <Text style={[styles.checkText, isValid && styles.checkTextValid]}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#030712' },
    scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
    card: {
        width: '100%',
        maxWidth: 480,
        backgroundColor: '#0b0f19',
        borderWidth: 1,
        borderColor: '#1e293b',
        borderRadius: 24,
        padding: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.6,
        shadowRadius: 24,
        elevation: 12,
    },
    header: { alignItems: 'center', marginBottom: 20 },
    logoContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: { fontSize: 22, fontWeight: '700', color: '#f8fafc', letterSpacing: 0.3 },
    subtitle: { fontSize: 12, color: '#94a3b8', marginTop: 4, textAlign: 'center' },
    tabsContainer: {
        flexDirection: 'row',
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
        marginTop: 20,
    },
    tabActive: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        position: 'relative',
    },
    tabInactive: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    tabTextActive: { fontSize: 14, fontWeight: '600', color: '#f8fafc' },
    tabTextInactive: { fontSize: 14, fontWeight: '500', color: '#64748b' },
    activeIndicator: {
        position: 'absolute',
        bottom: -1,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: '#818cf8',
    },
    form: { gap: 14, marginTop: 4 },
    row: { flexDirection: 'row', gap: 12 },
    inputGroup: { gap: 6 },
    label: { fontSize: 12, fontWeight: '600', color: '#94a3b8' },
    inputWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    eyeIcon: { position: 'absolute', right: 14, zIndex: 1 },
    input: {
        height: 44,
        backgroundColor: '#030712',
        borderWidth: 1,
        borderColor: '#1e293b',
        borderRadius: 12,
        paddingHorizontal: 14,
        color: '#f8fafc',
        fontSize: 14,
    },
    checklist: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 2
    },
    checkColumn: { gap: 6, flex: 1 },
    checkItemRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#64748b' },
    dotValid: { backgroundColor: '#34d399' },
    checkText: { fontSize: 11, color: '#64748b' },
    checkTextValid: { color: '#34d399', fontWeight: '500' },
    submitButton: {
        height: 48,
        backgroundColor: '#4f46e5',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
        marginTop: 4,
    },
    submitButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
    line: { flex: 1, height: 1, backgroundColor: '#1e293b' },
    dividerText: { marginHorizontal: 10, fontSize: 10, color: '#64748b', fontWeight: '600', letterSpacing: 0.8 },
    googleButton: {
        flexDirection: 'row',
        height: 48,
        backgroundColor: '#030712',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1e293b',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    googleG: { fontSize: 18, fontWeight: 'bold', color: '#ea4335' },
    googleButtonText: { color: '#f8fafc', fontSize: 14, fontWeight: '500' },
});