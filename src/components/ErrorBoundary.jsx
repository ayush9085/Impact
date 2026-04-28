import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: '#ef4444', backgroundColor: '#fef2f2', height: '100vh', fontFamily: 'sans-serif' }}>
          <h2>Something went wrong in the UI.</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', color: '#991b1b', background: '#fff', padding: '1rem', border: '1px solid #fca5a5' }}>
            <summary><strong>Click to show error details</strong> (Please take a screenshot of this)</summary>
            <br />
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo?.componentStack}
          </details>
          <button 
            onClick={() => window.location.href = '/'} 
            style={{ marginTop: '20px', padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Go back to login
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
