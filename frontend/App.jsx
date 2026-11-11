import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import Login from './src/components/Login';
import Register from './src/components/Register';
import Dashboard from './src/components/Dashboard';

const Stack = createNativeStackNavigator();

export default function App() {
    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '682446417323-24l2f06p3ojfq1uop8k63crnmb5503dv.apps.googleusercontent.com',
            offlineAccess: true,
        });
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator id="MainStack" initialRouteName="Login" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Register" component={Register} />
                <Stack.Screen name="Dashboard" component={Dashboard} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}