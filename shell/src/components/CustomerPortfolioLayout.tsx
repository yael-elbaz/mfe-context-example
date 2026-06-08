import React, { useEffect, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { useSelectedPersonStore, useCurrentCustomer, type CustomerProfile } from '../store/personStore';
import { Helper } from '../utils/urlHelper';

const CUSTOMERS: Record<string, Omit<CustomerProfile, 'type'>> = {
  'C001': { id: 'C001', firstName: 'משה',   lastName: 'ישראלי',  email: 'moshe@mail.co.il',  phone: '050-1111111', address: 'רחוב הרצל 10', city: 'תל אביב',  memberSince: '2019' },
  'C002': { id: 'C002', firstName: 'רחל',   lastName: 'כהן',     email: 'rachel@mail.co.il', phone: '052-2222222', address: 'שדרות הנשיא 5', city: 'חיפה',    memberSince: '2021' },
  'C003': { id: 'C003', firstName: 'דוד',   lastName: 'לוי',     email: 'david@mail.co.il',  phone: '054-3333333', address: 'רחוב יפו 22',   city: 'ירושלים', memberSince: '2020' },
  'C004': { id: 'C004', firstName: 'שרה',   lastName: 'אברהם',   email: 'sarah@mail.co.il',  phone: '050-4444444', address: 'רחוב הנגב 3',  city: 'באר שבע', memberSince: '2022' },
  'C005': { id: 'C005', firstName: 'יעקב',  lastName: 'פרידמן',  email: 'yaakov@mail.co.il', phone: '052-5555555', address: 'רחוב ביאליק 8', city: 'רמת גן',  memberSince: '2018' },
};

const CustomerCard: React.FC = () => {
  const customer = useCurrentCustomer();

  if (!customer) return null;

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px 20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      direction: 'rtl',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
    }}>
      <div style={{
        width: '80px', height: '80px',
        borderRadius: '50%',
        background: '#FFF3E0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '32px',
      }}>
        👤
      </div>

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 4px', color: '#E65100', fontSize: '18px' }}>
          {customer.firstName} {customer.lastName}
        </h2>
        <span style={{
          fontSize: '11px', fontWeight: 600,
          padding: '2px 8px', borderRadius: '4px',
          background: '#FFF3E0', color: '#E65100',
        }}>
          לקוח
        </span>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[
          { label: 'מספר לקוח', value: customer.id },
          { label: 'עיר',        value: customer.city },
          { label: 'כתובת',      value: customer.address },
          { label: 'אימייל',     value: customer.email },
          { label: 'טלפון',      value: customer.phone },
          { label: 'לקוח מאז',  value: customer.memberSince },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: '#F8F9FD', borderRadius: '8px', padding: '8px 12px' }}>
            <div style={{ fontSize: '10px', color: '#848282', marginBottom: '2px' }}>{label}</div>
            <div style={{ fontSize: '13px', color: '#00033D', fontWeight: 500, wordBreak: 'break-word' }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomerPortfolioLayout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const customerId = Helper.getParam('customerId', searchParams) ?? '';
  const customer = useCurrentCustomer();
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!customerId) return;
    const { setSelectedPerson, setIsLoadingPerson } = useSelectedPersonStore.getState();
    setLoading(true);
    setIsLoadingPerson(true);
    setNotFound(false);
    setTimeout(() => {
      const raw = CUSTOMERS[customerId] ?? null;
      if (!raw) {
        setLoading(false);
        setIsLoadingPerson(false);
        setNotFound(true);
        return;
      }
      setSelectedPerson({ type: 'customer', ...raw });
      setLoading(false);
      setIsLoadingPerson(false);
    }, 400);
  }, [customerId]);

  // Clear store only when the layout fully unmounts, not on sub-route changes
  useEffect(() => {
    return () => {
      useSelectedPersonStore.getState().clearSelectedPerson();
      useSelectedPersonStore.getState().setIsLoadingPerson(false);
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '24px', alignItems: 'flex-start', direction: 'rtl' }}>
      <div style={{ width: '25%', flexShrink: 0, position: 'sticky', top: '108px' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#888' }}>⏳ טוען...</div>
        ) : (
          <CustomerCard />
        )}
      </div>
      <div style={{ flex: 1 }}>
        {notFound ? (
          <div style={{ padding: '24px', color: '#888', fontSize: '16px', textAlign: 'right' }}>
            לקוח לא נמצא
          </div>
        ) : loading || !customer ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#E65100', direction: 'rtl' }}>
            ⏳ טוען נתוני לקוח...
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
};

export default CustomerPortfolioLayout;
