import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { auth } from './services/firebase.ts';
import { onAuthStateChanged } from 'firebase/auth';

const root = createRoot(document.getElementById('root')!);

onAuthStateChanged(auth, () => {
  root.render(
    <StrictMode>
      <Router>
        <App />
      </Router>
    </StrictMode>
  );
});
