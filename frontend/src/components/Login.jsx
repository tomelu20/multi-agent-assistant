import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const GOOGLE_CLIENT_ID = '682446417323-24l2f06p3ojfq1uop8k63crnmb5503dv.apps.googleusercontent.com';

export default function Login({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Stări dedicate pentru fluxul de Forgot Password
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);

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

    const handleLogin = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                alert('Autentificare reușită!');
                console.log('JWT primit:', data.access_token);
            } else {
                alert(data.detail || 'Eroare la autentificare');
            }
        } catch (error) {
            console.error('Eroare rețea:', error);
            alert('Nu s-a putut stabili conexiunea cu serverul.');
        }
    };

    const handleForgotPasswordRequest = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail }),
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message || 'Verifică emailul pentru instrucțiuni.');
            } else {
                alert(data.detail || 'A apărut o eroare.');
            }
        } catch (error) {
            console.error('Eroare rețea:', error);
            alert('Nu s-a putut stabili conexiunea cu serverul.');
        }
    };

    const handleResetPassword = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: resetEmail,
                    token: resetToken,
                    new_password: newPassword
                }),
            });
            const data = await response.json();
            if (response.ok) {
                alert('Parola a fost schimbată cu succes! Te poți autentifica.');
                setIsForgotPassword(false);
                setResetEmail('');
                setResetToken('');
                setNewPassword('');
            } else {
                alert(data.detail || 'Eroare la resetarea parolei.');
            }
        } catch (error) {
            console.error('Eroare rețea:', error);
            alert('Nu s-a putut stabili conexiunea cu serverul.');
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
            alert('Eroare de comunicare cu serverul.');
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
                style={styles.keyboardView}
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
                                <TouchableOpacity style={styles.tabActive}>
                                    <Text style={styles.tabTextActive}>
                                        {isForgotPassword ? 'Resetare Parolă' : 'Autentificare'}
                                    </Text>
                                    <View style={styles.activeIndicator} />
                                </TouchableOpacity>
                                {!isForgotPassword && (
                                    <TouchableOpacity
                                        style={styles.tabInactive}
                                        onPress={() => navigation.navigate('Register')}
                                    >
                                        <Text style={styles.tabTextInactive}>Înregistrare</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {isForgotPassword ? (
                            <View style={styles.form}>
                                <Text style={[styles.subtitle, { textAlign: 'left', marginBottom: 4 }]}>
                                    Introdu adresa de email pentru a primi codul de resetare.
                                </Text>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Email</Text>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="mail-outline" size={18} color="#64748b" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="nume@exemplu.ro"
                                            placeholderTextColor="#64748b"
                                            value={resetEmail}
                                            onChangeText={setResetEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity style={styles.submitButton} onPress={handleForgotPasswordRequest}>
                                    <Text style={styles.submitButtonText}>Trimite Codul</Text>
                                </TouchableOpacity>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Cod</Text>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="key-outline" size={18} color="#64748b" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Introdu codul primit"
                                            placeholderTextColor="#64748b"
                                            value={resetToken}
                                            onChangeText={setResetToken}
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Parolă Nouă</Text>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="lock-closed-outline" size={18} color="#64748b" style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, { paddingRight: 40 }]}
                                            placeholder="••••••••"
                                            placeholderTextColor="#64748b"
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            secureTextEntry={!showNewPassword}
                                        />
                                        <TouchableOpacity
                                            style={styles.eyeIcon}
                                            onPress={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            <Ionicons
                                                name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                                                size={18}
                                                color="#64748b"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity style={styles.submitButton} onPress={handleResetPassword}>
                                    <Text style={styles.submitButtonText}>Resetează Parola</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{ alignItems: 'center', marginTop: 12 }}
                                    onPress={() => setIsForgotPassword(false)}
                                >
                                    <Text style={styles.linkText}>Înapoi la Autentificare</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.form}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Email</Text>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="mail-outline" size={18} color="#64748b" style={styles.inputIcon} />
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
                                </View>

                                <View style={styles.inputGroup}>
                                    <View style={styles.labelRow}>
                                        <Text style={styles.label}>Parolă</Text>
                                        <TouchableOpacity onPress={() => setIsForgotPassword(true)}>
                                            <Text style={styles.linkText}>Ai uitat parola?</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="lock-closed-outline" size={18} color="#64748b" style={styles.inputIcon} />
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
                                </View>

                                <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
                                    <Text style={styles.submitButtonText}>Autentificare</Text>
                                </TouchableOpacity>

                                <View style={styles.dividerContainer}>
                                    <View style={styles.line} />
                                    <Text style={styles.dividerText}>SAU CONTINUĂ CU</Text>
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
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#030712' },
    keyboardView: { flex: 1 },
    scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
    card: {
        width: '100%',
        maxWidth: 460,
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
    header: { alignItems: 'center', marginBottom: 24 },
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
        marginTop: 24,
    },
    tabActive: { flex: 1, paddingVertical: 12, alignItems: 'center', position: 'relative' },
    tabInactive: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    tabTextActive: { fontSize: 14, fontWeight: '600', color: '#f8fafc' },
    tabTextInactive: { fontSize: 14, fontWeight: '500', color: '#64748b' },
    activeIndicator: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, backgroundColor: '#818cf8' },
    form: { gap: 16, marginTop: 4 },
    inputGroup: { gap: 6 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    label: { fontSize: 12, fontWeight: '600', color: '#94a3b8' },
    inputWrapper: { position: 'relative', justifyContent: 'center' },
    inputIcon: { position: 'absolute', left: 14, zIndex: 1 },
    eyeIcon: { position: 'absolute', right: 14, zIndex: 1 },
    input: {
        height: 48,
        backgroundColor: '#030712',
        borderWidth: 1,
        borderColor: '#1e293b',
        borderRadius: 12,
        paddingLeft: 42,
        paddingRight: 16,
        color: '#f8fafc',
        fontSize: 14,
    },
    submitButton: {
        height: 48,
        backgroundColor: '#4f46e5',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 6,
    },
    submitButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
    line: { flex: 1, height: 1, backgroundColor: '#1e293b' },
    dividerText: { marginHorizontal: 12, fontSize: 10, color: '#64748b', fontWeight: '600', letterSpacing: 0.8 },
    linkText: { fontSize: 12, color: '#818cf8', fontWeight: '500' },
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