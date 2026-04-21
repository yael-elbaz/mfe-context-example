import React from 'react';
import './index.css';
import { loadFonts } from './loadFonts';
import ReactDOM from 'react-dom/client';

loadFonts();
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
