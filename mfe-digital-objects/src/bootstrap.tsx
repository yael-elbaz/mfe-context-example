import React from 'react';
import ReactDOM from 'react-dom/client';
import { useEmployeeStore } from 'shell/employeeStore';
import Preview from './Preview';

useEmployeeStore.setState({
  employee: {
    id: '1003',
    firstName: 'מיכל',
    lastName: 'גולן',
    yearsInCompany: 4,
    unit: 'צוות פיתוח',
    department: 'IT',
    role: 'מפתחת Full Stack',
    email: 'michal.golan@org.co.il',
    phone: '050-3456789',
    image: 'https://i.pravatar.cc/150?img=32',
    skills: ['React', 'Node.js', 'TypeScript'],
  },
  loading: false,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div style={{ padding: '24px', direction: 'rtl', maxWidth: '700px' }}>
      <Preview />
    </div>
  </React.StrictMode>
);
