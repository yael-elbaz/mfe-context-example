import React from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import { useAppContext } from 'shell/store';
import App from './App';

// Mock לפיתוח עצמאי
useAppContext.setState({
  user: { id: 'dev-user', name: 'משתמש פיתוח', email: 'dev@org.co.il', roles: ['user'] },
  selectedUnit: { id: 'unit-1', name: 'מחלקת כספים', department: 'finance' },
  availableUnits: [{ id: 'unit-1', name: 'מחלקת כספים', department: 'finance' }],
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
