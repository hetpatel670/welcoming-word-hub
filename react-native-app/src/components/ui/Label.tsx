import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { tw } from '../../lib/utils'; // Using tw from utils.ts

export interface LabelProps extends React.ComponentPropsWithoutRef<typeof Text> {
  children: React.ReactNode;
  // className prop can be handled via the style prop with tw``
}

const Label = React.forwardRef<Text, LabelProps>(
  ({ children, style, ...props }, ref) => {
    // Default styles for a label, can be overridden by `style` prop
    // Equivalent to: text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70
    const baseStyle = tw`text-sm font-medium text-slate-800 leading-none`;
    // React Native doesn't have a direct "peer-disabled" concept like web.
    // If this label is associated with an input, the input's disabled state would be managed separately.
    // We can add an `opacity-70` if a `disabled` prop is explicitly passed to the Label.

    return (
      <Text ref={ref} style={[baseStyle, style]} {...props}>
        {children}
      </Text>
    );
  }
);

Label.displayName = 'Label';

export { Label };
