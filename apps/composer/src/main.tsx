import { createRoot } from 'react-dom/client';
import '@repo/ui/theme.css';
import PostComposer from './PostComposer';

createRoot(document.getElementById('root')!).render(
  <div className="app">
    <PostComposer />
  </div>,
);
