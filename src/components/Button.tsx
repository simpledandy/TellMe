import { Pressable, Text, PressableProps } from 'react-native';
import { cn } from '../utils/cn';
import { useTheme } from '../contexts/ThemeContext';
import { colors } from '../theme/colors';

type ButtonVariant = 'primary' | 'secondary' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  title: string;
  loading?: boolean;
}

const getVariantStyles = (variant: ButtonVariant, isDark: boolean) => {
  const theme = isDark ? colors.dark : colors.light;
  
  switch (variant) {
    case 'primary':
      return `bg-[${theme.accent.primary}] active:bg-[${theme.accent.secondary}]`;
    case 'secondary':
      return `bg-[${theme.background.secondary}] active:bg-[${theme.border.primary}]`;
    case 'text':
      return `bg-transparent active:bg-[${theme.background.secondary}]`;
  }
};

const getTextStyles = (variant: ButtonVariant, isDark: boolean) => {
  const theme = isDark ? colors.dark : colors.light;
  
  switch (variant) {
    case 'primary':
      return `text-[${theme.text.primary}]`;
    case 'secondary':
      return `text-[${theme.text.secondary}]`;
    case 'text':
      return `text-[${theme.accent.primary}]`;
  }
};

const sizeStyles = {
  sm: 'py-2 px-4',
  md: 'py-3 px-6',
  lg: 'py-4 px-8',
};

const textSizeStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  title,
  loading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const { isDark } = useTheme();

  return (
    <Pressable
      className={cn(
        'rounded-lg items-center justify-center',
        getVariantStyles(variant, isDark),
        sizeStyles[size],
        disabled && 'opacity-50',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      <Text
        className={cn(
          'font-medium text-center',
          getTextStyles(variant, isDark),
          textSizeStyles[size]
        )}
      >
        {loading ? 'Loading...' : title}
      </Text>
    </Pressable>
  );
}
