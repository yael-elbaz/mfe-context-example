# הנחיות עיצוב לפרויקט MFE

## טכנולוגיה
- Tailwind CSS v4 (דרך `@tailwindcss/vite`)
- כיוון RTL (עברית)

---

## Header

### מבנה הרכיב (שמאל לימין ב-RTL)
```
[ שם משתמש + אווטאר (פופאפ בלחיצה) ] [ 3 איקונים ] [ חיפוש כללי ] [ לוגו ]
```

### CSS מה-Figma
```css
background: #FFFFFF;
box-shadow: 0px 3px 5.9px 14px #00000040;
width: 1700px;
height: 66px;
padding: 16px;
display: flex;
justify-content: space-between;
align-items: center;
position: fixed;   /* top: 20px; left: 20px מהפיגמה */
top: 20px;
left: 20px;
opacity: 1;
```

### אלמנטים
- **משתמש**: שם + אווטאר + חץ למטה
  - אווטאר: איקון משתמש בעיגול, 24×24px, צבע `#00033D`
  - חץ: chevron-down, ~16×16px, צבע נייבי כהה (~#1C2B5E)
  - **לחיצה על החץ פותחת פופאפ שבתוכו נמצא רכיב `<UnitSelector />`**
  - ה-`UnitSelector` לא מוצג ישירות ב-Header — רק בתוך הפופאפ

### טקסט שם משתמש
```css
font-family: 'Rubik', sans-serif;
font-weight: 400;
font-size: 16px;
line-height: 22.06px;
letter-spacing: 0%;
text-align: right;
vertical-align: middle;
color: var(--BLOUE-COLOR, #00033D);
```
- **3 איקונים**: (יתווספו עם CSS שלהם בהמשך)
- **חיפוש**: רכיב `UnitSelector` עם placeholder "חיפוש כללי" + אייקון חיפוש
- **לוגו**: אייקון לפיד צבעוני בצד ימין (כחול, צהוב, כתום)

### לוגו
```css
width: 52px;
height: 50px;
border-radius: 7px;
opacity: 1;
```

### רכיב חיפוש (Search)
```css
width: 245px;
height: 38px;
border-radius: 38px;       /* pill shape */
background: #F8F8F8;
gap: 8px;
padding-top: space-400;    /* טוקן עיצוב */
padding-bottom: space-400;
padding-right: space-500;
padding-left: space-500;
opacity: 1;
```
- טקסט placeholder: "חיפוש כללי" — צבע כהה נייבי (`#1B2B6B` בערך, לאשר)
- אייקון זכוכית מגדלת: נייבי כהה, בצד שמאל (RTL)

### איקונים (פעמון + לוח שנה)
```css
/* עטיפה של שני האיקונים יחד */
display: flex;
align-items: center;
width: 61px;
height: 24px;
gap: 13px;
opacity: 1;
```
- כל אייקון: 24×24px
- צבע: נייבי כהה (~#1C2B5E)

---

## פופאפ משתמש (נפתח בלחיצה על החץ)

### CSS עטיפה
```css
width: 343px;
height: 456px;
padding: 16px;
gap: 7px;
background: #FFFFFF;
box-shadow: 0px 2px 6px 0px #00000026;
border-bottom-right-radius: 16px;
border-bottom-left-radius: 10px;
opacity: 1;
```

### חלק עליון (לבן)
**טקסט שם משתמש:**
```css
color: var(--2, #1E3BA2);
font-family: 'Rubik', sans-serif;
font-weight: 500;
font-size: 18px;
line-height: 22.06px;
letter-spacing: 0%;
text-align: right;
```
**טקסט מספר מס׳:**
```css
color: #848282;
font-family: 'Rubik', sans-serif;
font-weight: 400;
font-size: 16px;
line-height: 22.06px;
letter-spacing: 0%;
text-align: right;
```
- רכיב "בחירת יחידה": dropdown עם chevron + טקסט (לדוגמה "צלמון")

### חלק תחתון (אפור בהיר)
```css
background: var(--HOVER, #F8F9FD);
width: 311px;
height: 162px;
gap: 12px;
border-radius: 8px;
padding-right: 16px;
padding-bottom: 12px;
padding-left: 16px;
opacity: 1;
```
- תווית: "סגן מידע"
- **בחירת מחוז** — pill buttons (אחד active = כחול, שאר outlined)

### כפתורי "בחירת מחוז"
```css
/* עטיפת הקבוצה */
width: 311px;
height: 55px;
opacity: 1;
```
```css
/* כפתור active (נבחר) */
width: 90px;
height: 32px;
border-radius: 8px;
background: #4395FF;
border: 1px solid #01278C;
opacity: 1;
```
```css
/* כפתור רגיל (לא נבחר) */
width: 90px;
height: 32px;
gap: 11px;
border-radius: 8px;
background: #FFFFFF;     /* לבן — נסיק מהתמונה */
opacity: 1;
```
- **בחירת יחידה** — dropdown עם chevron
- **בחירת אגף** — multi-select עם tags/chips (ללא עיצוב בשלב זה)

### Dropdown "בחירת יחידה"
```css
background: #FFFFFF;
width: 279px;
height: 48px;
border: 1px solid var(--Color-g-blue-g-blue-btn-bg, #C5CBDD);
border-radius: 8px;
padding-top: 12px;
padding-right: 16px;
padding-bottom: 12px;
padding-left: 16px;
justify-content: space-between;
opacity: 1;
```
- תוכן: טקסט ערך נבחר בימין + chevron-down בשמאל
