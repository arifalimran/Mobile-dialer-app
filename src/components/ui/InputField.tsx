import { useEffect, useRef, useState } from 'react';
import { Animated, Text, TextInput, TextInputProps, View } from 'react-native';

import { useAppTheme } from '../../theme/ThemeContext';

interface InputFieldProps extends Omit<TextInputProps, 'placeholder'> {
  label: string;
  required?: boolean;
  error?: string | false;
}

/**
 * Dynamic form field with a floating label and theme-aware input styling.
 */
export const InputField: React.FC<InputFieldProps> = ({
  label,
  required,
  error,
  value,
  multiline,
  onFocus,
  onBlur,
  style,
  ...textInputProps
}) => {
  const { colors } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const animatedProgress = useRef(new Animated.Value(value ? 1 : 0)).current;
  const hasValue = Boolean(value && String(value).length > 0);

  const animateTo = (toValue: number) => {
    Animated.timing(animatedProgress, {
      toValue,
      duration: 160,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    if (hasValue || isFocused) {
      animateTo(1);
    } else {
      animateTo(0);
    }
  }, [hasValue, isFocused]);

  useEffect(() => {
    return () => animatedProgress.stopAnimation();
  }, [animatedProgress]);

  const handleFocus: TextInputProps['onFocus'] = (event) => {
    setIsFocused(true);
    animateTo(1);
    onFocus?.(event);
  };

  const handleBlur: TextInputProps['onBlur'] = (event) => {
    setIsFocused(false);
    if (!hasValue) animateTo(0);
    onBlur?.(event);
  };

  const labelTop = animatedProgress.interpolate({ inputRange: [0, 1], outputRange: [multiline ? 18 : 16, -9] });
  const labelFontSize = animatedProgress.interpolate({ inputRange: [0, 1], outputRange: [15, 11] });

  const borderColor = error ? '#F87171' : isFocused ? colors.brassAccent : colors.border;

  return (
    <View style={{ marginTop: 20 }}>
      <View
        style={{
          position: 'relative',
          borderWidth: 1,
          borderColor,
          backgroundColor: colors.subpanel,
          borderRadius: 14,
          paddingHorizontal: 16,
          minHeight: multiline ? 90 : 52,
          justifyContent: multiline ? 'center' : 'center',
          paddingTop: multiline ? 18 : 0,
        }}
      >
        <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 16, top: labelTop }}>
          <Animated.Text style={{ fontSize: labelFontSize, color: isFocused ? colors.brassAccent : colors.textSecondary }}>
            {label}
            {required && <Text style={{ color: '#F87171', fontWeight: '700' }}> *</Text>}
          </Animated.Text>
        </Animated.View>

        <TextInput
          value={value}
          multiline={multiline}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder=""
          placeholderTextColor={colors.textSecondary}
          style={[{ flex: 1, color: colors.textPrimary, fontSize: 16, paddingTop: multiline ? 14 : 10, minHeight: multiline ? 60 : undefined }, style]}
          {...textInputProps}
        />
      </View>

      {error && <Text style={{ marginTop: 6, color: '#F87171', fontSize: 12 }}>{error}</Text>}
    </View>
  );
};

