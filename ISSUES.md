# Open Issues for Monday.com n8n Node

> **Created:** October 7, 2025
> **Version:** v3.1.0
> **Status:** Alpha - Active Development

---

## 🔴 Critical Issues

### Issue #1: Dynamic dropdown values don't load automatically on first click

**Priority:** P0 - Critical
**Status:** 🔴 Open
**Affects:** v3.0.0 - v3.1.0
**Reporter:** User Feedback

#### Problem Description

When using Column by Column mode, dropdown value fields show "No data" when first opened. Users need to manually refresh (click refresh icon or reload workflow) to see the options.

**User Experience Impact:**
- Confusing UX - users don't know why values aren't showing
- Requires manual intervention (clicking refresh)
- Not intuitive - should load automatically when dropdown opens
- Breaks the "click and select" workflow

**Current Behavior:**
1. User selects a board
2. User adds a Status Column (or Dropdown, Board Relation)
3. User selects the column name
4. User clicks on Value dropdown → **Shows "No data"**
5. User must click refresh icon (↻) → Then values appear

**Expected Behavior:**
1. User selects a board
2. User adds a Status Column
3. User selects the column name
4. User clicks on Value dropdown → **Values load automatically**

#### Technical Analysis

**Root Cause:**
n8n's `loadOptionsMethod` is **not automatically triggered** when `loadOptionsDependsOn` changes. It only executes when:
1. User manually opens the dropdown
2. User clicks refresh
3. Workflow is reloaded

**Current Implementation:**
```typescript
// ColumnFields.ts
{
  displayName: 'Value',
  name: 'value',
  type: 'options',
  typeOptions: {
    loadOptionsMethod: 'loadStatusValuesForSelectedColumn',
    loadOptionsDependsOn: ['column'], // ❌ Doesn't auto-trigger
  },
  // ...
}
```

**Problem:** n8n doesn't call `loadStatusValuesForSelectedColumn` when `column` changes.

#### Attempted Solutions (Failed)

1. ✅ **Removed caching** (v3.1.0) - Ensures fresh data, but doesn't fix auto-loading
2. ❌ **Multiple fallback methods** - Tried `getNodeParameter`, `getCurrentNodeParameter`, array access - none trigger automatically
3. ❌ **Changed loadOptionsDependsOn** - n8n still doesn't auto-trigger

#### Proposed Solution for v3.2.0

**Option A: Pre-load all values when column is selected (Recommended)**

Modify `loadOptions` for the column field to also pre-fetch values:

**Files to modify:**
- `nodes/Monday/methods/loadOptionsMethodsExtended.ts`
- `nodes/Monday/descriptions/ColumnFields.ts`

**Approach:**
1. When `loadStatusColumns` is called, also fetch and cache status values for ALL status columns
2. When user selects a column, values are already cached
3. Value dropdown shows data immediately

**Pseudo-code:**
```typescript
export async function loadStatusColumns(
  this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
  const boardId = this.getCurrentNodeParameter('board') as string;
  const board = await client.getBoard(boardId);
  const statusColumns = board.columns.filter(col => col.type === 'status');

  // NEW: Pre-fetch values for all status columns
  for (const col of statusColumns) {
    const settings = JSON.parse(col.settings_str);
    const values = Object.entries(settings.labels || {});
    // Cache values with special key
    CacheManager.set(`prefetch:status:${boardId}:${col.id}`, values);
  }

  return statusColumns.map(col => ({
    name: col.title,
    value: col.id,
  }));
}

export async function loadStatusValuesForSelectedColumn(
  this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
  // ... existing column ID detection ...

  // NEW: Check prefetch cache first
  const prefetchKey = `prefetch:status:${boardId}:${columnId}`;
  const prefetched = CacheManager.get(prefetchKey);
  if (prefetched) return prefetched; // ✅ Instant load!

  // Fallback: fetch if not prefetched
  // ... existing fetch logic ...
}
```

**Pros:**
- ✅ Values available immediately when dropdown opens
- ✅ Only one API call per board (when loading columns)
- ✅ Works within n8n's limitations
- ✅ Better UX - no manual refresh needed

**Cons:**
- ⚠️ Slightly slower column list loading (fetches all values upfront)
- ⚠️ More memory usage (caches all column values)

---

**Option B: Add refresh button/notice (Workaround)**

Add a visible button or instruction near each value field.

**Files to modify:**
- `nodes/Monday/descriptions/ColumnFields.ts`

**Approach:**
Add a notice field before each value dropdown:

```typescript
{
  displayName: 'ℹ️ Click to Load Values',
  name: 'statusValueNotice',
  type: 'notice',
  default: '',
  description: 'Open the dropdown below and click refresh (↻) to load status values',
}
```

**Pros:**
- ✅ Quick fix, minimal code changes
- ✅ Helps users understand what to do

**Cons:**
- ❌ Doesn't fix the underlying issue
- ❌ Poor UX - users still need manual action
- ❌ Not a real solution

---

#### Recommended Implementation Plan

**Phase 1: Quick Fix (v3.1.1 - Hotfix)**
- Add clear notices explaining the refresh requirement
- Update hints to guide users
- **ETA:** Immediate (can ship today)

**Phase 2: Real Fix (v3.2.0 - Feature Release)**
- Implement Option A (pre-loading)
- Apply to all value loaders:
  - `loadStatusValuesForSelectedColumn`
  - `loadDropdownValuesForSelectedColumn`
  - `loadLinkedBoardItemsForSelectedColumn`
- Comprehensive testing
- **ETA:** 1-2 weeks

#### Files Affected

**For Quick Fix (v3.1.1):**
- `nodes/Monday/descriptions/ColumnFields.ts` - Add notices
- `nodes/Monday/descriptions/ItemDescription.ts` - Update main notice
- `README.md` - Update known issues section

**For Real Fix (v3.2.0):**
- `nodes/Monday/methods/loadOptionsMethodsExtended.ts` - Add pre-loading logic to:
  - `loadStatusColumns()` - lines ~150-180
  - `loadDropdownColumns()` - lines ~180-210
  - `loadBoardRelationColumns()` - lines ~220-250
  - `loadStatusValuesForSelectedColumn()` - lines ~330-390
  - `loadDropdownValuesForSelectedColumn()` - lines ~390-460
  - `loadLinkedBoardItemsForSelectedColumn()` - lines ~460-530
- `nodes/Monday/utils/cache.ts` - Add `prefetch:` key patterns
- `nodes/Monday/descriptions/ColumnFields.ts` - Remove workaround notices

#### Testing Checklist

- [ ] Status Column: Select column → Open value dropdown → Verify values appear
- [ ] Dropdown Column: Select column → Open values dropdown → Verify values appear
- [ ] Board Relation: Select column → Open items dropdown → Verify items appear
- [ ] Multiple columns: Add 3 status columns → Verify all load correctly
- [ ] Cache invalidation: Change board → Verify old values don't appear
- [ ] Hebrew text: Test with Hebrew board → Verify RTL values display
- [ ] Performance: Load board with 50+ columns → Verify <3s load time

---

## 🟡 Medium Priority Issues

### Issue #2: File upload not supported in Column by Column mode

**Priority:** P1 - High
**Status:** 🟡 Planned
**Affects:** v3.0.0+

#### Problem Description

Users cannot upload files using Column by Column mode. File uploads only work in Advanced (JSON) mode.

**Current Workaround:**
Use Advanced mode with JSON:
```json
{
  "files": {
    "fileUrls": [
      {"url": "https://example.com/file.pdf", "name": "document.pdf"}
    ]
  }
}
```

#### Proposed Solution

Add a File Column type in Column by Column mode.

**Files to create/modify:**
- `nodes/Monday/descriptions/ColumnFields.ts` - Add `fileColumn` option

**Implementation:**
```typescript
{
  name: 'fileColumn',
  displayName: 'File Column',
  values: [
    {
      displayName: 'Column',
      name: 'column',
      type: 'options',
      typeOptions: {
        loadOptionsMethod: 'loadFileColumns',
        loadOptionsDependsOn: ['board'],
      },
      default: '',
      description: 'The file column to update',
    },
    {
      displayName: 'File URLs',
      name: 'files',
      type: 'fixedCollection',
      typeOptions: {
        multipleValues: true,
      },
      default: {},
      placeholder: 'Add File',
      options: [
        {
          name: 'file',
          displayName: 'File',
          values: [
            {
              displayName: 'URL',
              name: 'url',
              type: 'string',
              default: '',
              placeholder: 'https://example.com/file.pdf',
              description: 'Public URL of the file',
            },
            {
              displayName: 'Name',
              name: 'name',
              type: 'string',
              default: '',
              placeholder: 'document.pdf',
              description: 'Display name for the file',
            },
          ],
        },
      ],
    },
  ],
}
```

**Additional Requirements:**
- Add `loadFileColumns()` to `loadOptionsMethodsExtended.ts`
- Update `columnByColumnBuild.ts` to handle file column
- Add file upload example to README

---

### Issue #3: Subitems not supported in Column by Column mode

**Priority:** P1 - High
**Status:** 🟡 Planned
**Affects:** v3.0.0+

#### Problem Description

When creating items as subitems, column values from Column by Column mode are not applied.

**Current Behavior:**
- Subitem is created successfully
- Column values are ignored
- User must manually update subitem in separate operation

**Expected Behavior:**
- Subitem created with all column values
- Single operation

#### Technical Challenge

Monday.com API creates subitems differently:
```graphql
mutation {
  create_subitem(
    parent_item_id: PARENT_ID
    item_name: "Subitem Name"
    column_values: "{}"  # ⚠️ May not support all column types
  ) {
    id
  }
}
```

#### Investigation Needed

1. Test which column types work in `create_subitem`
2. Compare with `create_item` column support
3. Document any limitations

**Files to investigate:**
- `nodes/Monday/Monday.node.ts` - Create item logic (lines ~290-320)
- Monday.com API docs - `create_subitem` mutation

---

## 🟢 Low Priority / Enhancement Ideas

### Issue #4: Bulk operations

**Priority:** P2 - Medium
**Status:** 💡 Idea

Add ability to create/update multiple items in one operation.

**Proposed UI:**
- Toggle: "Bulk Mode"
- Input: JSON array or CSV
- Map columns automatically

**Benefits:**
- Faster for large datasets
- Reduced API calls
- Better for migrations

---

### Issue #5: Mirror column support

**Priority:** P3 - Low
**Status:** 💡 Idea

Currently mirror columns are read-only. Consider adding:
- Display mirror columns in Column by Column mode
- Show current values (read-only)
- Help users understand data flow

---

### Issue #6: Better error messages

**Priority:** P2 - Medium
**Status:** 💡 Idea

Enhance error handling with:
- Specific error codes from Monday.com API
- Actionable suggestions
- Link to relevant docs

**Example:**
```
❌ Error: Board Relation column "Customer" shows no items

Possible causes:
1. No boards are connected to this column
   → Solution: Go to Monday.com → Edit column → Add connected board

2. API token doesn't have access to linked board
   → Solution: Check token permissions in Monday.com Admin

3. Linked board is empty
   → Solution: Add items to the connected board first

📖 Read more: https://docs.monday.com/board-relations
```

---

### Issue #7: Formula column creation

**Priority:** P3 - Low
**Status:** 💡 Idea

Currently formula columns are read-only. API 2024-04+ supports creating formulas.

**Research needed:**
- How to validate formula syntax
- UI for formula builder
- Error handling for invalid formulas

---

## 📊 Issue Summary

| Priority | Open | Planned | Ideas | Total |
|----------|------|---------|-------|-------|
| P0 - Critical | 1 | 0 | 0 | 1 |
| P1 - High | 0 | 2 | 0 | 2 |
| P2 - Medium | 0 | 0 | 2 | 2 |
| P3 - Low | 0 | 0 | 2 | 2 |
| **Total** | **1** | **2** | **4** | **7** |

---

## 🗺️ Development Roadmap

### v3.1.1 (Hotfix - This Week)
- 🔧 Issue #1: Add better notices for "No data" workaround
- 📝 Update README with clearer instructions

### v3.2.0 (Next Release - 1-2 Weeks)
- ✅ Issue #1: Implement pre-loading solution
- ✅ Issue #2: Add File Column support
- ✅ Issue #3: Test and document subitem column support
- 📊 Comprehensive testing of all column types

### v3.3.0 (Future)
- ✅ Issue #6: Better error messages
- ✅ Issue #4: Bulk operations (if feasible)

### v4.0.0 (Major - Future)
- Breaking changes if needed
- Complete rewrite of caching system
- Webhooks integration
- Dashboard support

---

## 🤝 Contributing

Want to help fix these issues?

1. Pick an issue from above
2. Comment on the GitHub issue (if not created yet, create one)
3. Fork the repo and create a branch: `fix/issue-1-auto-load-values`
4. Implement the fix following the proposed solution
5. Test thoroughly (use checklist provided)
6. Submit a PR with:
   - Clear description of what was fixed
   - Test results
   - Screenshots if UI changed

---

## 📞 Need Help?

- 🐛 Report new bugs: [GitHub Issues](https://github.com/binesamit/n8n-nodes-mondaycom-simply/issues)
- 💬 Ask questions: amit@bines.co.il
- 📖 Documentation: See [README.md](./README.md)

---

**Last updated:** October 7, 2025
**Maintainer:** Amit Bines (@binesamit)
