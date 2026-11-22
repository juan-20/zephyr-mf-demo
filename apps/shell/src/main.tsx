import { createRoot } from 'react-dom/client';
import { configureApi, useSession } from '@repo/store';
import App from './App';

configureApi(import.meta.env.VITE_API_URL ?? 'http://localhost:3000');
void useSession.getState().restore();

createRoot(document.getElementById('root')!).render(<App />);
