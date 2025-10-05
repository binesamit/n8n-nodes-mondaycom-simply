# אפיון מלא: שיפור נודים של Monday.com ב-n8n

## 1. סקירה כללית (Overview)


### 1.1 מטרה
שיפור חוויית המשתמש בנודים של Monday.com ב-n8n על ידי מעבר ממבנה JSON ידני למערכת דינמית שמושכת מטא-דאטה מה-API של Monday ומציגה אופציות בחירה מותאמות לפי סוג העמודה.

### 1.2 עקרונות מנחים
- **תאימות לאחור מלאה** - משתמשים קיימים ימשיכו לעבוד עם JSON
- **גמישות מקסימלית** - תמיכה בכל סוגי העמודות של Monday
- **ביצועים** - קאש חכם למניעת שליפות מיותרות
- **UX אינטואיטיבי** - בחירה ויזואלית במקום כתיבת JSON

---

## 2. ארכיטקטורה טכנית

### 2.1 מצבי עבודה (Modes)

```typescript
enum ColumnInputMode {
  ADVANCED = 'advanced',  // ברירת מחדל - JSON כמו היום
  SIMPLE = 'simple'       // מצב חדש - UI דינמי
}
```

**שדה בחירה ברמת הנוד:**
- Label: "Column Input Mode"
- Default: `advanced`
- Options:
  - `Advanced (JSON)` - המצב הקיים
  - `Simple (Dynamic UI)` - המצב החדש

### 2.2 מנגנון הקאש

```typescript
interface CacheStructure {
  boards: {
    [boardId: string]: {
      metadata: BoardMetadata;
      columns: ColumnDefinition[];
      lastFetched: timestamp;
      ttl: number; // Time to live במילישניות
    }
  };
  items: {
    [boardId: string]: {
      items: Item[];
      lastFetched: timestamp;
      ttl: number;
    }
  };
}
```

**מדיניות רענון:**
- **טעינה ראשונית**: שליפה מ-API
- **החלפת בורד**: ניקוי קאש של הבורד הקודם + שליפה חדשה
- **רענון ידני**: כפתור "Refresh" שמנקה קאש ושולף מחדש
- **TTL**: 5 דקות (ניתן להגדרה)
- **אירועי רענון**:
  - `onBoardChange`
  - `onNodeRefresh`
  - `onManualRefresh`

---

## 3. מיפוי סוגי עמודות (Column Types Mapping)

### 3.1 טבלת סוגי עמודות

| Column Type | Monday Type | UI Component | Data Structure | Special Handling |
|-------------|-------------|--------------|----------------|------------------|
| Status | `status` | Dropdown (single select) | `{label: string, index: number}` | שליפת labels מה-settings |
| Dropdown | `dropdown` | Dropdown (single/multi) | `{labels: string[]}` | תמיכה ב-multi-select |
| People | `people` | Multi-select dropdown | `{personsAndTeams: [{id, kind}]}` | שליפת users מה-workspace |
| Date | `date` | Date picker | `{date: string, time?: string}` | פורמט ISO 8601 |
| Timeline | `timeline` | Date range picker | `{from: string, to: string}` | שני date pickers |
| Numbers | `numbers` | Number input | `number` | תמיכה בפורמטים שונים |
| Text | `text` | Text input | `string` | - |
| Long Text | `long_text` | Textarea | `{text: string}` | - |
| Link | `link` | URL input + text | `{url: string, text: string}` | ולידציה של URL |
| Email | `email` | Email input | `{email: string, text: string}` | ולידציה של email |
| Phone | `phone` | Phone input | `string` | פורמט מקומי |
| Rating | `rating` | Star rating | `{rating: number}` | 1-5 |
| Checkbox | `checkbox` | Checkbox | `{checked: boolean}` | - |
| Board Relation | `board_relation` | Async dropdown | `{linkedPulseIds: [{linkedPulseId}]}` | **עמודה מבורד אחר** |
| Dependency | `dependency` | Item picker | `{linkedPulseIds: []}` | מאותו בורד |
| Tags | `tags` | Multi-select | `{tag_ids: number[]}` | שליפת tags קיימים |
| Hour | `hour` | Time picker | `{hour: number, minute: number}` | - |
| Week | `week` | Week picker | `{week: string}` | - |
| Color Picker | `color_picker` | Color picker | `{color: string}` | HEX values |
| File | `file` | File uploader | Special handling | אסינכרוני |

### 3.2 טיפול מיוחד ב-Board Relation

```typescript
interface BoardRelationColumn {
  id: string;
  title: string;
  type: 'board_relation';
  settings: {
    board_ids: number[]; // הבורדים המקושרים
  };
}

// התנהגות:
// 1. שליפת items מהבורד/בורדים המקושרים
// 2. הצגה כ-searchable dropdown
// 3. תמיכה בבחירה מרובה
// 4. ערכים אפשריים:
//    - [] (ריק)
//    - [123] (item יחיד)
//    - [123, 456, 789] (items מרובים)
```

**דוגמת API call:**

```graphql
query {
  boards(ids: [LINKED_BOARD_IDS]) {
    items {
      id
      name
      column_values {
        id
        text
      }
    }
  }
}
```

---

## 4. זרימת עבודה (Workflow)

### 4.1 תרשים זרימה - Simple Mode

```
[User selects board]
        ↓
[API: Fetch board metadata + columns]
        ↓
[Cache board data]
        ↓
[Parse column types]
        ↓
[Render dynamic UI components per column type]
        ↓
[User fills fields] → [Special: Board Relation?]
        ↓                        ↓
[Validate input]        [Fetch linked board items]
        ↓                        ↓
[Convert to Monday      [Show searchable dropdown]
 API format]                     ↓
        ↓                [User selects items]
[Execute API call]               ↓
                          [Return as array: [] | [id] | [id1, id2, ...]]
```

### 4.2 תרשים זרימה - Advanced Mode

```
[User selects "Advanced (JSON)"]
        ↓
[Show JSON editor]
        ↓
[User writes JSON manually] (כמו היום)
        ↓
[Validate JSON syntax]
        ↓
[Execute API call]
```

---

## 5. מבנה ה-UI ב-Simple Mode

### 5.1 דוגמת UI למיפוי עמודות

```
┌─────────────────────────────────────────────┐
│ Column Input Mode: [Simple (Dynamic UI) ▼] │
├─────────────────────────────────────────────┤
│ Board: [Select Board ▼]                     │
│   → Marketing Campaign 2025                  │
├─────────────────────────────────────────────┤
│ Columns to Update:                           │
│                                               │
│ Status Column                                 │
│   Column: [Status ▼]                         │
│   Value:  [⚫ In Progress ▼]                 │
│                                               │
│ Assigned To                                   │
│   Column: [People ▼]                         │
│   Value:  [🔍 Search users...]               │
│            ☑ John Doe                        │
│            ☑ Sarah Smith                     │
│                                               │
│ Related Tasks (Board Relation)                │
│   Column: [Dependencies ▼]                   │
│   Linked Board: "Development Tasks"          │
│   Value:  [🔍 Search items...]               │
│            ☑ Task #123 - API Integration     │
│            ☐ Task #456 - Database Schema     │
│                                               │
│ Due Date                                      │
│   Column: [Timeline ▼]                       │
│   From:   [📅 2025-10-15]                    │
│   To:     [📅 2025-10-30]                    │
│                                               │
│ [+ Add Another Column]                        │
└─────────────────────────────────────────────┘
```

---

## 6. מבנה ה-API Calls

### 6.1 שליפת מטא-דאטה של בורד

```graphql
query GetBoardMetadata($boardId: ID!) {
  boards(ids: [$boardId]) {
    id
    name
    columns {
      id
      title
      type
      settings_str
    }
    items {
      id
      name
    }
  }
}
```

### 6.2 שליפת Status Labels

```typescript
// מתוך settings_str של עמודת status
const settings = JSON.parse(column.settings_str);
const labels = settings.labels; 
// { "0": "Not Started", "1": "In Progress", "2": "Done", ... }
```

### 6.3 שליפת Items מבורד מקושר

```graphql
query GetLinkedBoardItems($linkedBoardIds: [ID!]) {
  boards(ids: $linkedBoardIds) {
    id
    name
    items {
      id
      name
      column_values {
        id
        text
        type
      }
    }
  }
}
```

### 6.4 שליפת Users ב-Workspace

```graphql
query GetUsers {
  users {
    id
    name
    email
    photo_thumb
  }
  teams {
    id
    name
  }
}
```

---

## 7. לוגיקת Query גמישה

### 7.1 Query Builder עבור סינון Items

**דרישה:** אפשרות לבנות queries מורכבים עם "AND" / "OR"

```typescript
interface QueryCondition {
  column: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

interface QueryGroup {
  logic: 'AND' | 'OR';
  conditions: (QueryCondition | QueryGroup)[];
}
```

**דוגמת UI:**

```
Filter Items:
┌─────────────────────────────────────────────┐
│ [AND ▼]                                      │
│   ├─ Status [equals ▼] [Done ▼]            │
│   ├─ [OR ▼]                                 │
│   │    ├─ Priority [equals ▼] [High ▼]     │
│   │    └─ Due Date [less than ▼] [Today]   │
│   └─ Owner [in ▼] [John, Sarah]            │
│                                               │
│ [+ Add Condition] [+ Add Group]              │
└─────────────────────────────────────────────┘
```

**המרה ל-Monday API:**

```graphql
query {
  items_by_column_values(
    board_id: 123456,
    columns: [
      {column_id: "status", column_values: ["Done"]},
      {column_id: "person", column_values: ["user123", "user456"]}
    ]
  ) {
    id
    name
  }
}
```

> **הערה:** Monday API מוגבל ב-query מורכבים, אז queries מתקדמים ידרשו post-processing בצד ה-n8n.

---

## 8. טיפול בערכים ריקים/יחידים/מרובים

### 8.1 לוגיקה לפי סוג עמודה

```typescript
function handleColumnValue(columnType: string, value: any): any {
  switch (columnType) {
    case 'board_relation':
    case 'dependency':
    case 'tags':
    case 'people':
      // תמיד מערך
      if (value === null || value === undefined) return [];
      if (!Array.isArray(value)) return [value];
      return value;
      
    case 'status':
    case 'dropdown':
      // יכול להיות single או multi
      if (Array.isArray(value)) {
        return value.length === 0 ? null : value;
      }
      return value;
      
    case 'text':
    case 'long_text':
    case 'email':
      // ריק = null או ""
      return value || null;
      
    default:
      return value;
  }
}
```

### 8.2 ולידציה ותיקוף

```typescript
interface ValidationRule {
  required?: boolean;
  type?: 'array' | 'string' | 'number' | 'object';
  minLength?: number;
  maxLength?: number;
  custom?: (value: any) => boolean;
}

const columnValidations: Record<string, ValidationRule> = {
  board_relation: {
    type: 'array',
    custom: (val) => val.every(id => typeof id === 'number')
  },
  email: {
    type: 'string',
    custom: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
  },
  // ...
};
```

---

## 9. מבנה הקוד המוצע

### 9.1 מבנה קבצים

```
n8n-nodes-monday/
├── nodes/
│   └── Monday/
│       ├── Monday.node.ts              // הנוד הראשי
│       ├── MondayTrigger.node.ts
│       ├── actions/                     // פעולות (Create, Update, Get, etc.)
│       ├── descriptions/                // Field descriptions
│       │   ├── BoardDescription.ts
│       │   ├── ItemDescription.ts
│       │   └── ColumnDescription.ts
│       ├── methods/                     // Load options methods
│       │   ├── loadBoards.ts
│       │   ├── loadColumns.ts
│       │   ├── loadColumnValues.ts
│       │   └── loadLinkedItems.ts
│       ├── utils/
│       │   ├── cache.ts                 // מנגנון קאש
│       │   ├── columnMapper.ts          // מיפוי סוגי עמודות
│       │   ├── apiClient.ts             // Monday API client
│       │   ├── queryBuilder.ts          // בניית queries
│       │   └── validators.ts            // ולידציות
│       └── types/
│           ├── Monday.types.ts
│           └── Column.types.ts
├── credentials/
│   └── MondayApi.credentials.ts
└── package.json
```

### 9.2 דוגמת קוד - Column Mapper

```typescript
// utils/columnMapper.ts

import { INodePropertyOptions } from 'n8n-workflow';
import { ColumnDefinition, ColumnValue } from '../types/Column.types';

export class ColumnMapper {
  
  /**
   * ממיר עמודה למבנה UI של n8n
   */
  static mapColumnToUIField(column: ColumnDefinition): INodeProperties {
    const baseField = {
      displayName: column.title,
      name: `column_${column.id}`,
      type: this.getFieldType(column.type),
      displayOptions: {
        show: {
          columnInputMode: ['simple'],
        },
      },
    };

    switch (column.type) {
      case 'status':
        return {
          ...baseField,
          type: 'options',
          options: this.parseStatusOptions(column.settings_str),
        };

      case 'board_relation':
        return {
          ...baseField,
          type: 'multiOptions',
          typeOptions: {
            loadOptionsMethod: 'loadLinkedBoardItems',
            loadOptionsParams: {
              boardIds: JSON.parse(column.settings_str).board_ids,
            },
          },
        };

      case 'people':
        return {
          ...baseField,
          type: 'multiOptions',
          typeOptions: {
            loadOptionsMethod: 'loadUsers',
          },
        };

      case 'date':
        return {
          ...baseField,
          type: 'dateTime',
        };

      case 'timeline':
        return [
          {
            ...baseField,
            displayName: `${column.title} - From`,
            name: `${baseField.name}_from`,
            type: 'dateTime',
          },
          {
            ...baseField,
            displayName: `${column.title} - To`,
            name: `${baseField.name}_to`,
            type: 'dateTime',
          },
        ];

      default:
        return baseField;
    }
  }

  /**
   * ממיר ערך UI למבנה Monday API
   */
  static mapValueToMondayFormat(
    columnType: string,
    value: any,
    settings?: string
  ): ColumnValue {
    switch (columnType) {
      case 'status':
        return { label: value };

      case 'board_relation':
        const ids = Array.isArray(value) ? value : [value];
        return {
          linkedPulseIds: ids.map(id => ({ linkedPulseId: id })),
        };

      case 'people':
        return {
          personsAndTeams: value.map((id: string) => ({
            id,
            kind: id.startsWith('team_') ? 'team' : 'person',
          })),
        };

      case 'timeline':
        return {
          from: value.from,
          to: value.to,
        };

      case 'checkbox':
        return { checked: value };

      case 'numbers':
        return parseFloat(value);

      default:
        return value;
    }
  }

  private static parseStatusOptions(settingsStr: string): INodePropertyOptions[] {
    const settings = JSON.parse(settingsStr);
    return Object.entries(settings.labels).map(([index, label]) => ({
      name: label as string,
      value: index,
    }));
  }

  private static getFieldType(columnType: string): NodePropertyTypes {
    const typeMap: Record<string, NodePropertyTypes> = {
      status: 'options',
      dropdown: 'options',
      people: 'multiOptions',
      board_relation: 'multiOptions',
      date: 'dateTime',
      text: 'string',
      long_text: 'string',
      numbers: 'number',
      checkbox: 'boolean',
      email: 'string',
      phone: 'string',
      link: 'string',
      // ...
    };
    return typeMap[columnType] || 'string';
  }
}
```

### 9.3 דוגמת קוד - Cache Manager

```typescript
// utils/cache.ts

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheManager {
  private static cache = new Map<string, CacheEntry<any>>();
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 דקות

  static set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  static invalidate(pattern: string): void {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  static clear(): void {
    this.cache.clear();
  }

  // Cache keys
  static boardKey(boardId: string): string {
    return `board:${boardId}`;
  }

  static columnsKey(boardId: string): string {
    return `columns:${boardId}`;
  }

  static linkedItemsKey(boardId: string): string {
    return `linked_items:${boardId}`;
  }
}
```

### 9.4 דוגמת קוד - Load Options Method

```typescript
// methods/loadColumnValues.ts

import { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { MondayApiClient } from '../utils/apiClient';
import { CacheManager } from '../utils/cache';

export async function loadStatusValues(
  this: ILoadOptionsFunctions,
  columnId: string
): Promise<INodePropertyOptions[]> {
  const boardId = this.getNodeParameter('board') as string;
  const cacheKey = `status_values:${boardId}:${columnId}`;
  
  // בדיקת קאש
  const cached = CacheManager.get<INodePropertyOptions[]>(cacheKey);
  if (cached) return cached;
  
  // שליפה מ-API
  const credentials = await this.getCredentials('mondayApi');
  const client = new MondayApiClient(credentials.apiToken as string);
  
  const board = await client.getBoard(boardId);
  const column = board.columns.find(col => col.id === columnId);
  
  if (!column) return [];
  
  const settings = JSON.parse(column.settings_str);
  const options = Object.entries(settings.labels).map(([index, label]) => ({
    name: label as string,
    value: index,
  }));
  
  // שמירה בקאש
  CacheManager.set(cacheKey, options);
  
  return options;
}

export async function loadLinkedBoardItems(
  this: ILoadOptionsFunctions
): Promise<INodePropertyOptions[]> {
  const boardId = this.getNodeParameter('board') as string;
  const columnId = this.getCurrentNodeParameter('column') as string;
  
  const cacheKey = `linked_items:${boardId}:${columnId}`;
  const cached = CacheManager.get<INodePropertyOptions[]>(cacheKey);
  if (cached) return cached;
  
  const credentials = await this.getCredentials('mondayApi');
  const client = new MondayApiClient(credentials.apiToken as string);
  
  // שליפת הגדרות העמודה
  const board = await client.getBoard(boardId);
  const column = board.columns.find(col => col.id === columnId);
  
  if (!column || column.type !== 'board_relation') return [];
  
  const settings = JSON.parse(column.settings_str);
  const linkedBoardIds = settings.board_ids;
  
  // שליפת items מהבורדים המקושרים
  const items = await client.getItemsFromBoards(linkedBoardIds);
  
  const options = items.map(item => ({
    name: `${item.name} (#${item.id})`,
    value: item.id,
  }));
  
  CacheManager.set(cacheKey, options, 2 * 60 * 1000); // 2 דקות
  
  return options;
}
```

---

## 10. תהליך פיתוח מוצע

### Phase 1: תשתית (שבועיים)
- [ ] הקמת מבנה הפרויקט
- [ ] מימוש CacheManager
- [ ] מימוש MondayApiClient עם GraphQL
- [ ] מימוש ColumnMapper בסיסי
- [ ] הוספת שדה "Column Input Mode"

### Phase 2: Simple Mode - עמודות בסיסיות (3 שבועות)
- [ ] תמיכה ב-Status columns
- [ ] תמיכה ב-Text/Numbers/Date
- [ ] תמיכה ב-Dropdown
- [ ] תמיכה ב-People
- [ ] Load options methods
- [ ] בדיקות ותיקוף

### Phase 3: עמודות מתקדמות (שבועיים)
- [ ] Board Relation (קריטי!)
- [ ] Timeline
- [ ] Tags
- [ ] Dependency
- [ ] File upload

### Phase 4: Query Builder (שבוע)
- [ ] UI לבניית queries
- [ ] לוגיקת AND/OR
- [ ] המרה ל-Monday API
- [ ] Post-processing filters

### Phase 5: אופטימיזציה ו-Polish (שבוע)
- [ ] בדיקות ביצועים
- [ ] תיעוד מלא
- [ ] דוגמאות שימוש
- [ ] Migration guide למשתמשים קיימים

---

## 11. שיקולים נוספים

### 11.1 Rate Limiting
Monday API מוגבל ל:
- **API calls**: 1,000 queries לדקה
- **Complexity**: כל query יש לו "cost"

**פתרון:**
- Request batching
- Debouncing על load options
- הצגת loading states

### 11.2 Error Handling

```typescript
try {
  const data = await client.getBoard(boardId);
} catch (error) {
  if (error.code === 'RATE_LIMITED') {
    throw new Error('Monday API rate limit reached. Please wait and try again.');
  }
  if (error.code === 'INVALID_BOARD') {
    throw new Error(`Board ${boardId} not found or you don't have access.`);
  }
  throw error;
}
```

### 11.3 ביצועים

**אסטרטגיות:**
- Lazy loading של linked items (רק כש-dropdown נפתח)
- Pagination לבורדים גדולים
- Virtual scrolling ב-dropdowns
- Debounce על search fields

### 11.4 Accessibility
- Labels ברורים לכל שדה
- Keyboard navigation
- Screen reader support
- Error messages מפורטים

---

## 12. דוגמת שימוש מלאה

### תרחיש: עדכון task במערכת ניהול פרויקטים

**Input (Simple Mode):**
```
Board: "Marketing Campaigns"
Item: "Q4 Social Media Campaign"

Columns:
  - Status: "In Progress"
  - Assigned To: ["John Doe", "Sarah Smith"]
  - Related Tasks (Board Relation): 
      Board: "Content Creation"
      Items: ["Blog Post #1", "Video Script #2"]
  - Due Date: 2025-10-30
  - Priority: "High"
  - Budget: 15000
```

**Output (Monday API format):**
```json
{
  "query": "mutation { change_multiple_column_values(...) }",
  "variables": {
    "board_id": 123456,
    "item_id": 789012,
    "column_values": {
      "status": {
        "label": "In Progress"
      },
      "people": {
        "personsAndTeams": [
          {"id": "12345", "kind": "person"},
          {"id": "67890", "kind": "person"}
        ]
      },
      "board_relation": {
        "linkedPulseIds": [
          {"linkedPulseId": 111111},
          {"linkedPulseId": 222222}
        ]
      },
      "date4": {
        "date": "2025-10-30"
      },
      "status5": {
        "label": "High"
      },
      "numbers": 15000
    }
  }
}
```

---

## 13. מדדי הצלחה (Success Metrics)

1. **Adoption Rate**: 60%+ של משתמשי הנוד עוברים ל-Simple Mode תוך 3 חודשים
2. **Error Reduction**: 80% פחות שגיאות ב-JSON formatting
3. **Time to Configure**: 50% הפחתה בזמן הגדרת נוד
4. **API Calls**: לא יותר מ-5 calls נוספים לעומת המצב הנוכחי (בזכות קאש)
5. **User Satisfaction**: 8/10+ ב-feedback surveys

---

## 14. סיכום והמליצות

### מה יושג?
✅ **UX משופר דרמטית** - אין יותר צורך בכתיבת JSON ידנית  
✅ **פחות שגיאות** - ולידציה אוטומטית לפי סוג העמודה  
✅ **גמישות מקסימלית** - תמיכה בכל סוגי העמודות כולל board relations  
✅ **תאימות לאחור** - משתמשים קיימים לא מושפעים  
✅ **Query מתקדם** - בניית סינונים מורכבים  
✅ **ביצועים טובים** - קאש חכם מפחית עומס על API  

### המלצות יישום
1. **התחל ב-Phase 1-2** - תשתית + עמודות בסיסיות
2. **בדיקות עם Beta Users** - לפני Phase 3
3. **תיעוד מקיף** - הכרחי להצלחה
4. **Migration Guide** - עזרה למשתמשים קיימים

**זמן פיתוח משוער**: 8-10 שבועות  
**מורכבות**: בינונית-גבוהה  
**ROI**: גבוה מאוד - חיסכון זמן משמעותי למשתמשים

# תוספת לאפיון: נוד לקריאת פורמולות + ניהול גרסאות API

---

## 15. ניהול גרסאות Monday API

### 15.1 בעיה נוכחית

```typescript
// קוד נוכחי ב-n8n Monday nodes
const API_VERSION = '2023-10';  // ❌ גרסה ישנה

// בעיות:
// 1. Formula columns דורשים API version 2024-01 ומעלה
// 2. Features חדשים לא זמינים
// 3. Deprecated endpoints
```

### 15.2 פתרון מוצע: Dynamic API Versioning

#### אסטרטגיה מומלצת ✅

**אל תשנה את ברירת המחדל גלובלית** - זה עלול לשבור workflow קיימים!

במקום זה:
1. **שמור 2023-10 כברירת מחדל** למשתמשים קיימים
2. **הוסף שדה בחירה** לגרסת API
3. **Auto-detect** - אם פעולה דורשת גרסה חדשה, השתמש בה אוטומטית
4. **הצג אזהרה** למשתמשים שמשתמשים בגרסה ישנה

```typescript
interface MondayApiVersionConfig {
  version: string;
  autoDetect: boolean;  // ברירת מחדל: true
  features: string[];   // Features זמינים בגרסה זו
}

const API_VERSIONS: Record<string, MondayApiVersionConfig> = {
  '2023-10': {
    version: '2023-10',
    autoDetect: false,
    features: ['basic', 'items', 'boards', 'updates']
  },
  '2024-01': {
    version: '2024-01',
    autoDetect: true,
    features: ['basic', 'items', 'boards', 'updates', 'formula_read']
  },
  '2024-04': {
    version: '2024-04',
    autoDetect: true,
    features: ['basic', 'items', 'boards', 'updates', 'formula_read', 'formula_write']
  },
  '2025-07': {  // הגרסה הנוכחית העדכנית ביותר
    version: '2025-07',
    autoDetect: true,
    features: ['basic', 'items', 'boards', 'updates', 'formula_read', 'formula_write', 'advanced_permissions']
  }
};
```

---

## 16. UI לבחירת גרסת API

### 16.1 הוספת שדה Version Selector

```typescript
// בתיאור הנוד
{
  displayName: 'API Version',
  name: 'apiVersion',
  type: 'options',
  default: '2023-10',  // ✅ שמירה על תאימות לאחור
  description: 'Monday.com API version to use. Some features require newer versions.',
  options: [
    {
      name: '2023-10 (Legacy - Current Default)',
      value: '2023-10',
      description: 'Original version - compatible with existing workflows'
    },
    {
      name: '2024-01 (Formula Support)',
      value: '2024-01',
      description: 'Required for reading formula columns'
    },
    {
      name: '2024-04 (Formula Write)',
      value: '2024-04',
      description: 'Supports creating and updating formula columns'
    },
    {
      name: '2025-07 (Latest - Recommended)',
      value: '2025-07',
      description: 'Latest stable version with all features'
    }
  ],
  displayOptions: {
    show: {
      // הצג תמיד, או רק במצב Advanced
    }
  }
}
```

### 16.2 Auto-Detection Logic

```typescript
// utils/apiVersionManager.ts

export class ApiVersionManager {
  
  /**
   * בודק אם פעולה דורשת גרסת API מינימלית
   */
  static getRequiredVersion(operation: string, columnType?: string): string {
    const requirements: Record<string, string> = {
      'readFormula': '2024-01',
      'writeFormula': '2024-04',
      'formula': '2024-01',  // column type
      'advancedPermissions': '2025-07'
    };
    
    return requirements[operation] || requirements[columnType || ''] || '2023-10';
  }
  
  /**
   * ממליץ על גרסה או משדרג אוטומטית
   */
  static async validateAndUpgrade(
    requestedVersion: string,
    operation: string,
    columnType?: string,
    autoUpgrade: boolean = true
  ): Promise<{version: string, upgraded: boolean, warning?: string}> {
    
    const requiredVersion = this.getRequiredVersion(operation, columnType);
    
    // אם הגרסה המבוקשת מספיקה
    if (this.compareVersions(requestedVersion, requiredVersion) >= 0) {
      return { version: requestedVersion, upgraded: false };
    }
    
    // אם auto-upgrade מופעל
    if (autoUpgrade) {
      return {
        version: requiredVersion,
        upgraded: true,
        warning: `Auto-upgraded API version from ${requestedVersion} to ${requiredVersion} for operation '${operation}'`
      };
    }
    
    // אחרת - זרוק שגיאה
    throw new Error(
      `Operation '${operation}' requires API version ${requiredVersion} or higher. ` +
      `Current version: ${requestedVersion}. Please update the API Version setting.`
    );
  }
  
  /**
   * משווה גרסאות (מחזיר: 1 אם v1 > v2, -1 אם v1 < v2, 0 אם שווים)
   */
  static compareVersions(v1: string, v2: string): number {
    const [year1, month1] = v1.split('-').map(Number);
    const [year2, month2] = v2.split('-').map(Number);
    
    if (year1 !== year2) return year1 > year2 ? 1 : -1;
    if (month1 !== month2) return month1 > month2 ? 1 : -1;
    return 0;
  }
}
```

### 16.3 שימוש ב-API Client

```typescript
// utils/apiClient.ts

export class MondayApiClient {
  private apiVersion: string;
  private baseUrl = 'https://api.monday.com/v2';
  
  constructor(
    private apiToken: string,
    requestedVersion: string = '2023-10',
    private autoUpgrade: boolean = true
  ) {
    this.apiVersion = requestedVersion;
  }
  
  async executeQuery(
    query: string,
    variables?: any,
    operation?: string,
    columnType?: string
  ): Promise<any> {
    
    // ✅ Auto-detection: שדרג גרסה אם נדרש
    const versionCheck = await ApiVersionManager.validateAndUpgrade(
      this.apiVersion,
      operation || 'default',
      columnType,
      this.autoUpgrade
    );
    
    const effectiveVersion = versionCheck.version;
    
    // הצג אזהרה אם בוצע שדרוג
    if (versionCheck.upgraded && versionCheck.warning) {
      console.warn(versionCheck.warning);
      // אופציונלי: שלח notification למשתמש ב-n8n
    }
    
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.apiToken,
        'API-Version': effectiveVersion  // ✅ גרסה דינמית
      },
      body: JSON.stringify({ query, variables })
    });
    
    return response.json();
  }
  
  // ... שאר המתודות
}
```

---

## 17. נוד חדש: Read Formula Columns

### 17.1 מטרת הנוד

קריאת ערכים מחושבים של עמודות פורמולה במאנדי, הדורשות **API version 2024-01** ומעלה.

### 17.2 דוגמת שימוש

```graphql
query {
  items(ids: [123456]) {
    id
    name
    column_values(ids: ["formula_column_id"]) {
      id
      text      # ✅ עובד ב-2023-10
      value     # ✅ עובד ב-2024-01+ - מחזיר את הערך המחושב
      type
    }
  }
}
```

**התשובה:**
```json
{
  "data": {
    "items": [{
      "id": "123456",
      "name": "Task #1",
      "column_values": [{
        "id": "formula_revenue",
        "text": "$15,000",      // כטקסט מעוצב
        "value": "15000",       // כמספר גולמי
        "type": "formula"
      }]
    }]
  }
}
```

### 17.3 מבנה הנוד

```typescript
// nodes/Monday/actions/readFormula/ReadFormula.operation.ts

import { INodeProperties } from 'n8n-workflow';

export const readFormulaOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['item'],
      },
    },
    options: [
      // ... פעולות קיימות
      {
        name: 'Read Formula Columns',
        value: 'readFormula',
        description: 'Read calculated values from formula columns (requires API 2024-01+)',
        action: 'Read formula columns',
      },
    ],
    default: 'get',
  },
];

export const readFormulaFields: INodeProperties[] = [
  // ======== Board Selection ========
  {
    displayName: 'Board',
    name: 'boardId',
    type: 'options',
    typeOptions: {
      loadOptionsMethod: 'loadBoards',
    },
    required: true,
    displayOptions: {
      show: {
        resource: ['item'],
        operation: ['readFormula'],
      },
    },
    default: '',
    description: 'The board to read items from',
  },
  
  // ======== Item Selection ========
  {
    displayName: 'Item Selection',
    name: 'itemSelection',
    type: 'options',
    displayOptions: {
      show: {
        resource: ['item'],
        operation: ['readFormula'],
      },
    },
    options: [
      {
        name: 'By ID',
        value: 'id',
      },
      {
        name: 'By Name',
        value: 'name',
      },
      {
        name: 'All Items',
        value: 'all',
      },
      {
        name: 'By Query',
        value: 'query',
      },
    ],
    default: 'id',
  },
  
  // Item ID(s)
  {
    displayName: 'Item ID(s)',
    name: 'itemIds',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['item'],
        operation: ['readFormula'],
        itemSelection: ['id'],
      },
    },
    default: '',
    placeholder: '123456 or 123456,789012',
    description: 'Single item ID or comma-separated list of IDs',
  },
  
  // ======== Formula Columns Selection ========
  {
    displayName: 'Formula Columns',
    name: 'formulaColumns',
    type: 'multiOptions',
    typeOptions: {
      loadOptionsMethod: 'loadFormulaColumns',
      loadOptionsDependsOn: ['boardId'],
    },
    displayOptions: {
      show: {
        resource: ['item'],
        operation: ['readFormula'],
      },
    },
    default: [],
    description: 'Select which formula columns to read. Leave empty to read all formula columns.',
  },
  
  // ======== Output Format ========
  {
    displayName: 'Output Format',
    name: 'outputFormat',
    type: 'options',
    displayOptions: {
      show: {
        resource: ['item'],
        operation: ['readFormula'],
      },
    },
    options: [
      {
        name: 'Calculated Value',
        value: 'value',
        description: 'Return the raw calculated value (number, date, etc.)',
      },
      {
        name: 'Formatted Text',
        value: 'text',
        description: 'Return the formatted text as displayed in Monday',
      },
      {
        name: 'Both',
        value: 'both',
        description: 'Return both value and text',
      },
    ],
    default: 'value',
  },
  
  // ======== Additional Options ========
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['item'],
        operation: ['readFormula'],
      },
    },
    options: [
      {
        displayName: 'Include Item Name',
        name: 'includeItemName',
        type: 'boolean',
        default: true,
        description: 'Whether to include the item name in the output',
      },
      {
        displayName: 'Include Other Columns',
        name: 'includeOtherColumns',
        type: 'multiOptions',
        typeOptions: {
          loadOptionsMethod: 'loadNonFormulaColumns',
          loadOptionsDependsOn: ['boardId'],
        },
        default: [],
        description: 'Include additional non-formula columns in the output',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 50,
        description: 'Maximum number of items to return',
      },
    ],
  },
];
```

### 17.4 Load Options Methods

```typescript
// methods/loadFormulaColumns.ts

export async function loadFormulaColumns(
  this: ILoadOptionsFunctions
): Promise<INodePropertyOptions[]> {
  
  const boardId = this.getNodeParameter('boardId') as string;
  const credentials = await this.getCredentials('mondayApi');
  
  // ✅ Force API version 2024-01 for formula support
  const client = new MondayApiClient(
    credentials.apiToken as string,
    '2024-01',
    true  // auto-upgrade enabled
  );
  
  const query = `
    query GetFormulaColumns($boardId: ID!) {
      boards(ids: [$boardId]) {
        columns {
          id
          title
          type
          settings_str
        }
      }
    }
  `;
  
  const response = await client.executeQuery(
    query,
    { boardId },
    'readFormula',
    'formula'
  );
  
  const columns = response.data.boards[0].columns;
  
  // סינון רק עמודות פורמולה
  const formulaColumns = columns.filter((col: any) => col.type === 'formula');
  
  return formulaColumns.map((col: any) => ({
    name: col.title,
    value: col.id,
    description: this.parseFormulaDescription(col.settings_str),
  }));
}

function parseFormulaDescription(settingsStr: string): string {
  try {
    const settings = JSON.parse(settingsStr);
    return settings.formula || 'Formula column';
  } catch {
    return 'Formula column';
  }
}
```

### 17.5 Execute Method

```typescript
// actions/readFormula/execute.ts

export async function executeReadFormula(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  
  const boardId = this.getNodeParameter('boardId', index) as string;
  const itemSelection = this.getNodeParameter('itemSelection', index) as string;
  const formulaColumns = this.getNodeParameter('formulaColumns', index, []) as string[];
  const outputFormat = this.getNodeParameter('outputFormat', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as any;
  
  const credentials = await this.getCredentials('mondayApi');
  
  // ✅ Auto-detect: אם יש עמודות פורמולה, שדרג ל-2024-01
  const apiVersion = formulaColumns.length > 0 ? '2024-01' : '2023-10';
  
  const client = new MondayApiClient(
    credentials.apiToken as string,
    apiVersion,
    true  // auto-upgrade
  );
  
  // בניית query
  let itemsFilter = '';
  
  switch (itemSelection) {
    case 'id':
      const itemIds = (this.getNodeParameter('itemIds', index) as string)
        .split(',')
        .map(id => id.trim());
      itemsFilter = `ids: [${itemIds.join(',')}]`;
      break;
      
    case 'all':
      itemsFilter = `ids: []`;  // יחזיר את כל הפריטים
      break;
      
    // ... מקרים נוספים
  }
  
  // רשימת עמודות לשליפה
  const columnIds = formulaColumns.length > 0
    ? formulaColumns
    : await this.getAllFormulaColumnIds(boardId, client);
  
  const query = `
    query GetFormulaValues($boardId: ID!, $columnIds: [String!]) {
      boards(ids: [$boardId]) {
        items(${itemsFilter}, limit: ${additionalFields.limit || 50}) {
          id
          ${additionalFields.includeItemName ? 'name' : ''}
          column_values(ids: $columnIds) {
            id
            title
            type
            ${outputFormat === 'value' || outputFormat === 'both' ? 'value' : ''}
            ${outputFormat === 'text' || outputFormat === 'both' ? 'text' : ''}
          }
        }
      }
    }
  `;
  
  const response = await client.executeQuery(
    query,
    { boardId, columnIds },
    'readFormula',
    'formula'
  );
  
  // עיבוד התוצאות
  const items = response.data.boards[0].items;
  
  return items.map((item: any) => ({
    json: this.formatFormulaOutput(item, outputFormat, additionalFields),
  }));
}

function formatFormulaOutput(
  item: any,
  outputFormat: string,
  additionalFields: any
): any {
  
  const output: any = {
    item_id: item.id,
  };
  
  if (additionalFields.includeItemName) {
    output.item_name = item.name;
  }
  
  // המרת עמודות לאובייקט נוח
  item.column_values.forEach((col: any) => {
    const key = col.title.replace(/\s+/g, '_').toLowerCase();
    
    switch (outputFormat) {
      case 'value':
        output[key] = this.parseFormulaValue(col.value, col.type);
        break;
        
      case 'text':
        output[key] = col.text;
        break;
        
      case 'both':
        output[key] = {
          value: this.parseFormulaValue(col.value, col.type),
          text: col.text,
        };
        break;
    }
  });
  
  return output;
}

function parseFormulaValue(value: string, type: string): any {
  if (!value) return null;
  
  try {
    const parsed = JSON.parse(value);
    
    // פורמולות יכולות להחזיר מספרים, תאריכים, טקסט...
    if (typeof parsed === 'number') return parsed;
    if (typeof parsed === 'boolean') return parsed;
    
    // עבור תאריכים
    if (parsed.date) return parsed.date;
    
    return parsed;
  } catch {
    // אם לא JSON, החזר כמו שזה
    return value;
  }
}
```

---

## 18. אזהרות ו-Notifications למשתמש

### 18.1 Warning Banner

כאשר משתמש בוחר בפעולה שדורשת גרסה חדשה:

```typescript
{
  displayName: 'Notice',
  name: 'formulaNotice',
  type: 'notice',
  default: '',
  displayOptions: {
    show: {
      resource: ['item'],
      operation: ['readFormula'],
    },
  },
  typeOptions: {
    theme: 'warning',
  },
  description: `
    ⚠️ Reading formula columns requires API version 2024-01 or higher.
    
    Your current API version will be automatically upgraded for this operation.
    
    To manually set the API version, use the "API Version" field in the node settings.
  `,
}
```

### 18.2 Runtime Warning

```typescript
// במהלך ביצוע
if (versionCheck.upgraded) {
  this.logger.warn(
    `API version automatically upgraded from ${this.apiVersion} to ${versionCheck.version} ` +
    `for operation '${operation}'. Consider updating the default API version setting.`
  );
  
  // אופציה: שליחת notification למשתמש
  // (תלוי ביכולות של n8n)
}
```

---

## 19. Migration Guide למשתמשים

### 19.1 תיעוד למשתמשים קיימים

```markdown
# Monday.com API Version Update Guide

## What's Changed?

The Monday.com nodes now support **API version 2025-07** (latest) with new features:
- ✅ Read formula column values
- ✅ Advanced permissions
- ✅ Better error handling
- ✅ Performance improvements

## Will This Break My Workflows?

**NO!** Your existing workflows will continue to work exactly as before.

### Default Behavior:
- **Existing workflows**: Continue using API version `2023-10` (no changes)
- **New workflows**: Use API version `2023-10` by default (for consistency)
- **Auto-upgrade**: When you use features that require a newer version (like formula columns), the API version will automatically upgrade for that specific operation

## How to Upgrade (Optional)

If you want to use the latest API version for all operations:

1. Open your Monday.com node
2. Find the **API Version** field
3. Select `2025-07 (Latest - Recommended)`
4. Save your workflow

### When Should I Upgrade?

Upgrade if you need:
- Formula column support
- Latest Monday.com features
- Best performance

### When Should I Stay on 2023-10?

Stay on the old version if:
- Your workflows work perfectly
- You haven't tested with the new version
- You use custom JSON that might be version-specific

## Feature Compatibility Matrix

| Feature | 2023-10 | 2024-01 | 2024-04 | 2025-07 |
|---------|---------|---------|---------|---------|
| Basic CRUD | ✅ | ✅ | ✅ | ✅ |
| Read Formulas | ❌ | ✅ | ✅ | ✅ |
| Write Formulas | ❌ | ❌ | ✅ | ✅ |
| Advanced Permissions | ❌ | ❌ | ❌ | ✅ |

## Need Help?

Check the [Monday API Changelog](https://developer.monday.com/api-reference/changelog) for detailed version differences.
```

---

## 20. סיכום עדכונים לאפיון

### ✅ מה הוספנו?

1. **ניהול גרסאות דינמי**
   - שדה בחירת גרסת API
   - Auto-detection ושדרוג אוטומטי
   - תאימות לאחור מלאה (ברירת מחדל: 2023-10)

2. **נוד חדש: Read Formula Columns**
   - קריאת ערכים מחושבים
   - תמיכה בפורמטים שונים (value/text/both)
   - סינון לפי בורד ופריט
   - Load options לעמודות פורמולה

3. **מערכת אזהרות**
   - Warning banners ב-UI
   - Runtime logging
   - Migration guide למשתמשים

### 🎯 המלצה סופית

**אל תשנה את ברירת המחדל הגלובלית!**

במקום זה:
- ✅ השאר `2023-10` כברירת מחדל
- ✅ השתמש ב-auto-detection לשדרוג דינמי
- ✅ אפשר למשתמשים לבחור גרסה ידנית
- ✅ הצג אזהרות כשצריך גרסה חדשה

**יתרונות הגישה:**
- 🔒 אפס שבירה של workflows קיימים
- 🚀 גישה לfeatures חדשים
- 🔄 גמישות מקסימלית
- 📊 שקיפות מלאה למשתמש

---

### 📋 עדכונים נדרשים לקבצים קיימים

```typescript
// credentials/MondayApi.credentials.ts
// הוסף:
{
  displayName: 'API Version (Optional)',
  name: 'apiVersion',
  type: 'options',
  default: '2023-10',
  options: [/* כמו למעלה */]
}

// utils/apiClient.ts
// עדכן constructor:
constructor(
  apiToken: string,
  apiVersion: string = '2023-10',
  autoUpgrade: boolean = true
)

// כל קריאה ל-executeQuery:
await client.executeQuery(
  query,
  variables,
  'operationName',  // ✅ הוסף
  'columnType'      // ✅ הוסף אם רלוונטי
)
```

