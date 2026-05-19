import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    try {
      if (typeof window !== 'undefined' && typeof window.ym === 'function' && Number.isFinite(window.__YM_COUNTER_ID__)) {
        window.ym(window.__YM_COUNTER_ID__, 'params', {
          event: 'js_error',
          error: error?.message || 'unknown',
          component: info?.componentStack?.split('\n')[1]?.trim() || 'unknown',
          url: window.location.pathname,
        });
      }
    } catch {
      // analytics must never crash boundary
    }

    console.error('[ErrorBoundary]', error, info);
  }

  handleReload = () => {
    if (typeof window !== 'undefined') window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <section role="alert" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div style={{ maxWidth: 560, textAlign: 'center' }}>
          <h2 style={{ marginBottom: 12 }}>Не удалось загрузить страницу</h2>
          <p style={{ marginBottom: 16, opacity: 0.9 }}>Попробуйте обновить страницу. Если ошибка повторяется, вернитесь позже.</p>
          {import.meta.env.DEV && this.state.error?.message ? (
            <pre style={{ textAlign: 'left', overflow: 'auto', padding: 12, border: '1px solid #555', borderRadius: 8 }}>{this.state.error.message}</pre>
          ) : null}
          <button type="button" className="primary-button" onClick={this.handleReload}>Обновить страницу</button>
        </div>
      </section>
    );
  }
}
