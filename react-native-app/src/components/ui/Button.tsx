import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { tw } from '../../lib/utils'; // Using tw from utils.ts

// Define Button Variants and Sizes using twrnc syntax
const buttonVariants = {
  variant: {
    default: 'bg-slate-900', // bg-primary text-primary-foreground hover:bg-primary/90
    destructive: 'bg-red-500', // bg-destructive text-destructive-foreground hover:bg-destructive/90
    outline: 'border border-slate-200 bg-transparent', // border border-input bg-background hover:bg-accent hover:text-accent-foreground
    secondary: 'bg-slate-100', // bg-secondary text-secondary-foreground hover:bg-secondary/80
    ghost: '', // hover:bg-accent hover:text-accent-foreground
    link: 'text-slate-900 underline-offset-4 underline', // text-primary underline-offset-4 hover:underline
  },
  size: {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  },
};

const buttonTextVariants = {
  variant: {
    default: 'text-white', // text-primary-foreground
    destructive: 'text-white', // text-destructive-foreground
    outline: 'text-slate-900', // text-accent-foreground (assuming this for hover state, default is input text color)
    secondary: 'text-slate-900', // text-secondary-foreground
    ghost: 'text-slate-900', // text-accent-foreground
    link: 'text-slate-900', // text-primary
  },
  size: { // Text size adjustments are less common directly in CVA for buttons, usually inherited or fixed
    default: 'text-base',
    sm: 'text-sm',
    lg: 'text-lg',
  }
};

export interface ButtonProps extends React.ComponentPropsWithoutRef<typeof TouchableOpacity> {
  variant?: keyof typeof buttonVariants.variant;
  size?: keyof typeof buttonVariants.size;
  children: React.ReactNode; // To allow text or other elements as children
  textClassName?: string; // Allow overriding text styles
}

const Button = React.forwardRef<TouchableOpacity, ButtonProps>(
  ({ children, variant = 'default', size = 'default', style, textClassName, ...props }, ref) => {
    const baseStyle = tw`flex-row items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`;
    
    const variantStyle = tw`${buttonVariants.variant[variant]}`;
    const sizeStyle = tw`${buttonVariants.size[size]}`;

    const textBaseStyle = tw`text-center font-medium`;
    const textVariantStyle = tw`${buttonTextVariants.variant[variant]}`;
    // Text size style can be applied if needed, e.g., buttonTextVariants.size[size]
    const textSizeStyle = tw`${buttonTextVariants.size[size] || buttonTextVariants.size.default}`;


    return (
      <TouchableOpacity
        style={[baseStyle, variantStyle, sizeStyle, style as ViewStyle]}
        ref={ref}
        {...props}
      >
        {typeof children === 'string' ? (
          <Text style={[textBaseStyle, textVariantStyle, textSizeStyle, textClassName ? tw`${textClassName}`: {} as TextStyle]}>
            {children}
          </Text>
        ) : (
          children // If children is not a string, render it directly (e.g. an Icon)
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';

export { Button };
