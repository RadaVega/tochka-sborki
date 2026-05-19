/**
 * src/components/ErrorBoundary.jsx
 *
 * Catches render errors in any child tree and shows a friendly recovery UI
 * instead of a blank white screen.
 */

import { Component } from 'react';
import { Link } from 'react-router-dom';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to Metrika as a custom event
    if (typeof window !== 'undefined' && typeof window.ym === 'function') {
      window.ym(window.__YM_COUNTER_ID__, 'params', {
        event: 'js_error',
        error: error?.message || 'unknown',
        component: info?.componentStack?.split('\n')[1]?.trim() || 'unknown',
        url: window.location.pathname,
      });
    }
    console.error('[ErrorBoundary]', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        gap: '20px',
      }}>
        <div style={{ fontSize: '3rem' }}>⚙️</div>
        <h2 style={{ color: 'var(--wr, #f8faff)', margin: 0 }}>
          Что-то пошло не так
        </h2>
        <p style={{ color: 'var(--li, #94a3b8)', maxWidth: 400, margin: 0 }}>
          Страница не смогла загрузиться. Попробуйте обновить или вернитесь на главную.
        </p>
        {import.meta.env.DEV && this.state.error && (
          <pre style={{
            background: 'rgba(219,39,119,.1)',
            border: '1px solid rgba(219,39,119,.3)',
            borderRadius: 8,
            padding: '12px 16px',
            fontSize: 12,
            color: '#f9a8d4',
            maxWidth: 500,
            overflowX: 'auto',
            textAlign: 'left',
          }}>
            {this.state.error.message}
          </pre>
        )}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={this.handleReset}
            style={{
              padding: '11px 24px',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #7c3aed, #0891b2)',
              color: 'white',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.95rem',
            }}
          >
            Попробовать снова
          </button>
          <Link
            to="/"
            onClick={this.handleReset}
            style={{
              padding: '11px 24px',
              borderRadius: 8,
              background: 'transparent',
              color: '#a78bfa',
              border: '1.5px solid rgba(124,58,237,.45)',
              fontWeight: 700,
              fontSize: '0.95rem',
              textDecoration: 'none',
            }}
          >
            На главную
          </Link>
        </div>
      </div>
    );
  }
}
