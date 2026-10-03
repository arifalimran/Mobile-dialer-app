import React, { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Building2 } from 'lucide-react-native';

import { InputField } from '../../../components/ui/InputField';
import { useAuthStore } from '../hooks/useAuthStore';

/** Faint blueprint-style grid overlay, built from plain Views (no SVG dependency). */
const BlueprintGrid: React.FC = () => {
  const columns = Array.from({ length: 7 }, (_, i) => i);
  const rows = Array.from({ length: 12 }, (_, i) => i);
  return (
    <View pointerEvents="none" className="absolute inset-0 overflow-hidden opacity-[0.06]">
      <View className="absolute inset-0 flex-row justify-between">
        {columns.map((i) => (
          <View key={`col-${i}`} className="h-full w-px bg-sky-300" />
        ))}
      </View>
      <View className="absolute inset-0 justify-between">
        {rows.map((i) => (
          <View key={`row-${i}`} className="h-px w-full bg-sky-300" />
        ))}
      </View>
    </View>
  );
};

/** Stylized architectural skyline motif built from layered Views (no SVG dependency). */
const SkylineMotif: React.FC = () => {
  const bars = [38, 62, 46, 80, 54, 34, 70];
  return (
    <View pointerEvents="none" className="mt-2 h-24 flex-row items-end justify-center opacity-80">
      {bars.map((height, index) => (
        <View
          key={index}
          style={{ height, width: 14, marginHorizontal: 3 }}
          className={index === 3 ? 'rounded-t-sm bg-sky-500' : 'rounded-t-sm bg-sky-500/30'}
        />
      ))}
    </View>
  );
};

interface LoginScreenProps {
  onRegister: () => void;
  onSignedIn: () => void;
}

/**
 * Module 2: luxury architectural login screen. Strict session routing lives
 * in `App.tsx` — this screen only calls `useAuthStore().login()`, which
 * flips `isAuthenticated` and lets the root router mount `AppShell`.
 */
export const LoginScreen: React.FC<LoginScreenProps> = ({ onRegister, onSignedIn }) => {
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState<string | false>(false);

  const handleSignIn = () => {
    Keyboard.dismiss();
    const typedId = identifier.trim();
    const typedPin = pin.trim();

    if (typedId !== 'imrannahar' || typedPin !== '123456') {
      const message = 'Wrong username or password. Use imrannahar / 123456';
      setLoginError(message);
      Alert.alert('Login failed', message);
      return;
    }

    const ok = useAuthStore.getState().login(typedId, typedPin);
    if (!ok) {
      Alert.alert('Login failed', 'Wrong username or password.');
      return;
    }
    setLoginError(false);
    // Let the keyboard finish closing before the login screen unmounts.
    setTimeout(onSignedIn, 350);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-[#070b12]">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        className="flex-1 px-6"
      >
        <View className="flex-1 justify-center">
          <BlueprintGrid />

          <View className="items-center">
            <View className="h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <Building2 size={28} color="#0ea5e9" />
            </View>
            <Text className="mt-4 text-2xl font-bold tracking-tight text-white">SPACE MAKER</Text>
            <Text className="text-xs tracking-[3px] text-slate-500">TELE-DESK ENTERPRISE SUITE</Text>
            <SkylineMotif />
          </View>

          <View className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <Text className="text-lg font-bold tracking-tight text-white">Agent Sign In</Text>
            <Text className="mt-1 text-sm text-slate-400">
              Clock in with your corporate credentials to start your shift.
            </Text>

            <InputField
              label="Corporate Phone / ID"
              required
              value={identifier}
              onChangeText={setIdentifier}
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
            <InputField
              label="PIN / Password"
              required
              value={pin}
              onChangeText={setPin}
              secureTextEntry
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSignIn}
              error={loginError}
            />

            <Pressable
              onPress={handleSignIn}
              className="mt-6 min-h-[52px] flex-row items-center justify-center rounded-xl bg-sky-600 active:scale-[0.98]"
            >
              <Text className="text-base font-bold tracking-tight text-white">Clock In / Sign In</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                useAuthStore.getState().login('imrannahar', '123456');
                onSignedIn();
              }}
              className="mt-3 min-h-[52px] items-center justify-center rounded-xl border border-sky-500"
            >
              <Text className="text-base font-bold text-sky-300">Enter demo desk</Text>
            </Pressable>

            <Pressable onPress={onRegister} className="mt-4 min-h-[48px] items-center justify-center">
              <Text className="text-sm font-semibold text-sky-400">
                New Agent? Register for Onboarding
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
