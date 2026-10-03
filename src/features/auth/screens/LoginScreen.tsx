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
import { useAppTheme } from '../../../theme/ThemeContext';
import { useAuthStore } from '../hooks/useAuthStore';

const BlueprintGrid: React.FC = () => {
  const columns = Array.from({ length: 7 }, (_, i) => i);
  const rows = Array.from({ length: 12 }, (_, i) => i);
  return (
    <View pointerEvents="none" style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.06 }}>
      <View style={{ position: 'absolute', inset: 0, flexDirection: 'row', justifyContent: 'space-between' }}>
        {columns.map((i) => (
          <View key={`col-${i}`} style={{ width: 1, height: '100%', backgroundColor: '#A2A8B5' }} />
        ))}
      </View>
      <View style={{ position: 'absolute', inset: 0, justifyContent: 'space-between' }}>
        {rows.map((i) => (
          <View key={`row-${i}`} style={{ width: '100%', height: 1, backgroundColor: '#A2A8B5' }} />
        ))}
      </View>
    </View>
  );
};

const SkylineMotif: React.FC<{ accent: string; accentSoft: string }> = ({ accent, accentSoft }) => {
  const bars = [38, 62, 46, 80, 54, 34, 70];
  return (
    <View pointerEvents="none" style={{ marginTop: 8, height: 96, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', opacity: 0.8 }}>
      {bars.map((height, index) => (
        <View
          key={index}
          style={{
            height,
            width: 14,
            marginHorizontal: 3,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
            backgroundColor: index === 3 ? accent : accentSoft,
          }}
        />
      ))}
    </View>
  );
};

interface LoginScreenProps {
  onRegister: () => void;
  onSignedIn: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onRegister, onSignedIn }) => {
  const { colors } = useAppTheme();
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
    setTimeout(onSignedIn, 350);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.canvas }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <BlueprintGrid />

          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 64,
                height: 64,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 18,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.subpanel,
              }}
            >
              <Building2 size={28} color={colors.brassAccent} />
            </View>
            <Text style={{ marginTop: 16, fontSize: 28, fontWeight: '800', letterSpacing: 0.8, color: colors.textPrimary }}>SPACE MAKER</Text>
            <Text style={{ marginTop: 4, fontSize: 11, letterSpacing: 3, color: colors.textSecondary }}>TELE-DESK ENTERPRISE SUITE</Text>
            <SkylineMotif accent={colors.brassAccent} accentSoft={colors.subpanel} />
          </View>

          <View
            style={{
              marginTop: 28,
              borderRadius: 26,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              padding: 24,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>Agent Sign In</Text>
            <Text style={{ marginTop: 4, fontSize: 14, color: colors.textSecondary }}>
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
              style={{
                marginTop: 24,
                minHeight: 52,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.brassAccent,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>Clock In / Sign In</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                useAuthStore.getState().login('imrannahar', '123456');
                onSignedIn();
              }}
              style={{
                marginTop: 12,
                minHeight: 52,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: colors.brassAccent,
                backgroundColor: colors.subpanel,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '800', color: colors.brassAccent }}>Enter demo desk</Text>
            </Pressable>

            <Pressable
              onPress={onRegister}
              style={{ marginTop: 16, minHeight: 48, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.brassAccent }}>
                New Agent? Register for Onboarding
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
