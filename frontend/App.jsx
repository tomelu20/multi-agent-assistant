import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './src/components/Login';
import Register from './src/components/Register';

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            {/* eslint-disable-next-line react/react-in-jsx-scope */}
            <Stack.Navigator id="MainStack" initialRouteName="Login" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Register" component={Register} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}