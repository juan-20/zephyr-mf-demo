import { createRoot } from 'react-dom/client';
import Feed from './Feed';

// Standalone preview: needs the API at http://localhost:3000 and a logged-in session.
createRoot(document.getElementById('root')!).render(<Feed />);
