# ai-tests.md: בדיקות המסנן והכותב

> נכתב 9.11.2026 לפני ההרצה הראשונה. **עדיין לא הורץ מול Gemini.** ההרצה דורשת n8n מקומי ומפתח Gemini, שאורי מחזיק.
> הקלטים הם פריטים אמיתיים מ־`spec/raw_items.json` (שבוע 28.9.2026), לפי ה-id שבקובץ.
> ציפיות הן ברמת השדה. אחוז ההצלחה = מספר הקלטים שעברו את כל הציפיות שלהם, חלקי מספר הקלטים.

## מסנן (`prompts/filter.md`)

| # | קלט (id) | existing_stories | ציפייה | תוצאה בפועל | עבר |
|---|---|---|---|---|---|
| F1 | 60: OpenAI מציג GPT-6 Sol ו-Luna | ריק | `relevant: true`, `topic: ai`, `same_event_as: null` | לא הורץ | ☐ |
| F2 | 16: FSD (Supervised) מאושר בצ'כיה | ריק | `relevant: true`, `topic: tesla` | לא הורץ | ☐ |
| F3 | 14: מבצע Prime Day על תחנות כוח של EcoFlow | ריק | `relevant: false` (מודעה) | לא הורץ | ☐ |
| F4 | 158: מבצע על מצלמות אבטחה של Anker | ריק | `relevant: false` (מודעה) | לא הורץ | ☐ |
| F5 | 105: Gemini 3.8 text-to-speech | 156 (Gemini 3.8 Live) | `same_event_as: null` (מוצר אחר) | לא הורץ | ☐ |
| F6 | 189: Tesla Semi נכנס לייצור המוני | 72 (הזמנה של 2,500 משאיות) | `same_event_as: null` (אירוע אחר) | לא הורץ | ☐ |
| F7 | 156: Gemini 3.8 Live with Live Avatar | 105 (Gemini 3.8 TTS) | `same_event_as: null` | לא הורץ | ☐ |
| F8 | 110: הסבר על shadow roots | ריק | `relevant: false` או `topic: ai` עם הערכה נמוכה, לפי הכלל "הפרט חדשותי?" | לא הורץ | ☐ |
| F9 | 42: צי ה-robotaxi באוסטין חזר ל-8 רכבים | ריק | `relevant: true`, `topic: tesla` | לא הורץ | ☐ |
| F10 | 1: Sunrun ו-Tesla מעבירים 580 MW | ריק | `relevant: true`, `topic: tesla` | לא הורץ | ☐ |

## כותב (`prompts/writer.md`)

| # | קלט (id) | ציפייה | תוצאה בפועל | עבר |
|---|---|---|---|---|
| W1 | 60 + 79 (אותו אירוע מ-OpenAI ומסימון של Simon Willison) | `certainty: official` (יש מקור רמה 1), מספרי המקור בטענות תואמים לפריטים שנשלחו | לא הורץ | ☐ |
| W2 | 154 (סוכן OpenAI בפריצה לממשלת אוסטרליה, מקור יחיד רמה 2) | `certainty: report`. הטענה נשארת טענה ("according to"), לא עובדה חד-משמעית | לא הורץ | ☐ |
| W3 | 92 (MentalHealthBench, OpenAI) | `certainty: official`, `importance` בין medium ל-high | לא הורץ | ☐ |
| W4 | 140 (Waymo: 841 פציעות נמנעו ב-271 מיליון מייל) | כל מספר במקור מופיע בסיכום. אין מספר שלא הופיע בקלט | לא הורץ | ☐ |
| W5 | 42 (צי robotaxi) | `importance` לא critical. סיכום לא מכיל "revolutionary" או שפת הייפ | לא הורץ | ☐ |
| W6 | 199 (סוכני OpenAI תוקפים מסדי נתונים, TechCrunch) | אם חסר מידע על מי אחראי, הכותב כותב "Not yet announced" ולא מנחש | לא הורץ | ☐ |
| W7 | 113 (אפליקציית Tesla חושפת עיצוב Optimus Gen 3) | טענה שמקורה בדליפה מתויגת כ"לפי הדיווח", לא כעובדה | לא הורץ | ☐ |
| W8 | 189 + 72 כ-existing_story | `is_update: false`. אירוע אחר, לא עדכון | לא הורץ | ☐ |
| W9 | 1 (Sunrun ו-Tesla) | `topic: tesla`, `subtopics` רק מתוך subtopics.json | לא הורץ | ☐ |
| W10 | 16 (FSD בצ'כיה) | `subtopics` כולל `fsd` רק אם הרשימה מכילה אותו. ערך לא מוכר נזרק בקוד | לא הורץ | ☐ |
| W11 | 120 (YouTube: פידים מותאמים ו-AI) | `importance` נמוך, ולא critical | לא הורץ | ☐ |
| W12 | 182 (מבחן מצלמות AI של Apple Home) | `importance: low` או `ignore`. ביקורת מוצר, לא חדשות | לא הורץ | ☐ |

## חוקים שנאכפים בקוד (לא במודל)

- Breaking לא נלקח מהמודל. מחושב ב־`js/rules.js`.
- מקור יחיד ברמה 4 = `rumor`, גם אם המודל כתב אחרת.
- כל כתובת בטענה חייבת להיות של פריט שנשלח.

## אחוז הצלחה

- **הורץ:** לא. 0 מתוך 22 בדיקות.
- **אחוז הצלחה:** ייקבע אחרי ההרצה הראשונה. המטרה: לכל הפחות 10 קלטים שעברו (MILESTONES.md, M1).

## פתוח לפני ההרצה

- ל-104 פריטים מ-Hacker News אין שדה `level` ב-raw_items.json. צריך להחליט אם הם רמה 3, או רמה 4 (rumor). ההחלטה נדרשת לפני W2 ו-W6.
