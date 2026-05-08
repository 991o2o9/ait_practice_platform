import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './providers/ThemeProvider';
import { RouterProvider } from './providers/RouterProvider';
import './styles/index.css';

const queryClient = new QueryClient();

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="ait-theme">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <RouterProvider />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
