import React, { useState, useEffect } from 'react';
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
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const GOOGLE_CLIENT_ID = '682446417323-24l2f06p3ojfq1uop8k63crnmb5503dv.apps.googleusercontent.com';

export default function Register({ navigation }) {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Stări pentru erori
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        if (Platform.OS === 'web') {
            const scriptId = 'google-gsi-script';
            if (!document.getElementById(scriptId)) {
                const script = document.createElement('script');
                script.id = scriptId;
                script.src = 'https://accounts.google.com/gsi/client';
                script.async = true;
                script.defer = true;
                document.body.appendChild(script);
            }
        }
    }, []);

    const handlePhoneChange = (text) => {
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length <= 10) {
            setPhone(cleaned);
        }
    };

    const handleEmailChange = (text) => {
        setEmail(text);
        if (emailError) {
            setEmailError('');
        }
    };

    const handlePasswordChange = (text) => {
        setPassword(text);
        if (passwordError) {
            setPasswordError('');
        }
    };

    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

    const handleRegister = async () => {
        // Resetează erorile la începutul încercării
        setEmailError('');
        setPasswordError('');

        if (phone.length > 10) {
            alert('Numărul de telefon poate avea maximum 10 cifre!');
            return;
        }

        // Verificăm dacă parola respectă toate regulile înainte de trimite la server
        if (!isPasswordValid) {
            setPasswordError('Parola trebuie să conțină cel puțin 8 caractere, litere mari, mici, numere și caractere speciale.');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    surname,
                    email,
                    phone_number: phone,
                    password,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                alert('Înregistrare reușită! Te poți autentifica.');
                navigation.navigate('Login');
            } else {
                if (data.detail && data.detail.toLowerCase().includes('email')) {
                    setEmailError(data.detail);
                } else {
                    alert(data.detail || 'Eroare la înregistrare');
                }
            }
        } catch (error) {
            console.error('Eroare rețea:', error);
        }
    };

    const sendTokenToBackend = async (accessToken) => {
        try {
            const response = await fetch('http://127.0.0.1:8000/auth/google/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: accessToken }),
            });

            const data = await response.json();
            if (response.ok) {
                alert(`Bun venit, ${data.name}!`);
                console.log('JWT Google primit:', data.access_token);
            } else {
                alert(data.detail || 'Eroare la server.');
            }
        } catch (error) {
            console.error('Eroare trimitere token:', error);
        }
    };

    const handleGoogleLoginWeb = () => {
        if (window.google && window.google.accounts) {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: 'email profile openid',
                callback: async (response) => {
                    if (response.access_token) {
                        await sendTokenToBackend(response.access_token);
                    }
                },
            });
            client.requestAccessToken();
        } else {
            alert('SDK-ul Google se încarcă. Mai încearcă o dată.');
        }
    };

    const handleGoogleLoginMobile = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const idToken = userInfo.data?.idToken || userInfo.idToken;
            if (idToken) {
                await sendTokenToBackend(idToken);
            }
        } catch (error) {
            console.error('EROARE GOOGLE SIGN-IN MOBIL:', error);
            alert('Eroare Google Sign-In: ' + (error.message || error));
        }
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
                                    style={[styles.input, emailError ? styles.inputError : null]}
                                    placeholder="nume@exemplu.ro"
                                    placeholderTextColor="#64748b"
                                    value={email}
                                    onChangeText={handleEmailChange}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
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
                                        style={[styles.input, { paddingRight: 40 }, passwordError ? styles.inputError : null]}
                                        placeholder="••••••••"
                                        placeholderTextColor="#64748b"
                                        value={password}
                                        onChangeText={handlePasswordChange}
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

                                {/* Mesaj de eroare cu roșu sub parolă dacă cerințele nu sunt îndeplinite */}
                                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                                <View style={styles.checklist}>
                                    <View style={styles.checkColumn}>
                                        <CheckItem text="Min. 8 caractere" isValid={hasMinLength} />
                                        <CheckItem text="O literă mică" isValid={hasLowerCase} />
                                        <CheckItem text="Un caracter special" isValid={hasSpecialChar} />
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

                            <TouchableOpacity
                                style={styles.googleButton}
                                onPress={Platform.OS === 'web' ? handleGoogleLoginWeb : handleGoogleLoginMobile}
                            >
                                <Ionicons name="logo-google" size={18} color="#f8fafc" />
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
    tabActive: { flex: 1, paddingVertical: 12, alignItems: 'center', position: 'relative' },
    tabInactive: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    tabTextActive: { fontSize: 14, fontWeight: '600', color: '#f8fafc' },
    tabTextInactive: { fontSize: 14, fontWeight: '500', color: '#64748b' },
    activeIndicator: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, backgroundColor: '#818cf8' },
    form: { gap: 14, marginTop: 4 },
    row: { flexDirection: 'row', gap: 12 },
    inputGroup: { gap: 6 },
    label: { fontSize: 12, fontWeight: '600', color: '#94a3b8' },
    inputWrapper: { position: 'relative', justifyContent: 'center' },
    eyeIcon: { position: 'absolute', right: 14, zIndex: 1 },
    input: {
        height: 44,
        backgroundColor: '#030712',
        borderWidth: 1,
        borderColor: '#1e293b',
        borderRadius: 12,
        paddingHorizontal: 14,
        color: '#f8fafc',
    },
    inputError: {
        borderColor: '#ef4444',
    },
    errorText: {
        fontSize: 11,
        color: '#ef4444',
        marginTop: 2,
        marginLeft: 4,
    },
    checklist: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 },
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
        width: '100%',
    },
    googleButtonText: { color: '#f8fafc', fontSize: 14, fontWeight: '500' },
});