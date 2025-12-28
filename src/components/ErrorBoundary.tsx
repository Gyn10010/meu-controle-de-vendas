import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    padding: '20px',
                    backgroundColor: '#f5f5f5'
                }}>
                    <div style={{
                        maxWidth: '500px',
                        padding: '30px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}>
                        <h1 style={{ color: '#e53e3e', marginBottom: '16px' }}>
                            Algo deu errado
                        </h1>
                        <p style={{ color: '#4a5568', marginBottom: '20px' }}>
                            A aplicação encontrou um erro inesperado.
                        </p>
                        <button
                            onClick={() => {
                                // Clear localStorage and reload
                                localStorage.clear();
                                window.location.href = '/';
                            }}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            Limpar dados e recarregar
                        </button>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details style={{ marginTop: '20px' }}>
                                <summary style={{ cursor: 'pointer', color: '#718096' }}>
                                    Detalhes do erro (dev)
                                </summary>
                                <pre style={{
                                    marginTop: '10px',
                                    padding: '10px',
                                    backgroundColor: '#f7fafc',
                                    borderRadius: '4px',
                                    overflow: 'auto',
                                    fontSize: '12px'
                                }}>
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
