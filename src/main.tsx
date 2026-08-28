import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@styles/index.scss';
import App from './App';
import { migrate } from './core/migrate';

// Runs before any rendering — backs up v1 data and writes the v2 blob as a
// silent side effect. The UI still reads/writes v1 keys until the Phase-3 cutover.
migrate();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
