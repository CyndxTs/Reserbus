import { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

// Evita la pantalla en blanco: si algo falla al renderizar, se muestra el error.
class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error de renderizado:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="mx-auto mt-16 max-w-[640px] rounded-2xl border border-red-200 bg-red-50 p-8 text-left">
        <h1 className="mb-3 text-2xl font-bold text-red-700">Algo salió mal</h1>
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-white p-4 font-code text-sm text-[#222]">
          {this.state.error.message}
        </pre>
        <button
          className="mt-4 cursor-pointer rounded-lg border-0 bg-brand px-5 py-3 text-white"
          onClick={() => { this.setState({ error: null }); window.location.assign('/'); }}
        >
          Ir al inicio
        </button>
      </main>
    );
  }
}

export default ErrorBoundary;
