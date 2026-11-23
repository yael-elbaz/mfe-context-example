# Spec: החלפת אדם בתוך התיק

## מטרה

מתוך תיק עובד או לקוח אפשר להחליף לאדם אחר בלי לצאת מהתיק.
אם פתוח שירות (כדף מלא או כאוברליי), הוא נשאר פתוח ונטען מחדש עבור האדם החדש.

---

## עיקרון: ה-URL הוא מקור האמת

כפתור ההחלפה **לא** קורא ל-`setSelectedPerson`. הוא משנה רק את הפרמטר ב-URL
(`employeeId` / `customerId`), וה-Layout טוען את האדם ומעדכן את `personStore`. הסטור הוא השתקפות של ה-URL.

כך רענון, קישור ישיר וכפתור "אחורה" עובדים, ויש מסלול טעינה אחד בלבד.

```
[החלפה] → PersonSwitchButton → (שירות פתוח? → ConfirmDialog) → navigate(?employeeId=חדש)
                                                                       ↓
                                       Layout: useEffect([employeeId]) → setSelectedPerson
                                                                       ↓
                                       הדר + EmployeePortfolioMFE + Outlet מתעדכנים
```

---

## התנהגות

| מצב | התנהגות |
|---|---|
| נבחר אדם מאותו סוג | רק הפרמטר משתנה. ה-pathname וה-`location.state` (בו נמצא `mfeConfig` של שירות) נשמרים |
| נבחר אדם מסוג אחר (עובד ↔ לקוח) | מעבר לראש התיק של הסוג השני. שירות פתוח נסגר |
| נבחר אותו אדם | לא קורה כלום |
| שירות פתוח (`/sherutim/:id` בנתיב) | אחרי הבחירה ולפני הניווט מוצג דיאלוג אישור. ביטול — לא קורה כלום |
| "אחורה" בדפדפן | חוזר לאדם הקודם (ההחלפה היא push). **ללא** אישור: `useBlocker` דורש data router, והאפליקציה על `BrowserRouter` |
| החלפה מהירה A→B | טעינת A מבוטלת ב-cleanup של ה-effect ולא דורסת את B בסטור |
| state של האדם הקודם | עטיפת ה-`Outlet` מקבלת `key={personId}`, כך שהתוכן נבנה מחדש |
| `doSearch` ב-URL | מתנקה בהחלפה (`useClearUrlSearchOnChange`, קיים) |

### למה אישור בכל שירות פתוח
המעטפת לא יודעת מה קורה בתוך שירות, ולכן לא יודעת אם יש בו שינויים שלא נשמרו.
בהמשך אפשר להוסיף חוזה אופציונלי (`onDirtyChange`) כדי לשאול רק כשבאמת יש שינויים.

---

## חוזה לשירותים

שירות יכול לקבל את האדם הנוכחי באחת משתי דרכים:
- **props**: `SherutDynamicView` מעביר `employeeId` מהסטור. מתאים לשירות שצריך לרוץ גם לבד או מצוות אחר.
- **האזנה ל-`shell/personStore`**: חשוף ב-federation, ו-`zustand` מוגדר כ-singleton. מתאים לשירות פנימי.

בשני המקרים השירות **חייב**:
1. להגיב לשינוי ב-id ולא רק ב-mount (`useEffect(() => load(), [personId])`).
2. להאזין ל-id ולא לכל האובייקט (`s => s.person?.id`).
3. לא לטעון כש-`isLoadingPerson` הוא `true` או כשה-id ריק.

---

## UI

- **תיק עובד**: כפתור "החלפה" בהדר של התיק (`EmployeePortfolioHeader`), ליד "סגירת תיק".
- **תיק לקוח**: כפתור "החלפה" מעל כרטיס הלקוח.
- **הבחירה**: לחיצה על "החלפה" פותחת חלונית קטנה צמודה לכפתור (`PersonSwitchButton`), ובה רק רכיב איתור אדם (`mfe_search_employee`, עובדים ולקוחות).
  החלונית לא מודאלית: בלי רקע כהה, והדף נשאר גלוי. בחירה מחליפה מיד, בלי כפתור אישור. לחיצה מחוץ לחלונית או Esc סוגרות אותה.
  התצוגה מופרדת מהלוגיקה: `PersonSwitchButton` רק מחזיר את האדם שנבחר (`onPick`), ו-`switchTo` ב-hook מבצע את ההחלפה.

---

## קבצים

| קובץ | תפקיד |
|---|---|
| `shell/src/hooks/usePersonSwitch.ts` | `switchTo(idnt, personType)`: אישור וניווט |
| `shell/src/components/PersonSwitchButton.tsx` | כפתור "החלפה" + חלונית איתור אדם |
| `shell/src/hooks/useConfirmDialog.ts` | דיאלוג אישור מבוסס Promise |
| `shell/src/components/ConfirmDialog.tsx` | התצוגה של דיאלוג האישור |
| `shell/src/components/EmployeePortfolioHeader.tsx` | prop בשם `onSwitch(idnt, personType)` ו-`PersonSwitchButton` |
| `shell/src/components/EmployeePortfolioLayout.tsx` | חיבור ה-hook, ביטול טעינה ישנה, `key` על ה-Outlet |
| `shell/src/components/CustomerPortfolioLayout.tsx` | אותו דבר לתיק לקוח |
