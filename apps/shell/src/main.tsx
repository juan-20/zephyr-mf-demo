import { createRoot } from 'react-dom/client';
import { configureApi, useSession } from '@repo/store';
import '@repo/ui/theme.css';
import App from './App';
import { resolveApiUrl } from './runtime-config';

async function bootstrap() {
  configureApi(await resolveApiUrl());
  void useSession.getState().restore();
  createRoot(document.getElementById('root')!).render(<App />);
}

void bootstrap();
