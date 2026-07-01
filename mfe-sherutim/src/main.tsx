import React from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import Preview from './Preview';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Preview employeeId="1001" />
  </React.StrictMode>
);
