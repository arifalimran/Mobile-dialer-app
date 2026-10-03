import { useEffect, useRef, useState } from 'react';
import { Animated, Text, TextInput, TextInputProps, View } from 'react-native';

interface InputFieldProps extends Omit<TextInputProps, 'placeholder'> {
  label: string;
  required?: boolean;
  error?: string | false;
}

/**
 * Module 4: dynamic form field with a floating (ghost-text) label that
 * glides up on focus/value without a layout shift, an ambient sky glow ring
 * on focus, and a bright rose "*" for required fields. Used across
 * `AgentRegistrationScreen` and the dialer workbench.
 */
export const InputField: React.FC<InputFieldProps> = ({
  label,
  required,
  error,
  value,
  className,
  multiline,
  onFocus,
  onBlur,
  ...textInputProps
}) => {
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

  const borderClassName = error
    ? 'border-rose-500'
    : isFocused
      ? 'border-sky-500 bg-white/[0.03]'
      : 'border-white/10';

  return (
    <View className="mt-5">
      <View className={`relative rounded-xl border bg-slate-900 px-4 ${multiline ? 'min-h-[90px] pt-4' : 'min-h-[52px] justify-center'} ${borderClassName}`}>
        <Animated.View
          pointerEvents="none"
          style={{ position: 'absolute', left: 16, top: labelTop }}
        >
          <Animated.Text style={{ fontSize: labelFontSize, color: isFocused ? '#38bdf8' : '#64748b' }}>
            {label}
            {required && <Text className="font-bold text-rose-500"> *</Text>}
          </Animated.Text>
        </Animated.View>

        <TextInput
          value={value}
          multiline={multiline}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder=""
          placeholderTextColor="#475569"
          style={{ paddingTop: multiline ? 14 : 10, minHeight: multiline ? 60 : undefined }}
          className={`text-base text-white ${className ?? ''}`}
          {...textInputProps}
        />
      </View>

      {error && <Text className="mt-1 text-xs text-rose-400">{error}</Text>}
    </View>
  );
};

