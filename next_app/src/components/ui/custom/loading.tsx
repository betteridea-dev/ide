import React from 'react';
import { Loader2, LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

type LoadingVariant = 'default' | 'spinner' | 'dots' | 'pulse';
type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: LoadingVariant;
    size?: LoadingSize;
    text?: string;
    fullPage?: boolean;
}

const sizeMap = {
    sm: {
        icon: 16,
        text: 'text-sm',
        container: 'p-2 gap-2',
    },
    md: {
        icon: 24,
        text: 'text-base',
        container: 'p-3 gap-3',
    },
    lg: {
        icon: 32,
        text: 'text-lg',
        container: 'p-4 gap-4',
    },
    xl: {
        icon: 48,
        text: 'text-xl',
        container: 'p-5 gap-5',
    },
};

export function LoadingDots({ className, size = 'md' }: { className?: string; size?: LoadingSize }) {
    const dotSize = {
        sm: 'w-1 h-1',
        md: 'w-2 h-2',
        lg: 'w-2.5 h-2.5',
        xl: 'w-3 h-3',
    };

    return (
        <div className={cn('flex space-x-1.5', className)}>
            <div className={cn('animate-pulse rounded-full bg-current', dotSize[size])} />
            <div className={cn('animate-pulse rounded-full bg-current animation-delay-100', dotSize[size])} />
            <div className={cn('animate-pulse rounded-full bg-current animation-delay-200', dotSize[size])} />
        </div>
    );
}

export function LoadingPulse({ className }: { className?: string }) {
    return (
        <div className={cn('animate-pulse rounded-lg bg-secondary h-full w-full', className)} />
    );
}

export function Loading({
    variant = 'default',
    size = 'md',
    text,
    fullPage = false,
    className,
    ...props
}: LoadingProps) {
    const containerClasses = cn(
        'flex items-center justify-center',
        fullPage && 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50',
        !fullPage && sizeMap[size].container,
        className
    );

    return (
        <div className={containerClasses} {...props}>
            <div className="flex flex-col items-center gap-2">
                {variant === 'default' && (
                    <Loader2 className="animate-spin" size={sizeMap[size].icon} />
                )}
                {variant === 'spinner' && (
                    <div className={cn('animate-spin relative', `w-${sizeMap[size].icon} h-${sizeMap[size].icon}`)}>
                        <div className="border-2 border-current border-t-transparent rounded-full w-full h-full" />
                    </div>
                )}
                {variant === 'dots' && (
                    <LoadingDots size={size} />
                )}
                {variant === 'pulse' && (
                    <LoadingPulse className={`w-${sizeMap[size].icon} h-${sizeMap[size].icon}`} />
                )}
                {text && (
                    <span className={cn('text-muted-foreground', sizeMap[size].text)}>{text}</span>
                )}
            </div>
        </div>
    );
}

export default Loading; 