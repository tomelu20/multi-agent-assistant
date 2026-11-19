import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import Login from './src/components/Login';
import Register from './src/components/Register';
import Dashboard from './src/components/Dashboard';
import ExecutionLogs from './src/components/ExecutionLogs';
import TasksNotes from './src/components/TasksNotes';
import MemoryPreferences from './src/components/MemoryPreferences';
import EvaluationMetrics from './src/components/EvaluationMetrics';

const Stack = createNativeStackNavigator();

export default function App() {
    useEffect(() => {
        if (Platform.OS !== 'web') {
            GoogleSignin.configure({
                webClientId: '682446417323-24l2f06p3ojfq1uop8k63crnmb5503dv.apps.googleusercontent.com',
                offlineAccess: true,
            });
        }
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator id="MainStack" initialRouteName="Login" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Register" component={Register} />
                <Stack.Screen name="Dashboard" component={Dashboard} />
                <Stack.Screen name="ExecutionLogs" component={ExecutionLogs} />
                <Stack.Screen name="TasksNotes" component={TasksNotes} />
                <Stack.Screen name="MemoryPreferences" component={MemoryPreferences} />
                <Stack.Screen name="EvaluationMetrics" component={EvaluationMetrics} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}