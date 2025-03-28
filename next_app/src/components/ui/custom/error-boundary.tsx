import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AppError } from '@/lib/utils';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onReset?: () => void;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('Error caught by ErrorBoundary:', error, errorInfo);

        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    resetErrorBoundary = (): void => {
        if (this.props.onReset) {
            this.props.onReset();
        }

        this.setState({
            hasError: false,
            error: null
        });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            const isAppError = this.state.error instanceof AppError;
            const errorCode = isAppError ? (this.state.error as AppError).code : 'UNKNOWN_ERROR';
            const errorMessage = this.state.error?.message || 'An unexpected error occurred';

            return (
                <Alert variant="destructive" className="my-4">
                    <AlertTitle>Something went wrong</AlertTitle>
                    <AlertDescription className="mt-2">
                        <div className="mb-2">
                            <strong>Error:</strong> {errorMessage}
                        </div>
                        {isAppError && (
                            <div className="mb-2">
                                <strong>Code:</strong> {errorCode}
                            </div>
                        )}
                        <Button
                            onClick={this.resetErrorBoundary}
                            variant="outline"
                            size="sm"
                            className="mt-2"
                        >
                            Try again
                        </Button>
                    </AlertDescription>
                </Alert>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 