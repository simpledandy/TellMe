import { Pressable, Text, PressableProps, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { cn } from '../utils/cn';
import { useTheme } from '../contexts/ThemeContext';
import { colors } from '../theme/colors';

type ButtonVariant = 'primary' | 'secondary' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  title: string;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

const getVariantStyles = (variant: ButtonVariant, isDark: boolean): ViewStyle => {
  const theme = isDark ? colors.dark : colors.light;
  
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: theme.accent.primary,
        borderColor: theme.accent.primary,
      };
    case 'secondary':
      return {
        backgroundColor: theme.background.secondary,
        borderColor: theme.border.primary,
      };
    case 'text':
      return {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      };
  }
};

const getTextStyles = (variant: ButtonVariant, isDark: boolean): TextStyle => {
  const theme = isDark ? colors.dark : colors.light;
  
  switch (variant) {
    case 'primary':
      return {
        color: theme.text.primary,
      };
    case 'secondary':
      return {
        color: theme.text.secondary,
      };
    case 'text':
      return {
        color: theme.accent.primary,
      };
  }
};

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: { paddingVertical: 8, paddingHorizontal: 16 },
  md: { paddingVertical: 12, paddingHorizontal: 24 },
  lg: { paddingVertical: 16, paddingHorizontal: 32 },
};

const textSizeStyles: Record<ButtonSize, TextStyle> = {
  sm: { fontSize: 14 },
  md: { fontSize: 16 },
  lg: { fontSize: 18 },
};

export function Button({
  variant = 'primary',
  size = 'md',
  title,
  loading = false,
  className,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { isDark } = useTheme();

  return (
    <Pressable
      className={cn(
        'rounded-lg items-center justify-center',
        disabled && 'opacity-50',
        className
      )}
      style={[
        getVariantStyles(variant, isDark),
        sizeStyles[size],
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      <Text
        className="font-medium text-center"
        style={[
          getTextStyles(variant, isDark),
          textSizeStyles[size],
        ]}
      >
        {loading ? 'Loading...' : title}
      </Text>
    </Pressable>
  );
}
