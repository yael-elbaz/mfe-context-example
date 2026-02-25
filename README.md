<<<<<<< HEAD
# mfe-context-example
mfe-context-example
=======
# דוגמת Shell + MFE עם Zustand Shared Store

## מבנה הפרויקט

```
/
├── shell/                  # אפליקציית ה-Shell (port 3000)
│   └── src/
│       ├── store/
│       │   └── appContext.ts   ← הסטור המשותף (מחושף ל-MFEs)
│       ├── components/
│       │   ├── Header.tsx
│       │   └── UnitSelector.tsx
│       └── App.tsx             ← טוען נתוני משתמש, מרכיב MFEs
│
└── mfe-tasks/              # MFE משימות (port 3001)
    └── src/
        ├── components/
        │   └── TaskList.tsx
        └── App.tsx             ← צורך shell/store ישירות
```

## זרימת הנתונים

```
Shell (App.tsx)
  │
  ├─ fetchUserSession() ──► שרת API
  │                            │
  │                            ▼
  └─ useAppContext.setState({ user, availableUnits, selectedUnit })
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Zustand Store      │
                    │  (singleton shared)  │
                    └─────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
         MFE Tasks        MFE Calendar      MFE Reports
       (useUser())      (useSelectedUnit())   (...)
```

## הרצה

```bash
# טרמינל 1 — Shell
cd shell
npm install
npm run dev       # http://localhost:3000

# טרמינל 2 — MFE Tasks
cd mfe-tasks
npm install
npm run dev       # http://localhost:3001
```

> **חשוב:** לצורך build בפרודקשן יש להריץ `npm run build && npm run preview`
> ב-Shell לפני ה-MFE, כי ה-MFE צורך את `remoteEntry.js` של ה-Shell.

## נקודות מפתח

### ה-Shell מחשיף את הסטור
```ts
// shell/vite.config.ts
exposes: {
  './store': './src/store/appContext.ts'
}
```

### ה-MFE מגדיר את ה-Shell כ-remote
```ts
// mfe-tasks/vite.config.ts
remotes: {
  shell: 'http://localhost:3000/assets/remoteEntry.js'
}
```

### ה-MFE צורך — בדיוק כמו hook רגיל
```ts
import { useUser, useSelectedUnit } from 'shell/store';

const user = useUser();
const selectedUnit = useSelectedUnit();
```

### כשהמשתמש מחליף יחידה — כל ה-MFEs מגיבים אוטומטית
```ts
// UnitSelector ב-Shell
setSelectedUnit(newUnit);

// mfe-tasks מגיב כי הוא צורך useSelectedUnit()
useEffect(() => {
  fetchTasks(selectedUnit.id); // נקרא מחדש
}, [selectedUnit?.id]);
```
>>>>>>> e974156 (upload to github)
