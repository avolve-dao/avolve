# Avolve Mobile App Integration Plan

This document outlines the plan for integrating React Native with Expo to create a mobile app version of the Avolve platform for the Apple App Store.

## Overview

The Avolve mobile app will provide a native mobile experience for users, allowing them to access the Supercivilization ecosystem on iOS devices. The app will be built using React Native with Expo, which provides a streamlined development workflow and easy deployment to the App Store.

## Architecture

The mobile app will follow a shared codebase approach, where business logic and API integrations are shared between the web and mobile platforms, while UI components are platform-specific to ensure the best user experience on each platform.

### Technology Stack

- **React Native**: Core framework for building the mobile app
- **Expo**: Development platform for streamlined workflow
- **Supabase JS SDK**: For database and authentication
- **Redux Toolkit**: For state management
- **React Navigation**: For navigation between screens
- **Expo Notifications**: For push notifications
- **Expo Updates**: For over-the-air updates
- **Expo Secure Store**: For secure storage of tokens and sensitive data

## Project Structure

```
avolve/
├── src/
│   ├── api/                 # Shared API services
│   ├── components/          # Web-specific components
│   ├── hooks/               # Shared custom hooks
│   ├── lib/                 # Shared utilities
│   ├── pages/               # Web pages (Next.js)
│   ├── store/               # Shared state management
│   ├── types/               # Shared TypeScript types
│   └── utils/               # Shared utility functions
├── mobile/                  # Mobile app (React Native with Expo)
│   ├── App.tsx              # Entry point
│   ├── app.json             # Expo configuration
│   ├── assets/              # Mobile-specific assets
│   ├── components/          # Mobile-specific components
│   ├── navigation/          # React Navigation setup
│   ├── screens/             # Mobile screens
│   ├── styles/              # Mobile-specific styles
│   └── utils/               # Mobile-specific utilities
├── shared/                  # Shared code between web and mobile
│   ├── api/                 # API services
│   ├── constants/           # Shared constants
│   ├── hooks/               # Shared hooks
│   ├── store/               # Shared state management
│   ├── types/               # Shared types
│   └── utils/               # Shared utilities
```

## Implementation Plan

### Phase 1: Setup and Foundation (2 weeks)

1. **Project Setup**

   - Initialize Expo project
   - Configure TypeScript
   - Set up ESLint and Prettier
   - Configure directory structure

2. **Core Infrastructure**

   - Set up Supabase integration
   - Configure authentication flow
   - Set up navigation structure
   - Implement shared state management

3. **Design System**
   - Create mobile design tokens
   - Implement core UI components
   - Set up theming (light/dark mode)
   - Implement accessibility features

### Phase 2: Feature Implementation (4 weeks)

1. **Authentication**

   - Sign in/sign up screens
   - Password reset flow
   - Invitation code redemption
   - Biometric authentication

2. **Core Features**

   - User profile
   - Supercivilization feed
   - Token management
   - Feature unlocks
   - Progress tracking

3. **Engagement Features**
   - Notifications
   - Achievements
   - Social sharing
   - Invitations

### Phase 3: Polish and Optimization (2 weeks)

1. **Performance Optimization**

   - Reduce bundle size
   - Optimize image loading
   - Implement caching strategies
   - Optimize animations

2. **User Experience**

   - Implement gestures
   - Add haptic feedback
   - Optimize for different screen sizes
   - Implement offline mode

3. **Testing**
   - Unit tests
   - Integration tests
   - End-to-end tests
   - User acceptance testing

### Phase 4: Deployment (2 weeks)

1. **App Store Preparation**

   - Create App Store listing
   - Prepare screenshots and promotional materials
   - Write app description and keywords
   - Configure App Store Connect

2. **Submission and Review**

   - Submit app for review
   - Address reviewer feedback
   - Prepare for launch

3. **Launch**
   - Soft launch to limited audience
   - Collect feedback
   - Full launch
   - Marketing and promotion

## Key Features

### Authentication

- Secure login with email/password
- Biometric authentication (Face ID/Touch ID)
- Social login options
- Invitation code redemption

### User Profile

- View and edit profile
- Track progress and achievements
- Manage token balances
- View feature unlock status

### Supercivilization Feed

- View and interact with posts
- Create new posts
- Filter and search content
- Save favorite posts

### Feature Unlocks

- View available features
- Track unlock progress
- Unlock new features
- Receive unlock notifications

### Token Economy

- View token balances
- Earn tokens through activities
- Spend tokens to unlock features
- View transaction history

### Notifications

- Push notifications for important events
- In-app notifications
- Notification preferences
- Daily reminders and streaks

## Technical Considerations

### Authentication

The mobile app will use Supabase Auth for authentication, with secure storage of tokens using Expo Secure Store. Biometric authentication will be implemented using Expo Local Authentication.

```typescript
// Example authentication setup
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### State Management

The mobile app will use Redux Toolkit for state management, with a shared store structure between web and mobile platforms.

```typescript
// Example shared store setup
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { api } from '../api/api';
import authReducer from './authSlice';
import featuresReducer from './featuresSlice';
import tokensReducer from './tokensSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'features', 'tokens'],
};

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  features: featuresReducer,
  tokens: tokensReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(api.middleware),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Navigation

The mobile app will use React Navigation for navigation between screens, with a tab-based navigation structure for the main app flow.

```typescript
// Example navigation setup
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { FeaturesScreen } from '../screens/FeaturesScreen';
import { TokensScreen } from '../screens/TokensScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Features" component={FeaturesScreen} />
      <Tab.Screen name="Tokens" component={TokensScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export const Navigation = () => {
  const { user, onboardingCompleted } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : !onboardingCompleted ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### Offline Support

The mobile app will implement offline support using a combination of local storage and synchronization strategies.

```typescript
// Example offline support setup
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setOnlineStatus } from '../store/appSlice';

export const useOfflineSupport = () => {
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsConnected(!!online);
      dispatch(setOnlineStatus(!!online));
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return { isConnected };
};
```

### Push Notifications

The mobile app will implement push notifications using Expo Notifications, with server-side integration for sending notifications.

```typescript
// Example push notification setup
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }

  token = (await Notifications.getExpoPushTokenAsync()).data;

  // Save the token to the user's profile
  const { user } = supabase.auth;
  if (user) {
    await supabase.from('profiles').update({ expo_push_token: token }).eq('id', user.id);
  }

  return token;
}
```

## App Store Considerations

### App Store Guidelines

The mobile app will adhere to Apple's App Store Guidelines, including:

- Privacy policy and terms of service
- App tracking transparency
- In-app purchases (if applicable)
- Content moderation
- User data handling

### App Store Optimization

The mobile app will be optimized for the App Store, including:

- App name and subtitle
- Keywords and description
- Screenshots and preview video
- App icon and promotional images
- Ratings and reviews strategy

## Testing Strategy

### Unit Testing

Unit tests will be implemented for core business logic and utility functions using Jest.

### Integration Testing

Integration tests will be implemented for key user flows using React Native Testing Library.

### End-to-End Testing

End-to-end tests will be implemented using Detox to ensure the app works as expected in real-world scenarios.

### Manual Testing

Manual testing will be performed on various iOS devices and iOS versions to ensure compatibility and performance.

## Deployment Strategy

### CI/CD Pipeline

A CI/CD pipeline will be set up using GitHub Actions to automate the build and deployment process.

### App Store Submission

The app will be submitted to the App Store using App Store Connect, with a phased rollout strategy to minimize risk.

### OTA Updates

Over-the-air updates will be implemented using Expo Updates to deliver bug fixes and minor feature updates without going through the App Store review process.

## Monitoring and Analytics

### Error Handling and Monitoring

The mobile app will include robust error handling to ensure a smooth user experience:

- Graceful error handling with user-friendly messages
- Offline error queueing for later reporting when connectivity is restored
- Comprehensive logging for debugging purposes
- Analytics integration to track error frequency and impact

### Analytics

Analytics will be implemented using a combination of PostHog and internal tracking to monitor user behavior and app performance.

### Performance Monitoring

Performance monitoring will be implemented to track app startup time, screen load times, and other key performance metrics.

## Timeline and Resources

### Timeline

- **Phase 1**: 2 weeks
- **Phase 2**: 4 weeks
- **Phase 3**: 2 weeks
- **Phase 4**: 2 weeks
- **Total**: 10 weeks

### Resources

- 1 React Native Lead Developer
- 2 React Native Developers
- 1 UI/UX Designer
- 1 QA Engineer
- 1 DevOps Engineer

## Conclusion

The Avolve mobile app will provide a native mobile experience for users, allowing them to access the Supercivilization ecosystem on iOS devices. By following this integration plan, we can ensure a successful launch of the mobile app on the Apple App Store, providing a seamless experience for users across web and mobile platforms.
