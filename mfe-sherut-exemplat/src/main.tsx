import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div style={{ padding: '24px', maxWidth: '760px', margin: '0 auto' }}>
      <App idntSheryut="SHR001" employeeId="1001" />
    </div>
  </React.StrictMode>
);
