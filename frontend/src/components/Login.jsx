import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Image,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Login({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = () => {
        console.log('Autentificare cu:', { email, password });
        alert('Autentificare reușită!');
    };

    const handleGoogleLogin = () => {
        alert('Redirecționare Google OAuth...');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    <View style={styles.card}>
                        {/* Header / Logo */}
                        <View style={styles.header}>
                            <View style={styles.logoContainer}>
                                <Ionicons name="sparkles" size={28} color="#818cf8" />
                            </View>
                            <Text style={styles.title}>Productivity Assistant</Text>
                            <Text style={styles.subtitle}>Sistem inteligent multi-agent pentru fluxul tău de lucru</Text>

                            {/* Tab-uri Autentificare / Înregistrare */}
                            <View style={styles.tabsContainer}>
                                <TouchableOpacity style={styles.tabActive}>
                                    <Text style={styles.tabTextActive}>Autentificare</Text>
                                    <View style={styles.activeIndicator} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.tabInactive}
                                    onPress={() => navigation.navigate('Register')}
                                >
                                    <Text style={styles.tabTextInactive}>Înregistrare</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Formular Login */}
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
                                    <TouchableOpacity onPress={() => alert('Recuperare parolă')}>
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
    form: { gap: 16, marginTop: 4 },
    inputGroup: { gap: 6 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    label: { fontSize: 12, fontWeight: '600', color: '#94a3b8' },
    inputWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
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
    linkText: { fontSize: 12, color: '#818cf8', fontWeight: '500' },
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
        marginTop: 6,
    },
    submitButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
    line: { flex: 1, height: 1, backgroundColor: '#1e293b' },
    dividerText: { marginHorizontal: 12, fontSize: 10, color: '#64748b', fontWeight: '600', letterSpacing: 0.8 },
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