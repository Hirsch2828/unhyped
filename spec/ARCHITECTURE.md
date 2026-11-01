# Unhyped: ארכיטקטורה

> טיוטה ראשונה · 18.10.2026
> נגזר מ־PRD.md ומ־tech-stack.md (שניהם אושרו 18.10.2026), ומ־course-stack.md.
> **עודכן 1.11.2026** לסטאק הקורס מ־25.10.2026 ול־tech-stack.md המעודכן. כל שינוי מסומן "(עודכן 1.11)".
> המסמך מתאר **איך** החלקים מתחברים: מבנה הריפו, הטבלאות, הזרימות, והחוזים מול המודל.
> מספרי הפיצ'רים (#) הם המספרים ב־MVP.md. "הנחה" = החלטה קטנה שלא כתובה במקורות.

---

## 1. התמונה הגדולה (עודכן 1.11)

```
                  ┌───────────────────────────┐
                  │ 22 מקורות: RSS + Hacker News │
                  └─────────────┬─────────────┘
                                │ פעם ביום / Run update now
                                ▼
                  ┌───────────────────────────────┐   Gemini Flash
                  │ n8n (מחשב, ולקראת ההצגה Railway)│ ◀──────────▶ (מסנן, כותב, תדריך)
                  │ איסוף → מסנן → כותב → תדריך    │
                  └───────▲───────────────┬───────┘
          webhook + סוד   │               │ כתיבה, מפתח סודי
┌─────────────────────────┴───┐           ▼
│ Vercel, כתובת אחת            │      ┌──────────────────────────────┐
│ דפים: HTML + CSS + JS        │ ◀──▶ │ Supabase, טבלאות נעולות        │
│ api/stories · api/brief      │ מפתח │ raw_items · stories · profiles │
│ api/run-update · api/profile │ סודי └──────────────────────────────┘
└──────────────▲──────────────┘
               │ רק /api/...
          ┌────┴────┐
          │  דפדפן  │
          └─────────┘
```

- **הדפדפן** פונה רק לכתובות /api של האתר עצמו. הוא לא פונה ל־Supabase, לא קורא למודל ולא כותב סיפורים.
- **הפונקציות ב־Vercel** הן היחידות שקוראות מ־Supabase בשביל הדפדפן, עם המפתח הסודי. api/run-update היא גם הגשר המאובטח בין הכפתור ל־n8n.
- **n8n** הוא היחיד שכותב לטבלאות raw_items ו־stories, והיחיד שקורא למודל.

## 2. מבנה הריפו

```
/
├── index.html            דף הבית (#6, #7, #9)
├── onboarding.html       בחירת נושאים (#2)
├── story.html            עמוד ידיעה, ?id= (#10, #11)
├── brief.html            התדריך (#12)
├── preferences.html      ההעדפות שלי (#4, Should)
├── login.html            כניסה עם משתמש מוכן מראש (#3, Should)
├── css/style.css
├── js/
│   ├── config.js         ספים בלבד (ראו סעיף 7). בלי כתובת ובלי מפתח של Supabase (עודכן 1.11)
│   ├── api.js            כל הקריאות לפונקציות, בכתובות יחסיות (עודכן 1.11)
│   ├── prefs.js          העדפות: localStorage לאורח, api/profile למשתמש רשום
│   ├── rules.js          Breaking, Trending, רמת עומק. פונקציות טהורות
│   ├── feed.js           בניית ה־Hero והשורות
│   └── [page].js         קובץ לכל דף
├── data/
│   ├── sources.json      22 המקורות: id, שם, כתובת, נושא, רמת אמינות
│   ├── subtopics.json    תתי־נושאים לכל נושא (נקבע בשלב A)
│   ├── audience-groups.json
│   └── snapshot.json     גיבוי של הסיפורים להצגה (Could, ראו סעיף 9)
├── assets/logos/         לוגו לכל חברה, לתמונת הכרטיס (#18)
├── api/ (עודכן 1.11)
│   ├── stories.js        פיד, וסיפור לפי id (GET)
│   ├── brief.js          התדריכים של היום (GET)
│   ├── run-update.js     הכפתור: Webhook ל־n8n (POST)
│   └── profile.js        Should: הפרופיל של המשתמש המחובר
├── lib/supabase.js       לקוח Supabase אחד, עם המפתח הסודי. מחוץ ל־api (עודכן 1.11)
├── .env.example          רק שמות המפתחות, בלי ערכים (עודכן 1.11)
├── .claude/settings.json חוסם את Claude מלקרוא .env ו־.env.local (עודכן 1.11)
├── prompts/              filter.md, writer.md, brief.md. עותק של הפרומפטים שב־n8n
├── n8n/                  ייצוא של ה־workflows, בלי Credentials
├── supabase/schema.sql   הטבלאות והרשאות ה־RLS
├── ai-tests.md
├── package.json          "type": "module"
└── README.md
```

- supabase-js רצה בפונקציות. בדפדפן היא נטענת מ־CDN רק בשביל הכניסה (Should), עם המפתח הציבורי, ולא פותחת אף טבלה. בלי כלי בנייה (עודכן 1.11).
- n8n קורא את sources.json ישירות מהריפו הציבורי, כך שיש רשימת מקורות אחת.

## 3. מודל הנתונים

### raw_items: פריטים גולמיים

| שדה | סוג | הערה |
|---|---|---|
| id | uuid | |
| source_id | text | מפתח ב־sources.json |
| url | text, ייחודי | מונע איסוף כפול |
| title | text | |
| content | text | הנחה: חתוך לאורך מקסימלי לפני השליחה למודל |
| published_at | timestamptz | |
| fetched_at | timestamptz | |
| hn_points, hn_comments | int | רק לפריטים מ־Hacker News |
| status | text | pending / passed / dropped / error |
| topic | text | ai / tesla, מהמסנן |
| story_id | uuid, אפשר ריק | לאיזה סיפור הפריט שויך |

### stories: סיפורים ותדריכים

| שדה | סוג | הערה |
|---|---|---|
| id | uuid | |
| kind | text | story / brief |
| topic | text | ai / tesla |
| subtopics | jsonb | רשימה |
| audiences | jsonb | רשימה, מ־audience-groups.json |
| title, summary, why_it_matters, what_changed | text | |
| importance | text | critical / high / medium / low / ignore |
| certainty | text | official / report / rumor |
| claims | jsonb | `[{ "text": "...", "source_urls": ["..."] }]` |
| sources | jsonb | `[{ "source_id", "url", "title", "level", "published_at" }]` |
| timeline | jsonb | `[{ "at", "text" }]` (Could) |
| first_published_at | timestamptz | זמן הפריט הראשון. משמש את כלל Breaking |
| last_updated_at | timestamptz | |
| version | int | עולה בכל עדכון. משמש את "Updated since you last looked" |
| hn_points, hn_comments | int | הכי גבוה מבין הפריטים |
| source_count | int | כמה מקורות שונים |
| image_key | text | שם הלוגו ב־assets/logos |
| is_hidden | bool | הסתרת ידיעה שגויה (#22), דרך הדשבורד |
| brief_date | date | רק ל־brief |
| body | text | רק ל־brief: טקסט התדריך |

- **הנחה:** תדריך הוא שורה עם kind = brief. נוצר תדריך אחד לכל נושא בכל יום. מי שבחר את שני הנושאים רואה את שניהם, אחד אחרי השני.

### profiles: משתמשים רשומים (Should)

| שדה | סוג | הערה |
|---|---|---|
| id | uuid | זהה ל־id של המשתמש ב־Supabase Auth |
| topics, subtopics | jsonb | |
| depth | text | major / important / all |
| brief_time | time | |
| actions | jsonb | `{ "saved": [ids], "not_relevant": [ids] }` |
| seen | jsonb | `{ "story_id": version }` |
| updated_at | timestamptz | |

- רשימות ששייכות למשתמש אחד נשמרות ב־JSON באותה שורה, לפי course-stack.md.
- **אורח** שומר רק topics, subtopics ו־depth ב־localStorage. "מה ראה" נשמר רק למשתמש רשום.

## 4. הרשאות טבלה (עודכן 1.11)

כל הטבלאות נעולות: RLS דולק, בלי אף policy, ו־revoke all מ־anon ומ־authenticated. רק service_role מקבל grant, במפורש בכל migration.

| טבלה | דפדפן | פונקציות ב־Vercel (service_role) | n8n (service_role) |
|---|---|---|---|
| raw_items | אין | אין | select, insert, update, delete |
| stories | אין. רק דרך api/stories ו־api/brief | select. רק is_hidden = false, ורק העמודות שהמסך צריך | select, insert, update |
| profiles | אין. רק דרך api/profile | select, insert, update. רק בשורה של המשתמש שאומת | אין |

- api/profile.js מאמתת את הטוקן עם supabase.auth.getUser(token), ומסננת לפי המזהה שקיבלה מהאימות.

## 5. הזרימות

### 5.1 עדכון (n8n, פעם ביום או מהכפתור)

1. **בדיקת נעילה:** אם יש ריצה פעילה, או שהריצה האחרונה הייתה לפני פחות מ־10 דקות (הנחה), מחזירים busy ועוצרים.
2. **איסוף (#14):** קוראים את sources.json. לכל מקור RSS מושכים את הפריטים, ומ־Hacker News את הסיפורים המובילים עם נקודות ותגובות.
3. **שמירה:** מכניסים ל־raw_items. כתובת שכבר קיימת לא נכנסת שוב.
4. **מסנן (#15):** לכל פריט pending, שולחים למודל את הפריט ואת רשימת הסיפורים מ־7 הימים האחרונים (id וכותרת בלבד. הנחה). המודל מחזיר: רלוונטי, נושא, ואם זה אותו אירוע כמו סיפור קיים. פריט לא רלוונטי מקבל dropped.
5. **כותב (#16):** לכל פריט passed, שולחים את הפריט, את רמת האמינות שלו, ואת הסיפור הקיים אם יש. המודל מחזיר סיפור מלא.
6. **בדיקת מבנה:** קוד ב־n8n בודק את ה־JSON (סעיף 6). לא תקין: הפריט מקבל error ולא נשמר שום סיפור.
7. **שמירת סיפור:** חדש נכנס כשורה חדשה. עדכון: מעדכנים את השורה הקיימת, version + 1, ומוסיפים את המקור ל־sources.
8. **חישוב בקוד:** source_count, hn_points, first_published_at, image_key.
9. **הנחה:** הפריטים מעובדים אחד אחרי השני, כך שסיפור שנוצר הרגע כבר מופיע ברשימה לפריט הבא. כך שני פריטים על אותו אירוע באותה ריצה מתאחדים.

### 5.2 תדריך יומי (n8n, אחרי העדכון)

1. לכל נושא: לוקחים סיפורים מהיממה האחרונה, critical ו־high (הנחה).
2. שולחים למודל עם פרומפט התדריך. אותם כללים: מקור לכל טענה, טענה נשארת טענה.
3. שומרים כשורת brief עם brief_date של היום.
4. אין שליחה. הדפדפן מציג את הבאנר (5.4).

### 5.3 טעינת דף הבית (דפדפן)

1. **העדפות:** אם אין, מעבירים ל־onboarding.html.
2. **קריאה:** api/stories מחזירה סיפורים מ־7 הימים האחרונים בנושאים שנבחרו, ו־api/brief את התדריכים של היום. רק העמודות של הכרטיס, ועם מגבלת שורות (עודכן 1.11).
3. **סינון בקוד:** לפי depth ותתי־נושאים, בלי מה שסומן "לא רלוונטי".
4. **כללים:** rules.js מחשב Breaking ו־Trending לכל סיפור, לפי השעה הנוכחית.
5. **בנייה:** feed.js בונה Hero ושורות (סעיף 7).
6. **משתמש רשום:** משווה version מול seen ובונה "Updated since you last looked" (#8).

### 5.4 באנר התדריך (דפדפן, Should)

אם יש brief של היום, והשעה עכשיו אחרי brief_time בפרופיל: מוצג באנר "☀️ Your morning brief is ready" עם קישור ל־brief.html.

### 5.5 Run update now (#19)

1. הדפדפן שולח POST ל־/api/run-update.
2. הפונקציה שולחת ל־Webhook של n8n, עם כותרת סוד (Header Auth). אם n8n לא זמין, היא מחזירה offline (עודכן 1.11).
3. n8n עונה מיד: started או busy, ומריץ את 5.1 ברקע.
4. הפונקציה מחזירה לדפדפן `{ "ok": true, "status": "started" }`, או `{ "ok": false, "error": "..." }` בשגיאה.
5. הדפדפן מציג "Updating…", ואחרי כדקה מופיע כפתור "Show new stories". לחיצה עליו קוראת שוב ל־api/stories, פעם אחת. בלי בדיקה חוזרת בטיימר, כדי לחסוך תעבורה (עודכן 1.11).
6. offline: "Live update isn't available right now. Showing latest stories.", והפיד נשאר כמו שהוא (עודכן 1.11).

### 5.6 כניסה (Should)

1. בשמירה ראשונה (#11) אורח מועבר ל־login.html.
2. כניסה עם מייל וסיסמה של משתמש מוכן מראש (רמה 2), בדף, עם Supabase Auth. הדף שולח את הטוקן ל־api/profile, בכותרת Authorization (עודכן 1.11).
3. בכניסה ראשונה: ההעדפות מ־localStorage נשלחות ל־api/profile, שכותבת אותן ל־profiles (עודכן 1.11).
4. חוזרים לסיפור, והוא נשמר בלי לחיצה נוספת.

## 6. החוזים מול המודל

כל קריאה מבקשת JSON לפי סכמה קבועה. הקוד בודק כל שדה לפני השימוש.

### מסנן: פלט

```json
{
  "relevant": true,
  "topic": "ai",
  "same_event_as": "story-id או null",
  "reason": "משפט קצר"
}
```

### כותב: פלט

```json
{
  "is_update": false,
  "title": "...",
  "summary": "2–3 משפטים",
  "why_it_matters": "...",
  "what_changed": "...",
  "topic": "ai",
  "subtopics": ["..."],
  "audiences": ["..."],
  "importance": "critical | high | medium | low | ignore",
  "certainty": "official | report | rumor",
  "claims": [{ "text": "...", "source_urls": ["..."] }]
}
```

**בדיקות בקוד:**
- כל שדה קיים ובסוג הנכון. ערכי importance ו־certainty מתוך הרשימה בלבד.
- subtopics מתוך subtopics.json, audiences מתוך audience-groups.json. ערך לא מוכר נזרק.
- לכל טענה לפחות כתובת אחת, וכל כתובת היא של פריט שנשלח למודל. אחרת: error.
- **מקור יחיד ברמה 4 = rumor**, גם אם המודל כתב אחרת. נאכף בקוד.
- **Breaking לא נלקח מהמודל.** למרות שבעשרת ההיבטים הוא בפלט, לפי ה־PRD הוא מחושב בקוד.

### התדריך: פלט

```json
{ "title": "...", "body": "...", "claims": [{ "text": "...", "source_urls": ["..."] }] }
```

## 7. הלוגיקה בדפדפן (rules.js, feed.js)

**רמת עומק:**

| depth | מה מוצג |
|---|---|
| major (רק גדולות) | critical |
| important (חשובות) | critical, high |
| all (הכול) | critical, high, medium |

low ו־ignore לא מוצגים אף פעם.

**Breaking:** importance = critical, **וגם** (מקור ברמה 1 **או** לפחות 2 מקורות ברמה 2 מאתרים שונים), **וגם** first_published_at בשעתיים האחרונות.
- הנחה: "בלתי תלויים" = מקורות שונים ב־sources.json.

**Trending:** hn_points ≥ TRENDING_HN_POINTS, **או** source_count ≥ TRENDING_SOURCES ביממה האחרונה.
- הנחה: שני הספים יושבים ב־config.js ונקבעים בשלב A לפי נתוני השבוע.

**Hero:**
1. כניסה ראשונה: "What happened in AI this week", עם 3 הסיפורים החשובים של 7 הימים האחרונים (הנחה).
2. אחרת: סיפור Breaking, החדש ביותר.
3. אין Breaking: החשוב ביותר מהיממה האחרונה, ואז החדש ביותר.

**שורות:** לפי ההגדרות ב־PRD, סעיף 8.2. סיפור לא מופיע ביותר משתי שורות, ושורה ריקה לא מוצגת.

## 8. מפה: פיצ'ר ← איפה הוא חי

| # | פיצ'ר | דפדפן | Vercel | n8n | Supabase |
|---|---|---|---|---|---|
| 1, 2 | אורח, Onboarding | ✓ | | | |
| 3, 4 | כניסה, העדפות (Should) | ✓ | ✓ | | profiles |
| 5 | קבוצות רלוונטיות (Could) | ✓ | | ✓ | stories |
| 6–9 | Hero, שורות, כרטיס | ✓ | ✓ | | stories |
| 10, 11 | עמוד ידיעה, שמירה | ✓ | ✓ | | stories, profiles |
| 12 | תדריך | ✓ | ✓ | ✓ | stories |
| 13 | באנר תדריך (Should) | ✓ | ✓ | | profiles |
| 14–16 | איסוף, מסנן, כותב | | | ✓ | raw_items, stories |
| 17 | Breaking, Trending | ✓ | | | |
| 18 | תמונת כרטיס | ✓ | | ✓ | |
| 19 | Run update now | ✓ | ✓ | ✓ | |
| 20 | מחיקה אחרי 30 יום (Could) | | | ✓ | raw_items |
| 21, 22 | ניהול (Could) | | | | דשבורד + sources.json |

## 9. כשמשהו נופל

| מה נפל | מה קורה |
|---|---|
| מקור RSS אחד לא עונה | מדלגים עליו וממשיכים. נרשם בלוג של n8n |
| המודל לא עונה או חורג ממגבלת הקצב | הפריט נשאר pending ומעובד בריצה הבאה |
| פלט לא תקין | הפריט מקבל error. שום סיפור לא משתנה |
| Run update now נכשל | הפיד נשאר עם הנתונים הקיימים. הודעה קצרה: "Update failed. Showing latest stories." |
| Supabase לא עונה בהצגה | Could: הדפדפן טוען את data/snapshot.json, שיוצא מהטבלה יום לפני ההצגה (הנחה) |

## 10. סדר הבנייה

לפי MVP.md, סעיף 3:

| שלב | מה נבנה מהמסמך הזה |
|---|---|
| A | sources.json, prompts/, זרימות 5.1–5.2 ב־n8n, ai-tests.md. מכאן נקבעים subtopics.json והספים |
| B | supabase/schema.sql (סעיפים 3–4), טעינת שבוע הנתונים |
| C | lib/supabase.js, api/stories.js, onboarding.html, index.html, story.html, rules.js, feed.js. מכאן האתר כולו ב־Vercel (עודכן 1.11) |
| D | api/brief.js, brief.html |
| E | api/run-update.js וזרימה 5.5, ו־n8n ב־Railway לקראת ההצגה (עודכן 1.11). בדיקת הצגה בלי API |

## 11. שאלות פתוחות

אין שאלה שחוסמת. ההנחות המסומנות למעלה נבדקות בשלב A.
