# אפיון: EmployeePortfolio — ארכיטקטורת MFE Sections

## עיקרון מרכזי
`employeeId` חי ב-URL בלבד (`?employeeId=1003`).  
כל MFE קורא אותו עצמאית מה-URL — אין העברת props בין shell לבין MFEs.

---

## מבנה ניווט

```
/employee-portfolio?employeeId=1003
  ├── EmployeePortfolioMFE          ← תמיד נראה (נתוני עובד)
  └── כל ה-Previews (Outlet: index)
        ├── SherutimPreview  [הצג הכל → /employee-portfolio/sherutim?employeeId=1003]
        ├── TasksPreview     [הצג הכל → /employee-portfolio/tasks?employeeId=1003]
        └── TrainingPreview  [הצג הכל → /employee-portfolio/training?employeeId=1003]

/employee-portfolio/sherutim?employeeId=1003
  ├── EmployeePortfolioMFE          ← עדיין נראה
  └── SherutimFull (Outlet: :section)
        └── [← חזרה → /employee-portfolio?employeeId=1003]
```

---

## flow משתמש

```
מחפש עובד → /employee-portfolio?employeeId=1003
┌──────────────────────────────────────┐
│         EmployeePortfolioMFE         │  ← תמיד
├──────────────────────────────────────┤
│  📋 סיכום שירותים      [הצג הכל]   │
│  ✅ סיכום משימות        [הצג הכל]   │
│  📚 סיכום הדרכות        [הצג הכל]   │
└──────────────────────────────────────┘
           ↓ לחיצה על [הצג הכל] בשירותים

/employee-portfolio/sherutim?employeeId=1003
┌──────────────────────────────────────┐
│         EmployeePortfolioMFE         │  ← עדיין נראה
├──────────────────────────────────────┤
│  [← חזרה]                           │
│                                      │
│           SherutimFull               │
│                                      │
└──────────────────────────────────────┘
           ↓ לחיצה על [← חזרה]

חוזר ל /employee-portfolio?employeeId=1003
```

---

## Routes ב-Shell

```tsx
// App.tsx — route אחד דינמי לכל הסections
<Route path="/employee-portfolio" element={<EmployeePortfolioLayout />}>
  <Route index           element={<EmployeePortfolioIndex />} />
  <Route path=":section" element={<SectionFullView />} />
</Route>
```

---

## Registry — הוספת MFE = שורה אחת

```ts
// shell/src/employeeSections.ts
export const SECTIONS = [
  {
    id: 'sherutim',
    label: 'שירותים דיגיטליים',
    Preview: lazy(() => import('mfe_sherutim/Preview')),
    Full:    lazy(() => import('mfe_sherutim/Full')),
  },
  {
    id: 'tasks',
    label: 'משימות',
    Preview: lazy(() => import('mfe_tasks/Preview')),
    Full:    lazy(() => import('mfe_tasks/Full')),
  },
  {
    id: 'training',
    label: 'הדרכות',
    Preview: lazy(() => import('mfe_training/Preview')),
    Full:    lazy(() => import('mfe_training/Full')),
  },
  // הוספת section חדש = שורה אחת כאן בלבד
];
```

---

## קומפוננטות Shell

### EmployeePortfolioLayout.tsx
```tsx
// עטיפה קבועה — EmployeePortfolioMFE תמיד נראה
const EmployeePortfolioLayout = () => (
  <>
    <EmployeePortfolioMFE />
    <Outlet />
  </>
);
```

### EmployeePortfolioIndex.tsx
```tsx
// מציג את כל ה-Previews — employeeId מגיע מה-URL בתוך כל MFE
const EmployeePortfolioIndex = () => (
  <>
    {SECTIONS.map(({ id, Preview }) => (
      <Suspense key={id} fallback={<div>טוען...</div>}>
        <Preview />
      </Suspense>
    ))}
  </>
);
```

### SectionFullView.tsx
```tsx
// בוחר את ה-Full המתאים לפי :section בנתיב
const SectionFullView = () => {
  const { section } = useParams();
  const match = SECTIONS.find(s => s.id === section);
  if (!match) return <div>מקטע לא נמצא</div>;
  return (
    <Suspense fallback={<div>טוען...</div>}>
      <match.Full />
    </Suspense>
  );
};
```

---

## מבנה MFE — דוגמה עם mfe-sherutim

```
mfe-employee-digital-sherutim/src/
  hooks/
    useSherutim.ts          ← קורא employeeId מה-URL, מחזיר נתונים
  components/
    SherutimCard.tsx        ← UI של שירות בודד
  Preview.tsx               ← EXPOSED: 3 שירותים + כפתור הצג הכל
  Full.tsx                  ← EXPOSED: כל השירותים + כפתור חזרה
```

### useSherutim.ts — employeeId מה-URL
```ts
export function useSherutim() {
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('employeeId') ?? '';
  const [sherutim, setSherutim] = useState<Sherut[]>([]);

  useEffect(() => {
    if (!employeeId) return;
    fetchSherutim(employeeId).then(setSherutim);
  }, [employeeId]);

  return sherutim;
}
```

### Preview.tsx — EXPOSED
```tsx
const Preview = () => {
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('employeeId');
  const sherutim = useSherutim();
  const navigate = useNavigate();

  return (
    <section>
      <h3>שירותים דיגיטליים</h3>
      {sherutim.slice(0, 3).map(s => <SherutimCard key={s.id} sherut={s} />)}
      <button onClick={() => navigate(`/employee-portfolio/sherutim?employeeId=${employeeId}`)}>
        הצג הכל
      </button>
    </section>
  );
};
```

### Full.tsx — EXPOSED
```tsx
const Full = () => {
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('employeeId');
  const sherutim = useSherutim();
  const navigate = useNavigate();

  return (
    <section>
      <button onClick={() => navigate(`/employee-portfolio?employeeId=${employeeId}`)}>
        ← חזרה
      </button>
      <h2>כל השירותים הדיגיטליים</h2>
      {sherutim.map(s => <SherutimCard key={s.id} sherut={s} />)}
    </section>
  );
};
```

### vite.config.ts של ה-MFE
```ts
federation({
  name: 'mfe_sherutim',
  exposes: {
    './Preview': './src/Preview.tsx',
    './Full':    './src/Full.tsx',
  },
})
```

---

## עקרונות ארכיטקטוניים

| עיקרון | הסבר |
|--------|-------|
| URL כ-Single Source of Truth | `employeeId` ב-query param — נגיש לכל MFE ללא props |
| Shell כ-Orchestrator | מגדיר routes ו-registry בלבד |
| Registry Pattern | הוספת MFE חדש = שורה אחת ב-`employeeSections.ts` |
| Nested Layout | `EmployeePortfolioMFE` תמיד נראה בכל תת-נתיב |
| Bundle Splitting | Preview ו-Full נטענים בנפרד — lazy per section |
| אין Props בין Shell ל-MFE | כל MFE עצמאי — קורא מה-URL בעצמו |
