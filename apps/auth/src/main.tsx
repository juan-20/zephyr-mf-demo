import { createRoot } from 'react-dom/client';
import LoginForm from './LoginForm';
import UserMenu from './UserMenu';

// Standalone preview of the exposed components.
createRoot(document.getElementById('root')!).render(
  <>
    <UserMenu />
    <LoginForm />
  </>,
);
