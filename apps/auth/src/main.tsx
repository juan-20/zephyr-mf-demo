import { createRoot } from 'react-dom/client';
import '@repo/ui/theme.css';
import LoginForm from './LoginForm';
import UserMenu from './UserMenu';

// Standalone preview of the exposed components. In the shell, the theme is loaded once.
createRoot(document.getElementById('root')!).render(
  <div className="app">
    <UserMenu />
    <LoginForm />
  </div>,
);
