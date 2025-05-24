import React from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';
import { tw } from '../../lib/utils'; // Using tw from utils.ts

export interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
  // React Native's TextInput already has most of what we need like placeholder, value, onChangeText
  // We can add custom props if needed, e.g., for a label or error message handling
  label?: string;
  error?: string;
  inputClassName?: string; // To allow overriding TextInput styles specifically
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({ label, error, style, inputClassName, ...props }, ref) => {
    const baseStyle = tw`flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`;
    // For web, focus styles are automatically applied. For RN, we might need to handle onFocus/onBlur to change border color,
    // or rely on native focus indicators if sufficient. For now, using placeholder for focus styling.

    return (
      <View style={tw`w-full`}>
        {label && <Text style={tw`mb-1 text-sm font-medium text-slate-700`}>{label}</Text>}
        <TextInput
          ref={ref}
          style={[baseStyle, tw`${inputClassName || ''}`, style]} // style prop allows overriding container style if this View was the one being styled
          placeholderTextColor={tw.color('text-slate-400')} // Ensure placeholder color is applied
          {...props}
        />
        {error && <Text style={tw`mt-1 text-xs text-red-500`}>{error}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';

export { Input };
