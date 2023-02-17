import '@tensorflow/tfjs-react-native';

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

export default function App() {
    const isLoadingComplete = useCachedResources();
    const colorScheme = useColorScheme();

    const getPermissionAsync = React.useCallback(async () => {
        if (Constants.platform?.ios) {
            const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
            }
        }
    }, []);

    React.useEffect(() => {
        getPermissionAsync();
    }, []);

    if (!isLoadingComplete) {
        return null;
    } else {
        return (
            <SafeAreaProvider>
                <Navigation colorScheme={colorScheme} />
                <StatusBar />
            </SafeAreaProvider>
        );
    }
}
