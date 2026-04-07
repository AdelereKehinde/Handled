import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../theme';

import AuthEntryScreen from '../screens/AuthEntryScreen';
import CalmScreen from '../screens/CalmScreen';
import DailyGuidanceScreen from '../screens/DailyGuidanceScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import FocusSessionScreen from '../screens/FocusSessionScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import LoginScreen from '../screens/LoginScreen';
import MainScreen from '../screens/MainScreen';
import MoodDashboardScreen from '../screens/MoodDashboardScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import SignupScreen from '../screens/SignupScreen';
import SplashScreen from '../screens/SplashScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: false,
  animation: 'fade_from_bottom',
  contentStyle: { backgroundColor: Colors.background },
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={screenOptions}>
        {/* Splash */}
        <Stack.Screen name="Splash" component={SplashScreen} />

        {/* Onboarding */}
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ animation: 'fade' }}
        />

        {/* Auth flow */}
        <Stack.Screen name="AuthEntry" component={AuthEntryScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen
          name="EmailVerification"
          component={EmailVerificationScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ animation: 'slide_from_bottom' }}
        />

        {/* Legal */}
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={{ animation: 'slide_from_bottom' }}
        />

        {/* Main App */}
        <Stack.Screen name="Main" component={MainScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="Calm" component={CalmScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Guidance" component={DailyGuidanceScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Focus" component={FocusSessionScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Mood" component={MoodDashboardScreen} options={{ animation: 'slide_from_right' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
