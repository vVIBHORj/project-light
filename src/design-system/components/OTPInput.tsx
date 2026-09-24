import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  Pressable,
  ViewStyle,
} from 'react-native';
import { colors, radii, typography, spacing, shadows } from '../tokens';

export interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
  style?: ViewStyle;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  error = false,
  style,
}) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const digits = value.split('');

  const handleBoxPress = () => {
    inputRef.current?.focus();
  };

  return (
    <Pressable onPress={handleBoxPress} style={[styles.container, style]}>
      {/* Hidden native input capturing keyboard */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => {
          const cleaned = text.replace(/[^0-9]/g, '').slice(0, length);
          onChange(cleaned);
        }}
        keyboardType="number-pad"
        maxLength={length}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={styles.hiddenInput}
        autoFocus
      />

      {/* Styled Digits Container */}
      <View style={styles.boxRow}>
        {Array.from({ length }).map((_, index) => {
          const digit = digits[index] || '';
          const isCurrentFocus = isFocused && index === digits.length;

          return (
            <View
              key={index}
              style={[
                styles.box,
                shadows.chip,
                digit ? styles.boxFilled : null,
                isCurrentFocus && styles.boxFocused,
                error && styles.boxError,
              ]}
            >
              <Text style={styles.digitText}>{digit}</Text>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  boxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 340,
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxFilled: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  boxFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  boxError: {
    borderColor: colors.destructive,
  },
  digitText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 22,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
});

export default OTPInput;
