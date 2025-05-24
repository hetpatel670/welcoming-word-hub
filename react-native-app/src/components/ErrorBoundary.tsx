import React, { ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    // For example, Sentry, Bugsnag, etc.
    console.error("Uncaught error:", error, errorInfo);
  }

  // For now, a full app reload is complex.
  // A simple message or a function to attempt a component reset could be used.
  // handleReset = () => {
  //   this.setState({ hasError: false, error: undefined });
  //   // Potentially, you could try to re-render children or trigger a navigation event
  //   // For a true app reload, you'd typically need native module access or a library.
  // };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong.</Text>
          {this.state.error && (
            <Text style={styles.errorText}>{this.state.error.toString()}</Text>
          )}
          <Text style={styles.message}>
            Please try restarting the application.
          </Text>
          {/* <Button title="Try Again" onPress={this.handleReset} /> */}
          {/* The above button is commented out as a simple reset might not be sufficient */}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16, // p-4 equivalent
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default ErrorBoundary;
