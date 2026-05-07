import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './styles/index.scss';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>AIT Practice Platform</h1>
          <p>Frontend initialized successfully!</p>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
