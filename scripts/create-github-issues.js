#!/usr/bin/env node

/**
 * Create GitHub Issues from ISSUES.md
 *
 * This script reads the ISSUES.md file and creates GitHub issues automatically.
 *
 * Prerequisites:
 * 1. Install dependencies: npm install @octokit/rest
 * 2. Create a GitHub Personal Access Token:
 *    - Go to: https://github.com/settings/tokens
 *    - Click "Generate new token (classic)"
 *    - Select scopes: repo (all)
 *    - Copy the token
 *
 * Usage:
 *   GITHUB_TOKEN=your_token_here node scripts/create-github-issues.js
 *
 * Or set environment variable first:
 *   export GITHUB_TOKEN=your_token_here  # Linux/Mac
 *   set GITHUB_TOKEN=your_token_here     # Windows CMD
 *   $env:GITHUB_TOKEN="your_token_here"  # Windows PowerShell
 *   node scripts/create-github-issues.js
 */

const { Octokit } = require('@octokit/rest');

// Configuration
const OWNER = 'binesamit';
const REPO = 'n8n-nodes-mondaycom-simply';

// GitHub token from environment variable
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('❌ Error: GITHUB_TOKEN environment variable not set');
  console.error('\nPlease set your GitHub token:');
  console.error('  export GITHUB_TOKEN=your_token_here  # Linux/Mac');
  console.error('  set GITHUB_TOKEN=your_token_here     # Windows CMD');
  console.error('  $env:GITHUB_TOKEN="your_token_here"  # Windows PowerShell');
  console.error('\nCreate a token at: https://github.com/settings/tokens');
  process.exit(1);
}

// Initialize Octokit
const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

// Define all issues to create
const issues = [
  {
    title: '🔴 Critical: Dynamic dropdown values don\'t load automatically on first click',
    body: `## Problem Description

When using Column by Column mode, dropdown value fields show "No data" when first opened. Users need to manually refresh (click refresh icon or reload workflow) to see the options.

### User Experience Impact
- ❌ Confusing UX - users don't know why values aren't showing
- ❌ Requires manual intervention (clicking refresh)
- ❌ Not intuitive - should load automatically when dropdown opens
- ❌ Breaks the "click and select" workflow

### Current Behavior
1. User selects a board
2. User adds a Status Column (or Dropdown, Board Relation)
3. User selects the column name
4. User clicks on Value dropdown → **Shows "No data"**
5. User must click refresh icon (↻) → Then values appear

### Expected Behavior
1. User selects a board
2. User adds a Status Column
3. User selects the column name
4. User clicks on Value dropdown → **Values load automatically** ✅

## Technical Analysis

### Root Cause
n8n's \`loadOptionsMethod\` is **not automatically triggered** when \`loadOptionsDependsOn\` changes. It only executes when:
1. User manually opens the dropdown
2. User clicks refresh
3. Workflow is reloaded

### Current Implementation
\`\`\`typescript
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
\`\`\`

**Problem:** n8n doesn't call \`loadStatusValuesForSelectedColumn\` when \`column\` changes.

## Proposed Solution

### Option A: Pre-load all values when column is selected (Recommended)

Modify \`loadOptions\` for the column field to also pre-fetch values.

**Files to modify:**
- \`nodes/Monday/methods/loadOptionsMethodsExtended.ts\`
- \`nodes/Monday/descriptions/ColumnFields.ts\`

**Approach:**
1. When \`loadStatusColumns\` is called, also fetch and cache status values for ALL status columns
2. When user selects a column, values are already cached
3. Value dropdown shows data immediately

**Implementation example:**
\`\`\`typescript
export async function loadStatusColumns(
  this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
  const boardId = this.getCurrentNodeParameter('board') as string;
  const board = await client.getBoard(boardId);
  const statusColumns = board.columns.filter(col => col.type === 'status');

  // NEW: Pre-fetch values for all status columns
  for (const col of statusColumns) {
    const settings = JSON.parse(col.settings_str);
    const values = Object.entries(settings.labels || {}).map(([index, label]) => ({
      name: label as string,
      value: label as string,
    }));
    // Cache values with special key
    CacheManager.set(\`prefetch:status:\${boardId}:\${col.id}\`, values, 5 * 60 * 1000);
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
  const prefetchKey = \`prefetch:status:\${boardId}:\${columnId}\`;
  const prefetched = CacheManager.get(prefetchKey);
  if (prefetched) return prefetched; // ✅ Instant load!

  // Fallback: fetch if not prefetched
  // ... existing fetch logic ...
}
\`\`\`

**Pros:**
- ✅ Values available immediately when dropdown opens
- ✅ Only one API call per board (when loading columns)
- ✅ Works within n8n's limitations
- ✅ Better UX - no manual refresh needed

**Cons:**
- ⚠️ Slightly slower column list loading (fetches all values upfront)
- ⚠️ More memory usage (caches all column values)

## Implementation Plan

### Phase 1: Quick Fix (v3.1.2 - Hotfix)
- Add clear notices explaining the refresh requirement
- Update hints to guide users
- **ETA:** Immediate

### Phase 2: Real Fix (v3.2.0 - Feature Release)
- Implement pre-loading solution
- Apply to all value loaders:
  - \`loadStatusValuesForSelectedColumn\`
  - \`loadDropdownValuesForSelectedColumn\`
  - \`loadLinkedBoardItemsForSelectedColumn\`
- Comprehensive testing
- **ETA:** 1-2 weeks

## Testing Checklist

- [ ] Status Column: Select column → Open value dropdown → Verify values appear
- [ ] Dropdown Column: Select column → Open values dropdown → Verify values appear
- [ ] Board Relation: Select column → Open items dropdown → Verify items appear
- [ ] Multiple columns: Add 3 status columns → Verify all load correctly
- [ ] Cache invalidation: Change board → Verify old values don't appear
- [ ] Hebrew text: Test with Hebrew board → Verify RTL values display
- [ ] Performance: Load board with 50+ columns → Verify <3s load time

## Affected Versions
- v3.0.0 - v3.1.1

## Related Files
- \`nodes/Monday/methods/loadOptionsMethodsExtended.ts\` (lines 150-530)
- \`nodes/Monday/descriptions/ColumnFields.ts\` (lines 40-142)
- \`nodes/Monday/utils/cache.ts\`

---

See [ISSUES.md](https://github.com/binesamit/n8n-nodes-mondaycom-simply/blob/main/ISSUES.md) for more details.
`,
    labels: ['bug', 'priority: critical', 'UX', 'help wanted'],
    milestone: null,
  },

  {
    title: '📁 Feature: File upload support in Column by Column mode',
    body: `## Problem Description

Users cannot upload files using Column by Column mode. File uploads only work in Advanced (JSON) mode.

### Current Workaround
Use Advanced mode with JSON:
\`\`\`json
{
  "files": {
    "fileUrls": [
      {"url": "https://example.com/file.pdf", "name": "document.pdf"}
    ]
  }
}
\`\`\`

## Proposed Solution

Add a **File Column** type in Column by Column mode.

### Implementation

**File:** \`nodes/Monday/descriptions/ColumnFields.ts\`

\`\`\`typescript
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
\`\`\`

### Additional Changes Needed

1. **Add \`loadFileColumns()\`** to \`nodes/Monday/methods/loadOptionsMethodsExtended.ts\`:
\`\`\`typescript
export async function loadFileColumns(
  this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
  const boardId = this.getCurrentNodeParameter('board') as string;
  if (!boardId) return [];

  const credentials = await this.getCredentials('mondayApi');
  const client = new MondayApiClient(
    credentials.apiToken as string,
    credentials.apiVersion as string || '2023-10',
    credentials.autoUpgrade as boolean ?? true,
  );

  const board = await client.getBoard(boardId);
  const fileColumns = board.columns.filter((col) => col.type === 'file');

  return fileColumns.map((col) => ({
    name: col.title,
    value: col.id,
  }));
}
\`\`\`

2. **Update \`columnByColumnBuild.ts\`** to handle file column:
\`\`\`typescript
// File columns
if (columnData.fileColumn && Array.isArray(columnData.fileColumn)) {
  for (const fileCol of columnData.fileColumn) {
    const columnId = fileCol.column;
    const files = fileCol.files;
    if (columnId && files && files.length > 0) {
      columnValues[columnId] = {
        fileUrls: files.map((file: any) => ({
          url: file.url,
          name: file.name,
        })),
      };
    }
  }
}
\`\`\`

3. **Register in \`Monday.node.ts\`**:
\`\`\`typescript
loadFileColumns: loadOptionsExtended.loadFileColumns,
\`\`\`

4. **Add example to README.md**

## Benefits
- ✅ Consistent with other column types
- ✅ No need to switch to Advanced mode
- ✅ User-friendly file management
- ✅ Supports multiple files

## Milestone
v3.2.0

---

See [ISSUES.md](https://github.com/binesamit/n8n-nodes-mondaycom-simply/blob/main/ISSUES.md) for more details.
`,
    labels: ['enhancement', 'priority: high', 'feature', 'help wanted'],
    milestone: null,
  },

  {
    title: '👶 Feature: Subitem column values support',
    body: `## Problem Description

When creating items as subitems, column values from Column by Column mode are not applied.

### Current Behavior
- ✅ Subitem is created successfully
- ❌ Column values are ignored
- ❌ User must manually update subitem in separate operation

### Expected Behavior
- ✅ Subitem created with all column values
- ✅ Single operation

## Technical Challenge

Monday.com API creates subitems differently:
\`\`\`graphql
mutation {
  create_subitem(
    parent_item_id: PARENT_ID
    item_name: "Subitem Name"
    column_values: "{}"  # ⚠️ May not support all column types
  ) {
    id
  }
}
\`\`\`

## Investigation Needed

1. Test which column types work in \`create_subitem\`
2. Compare with \`create_item\` column support
3. Document any limitations
4. Update code to handle subitems with column values

### Files to Investigate
- \`nodes/Monday/Monday.node.ts\` - Create item logic (lines ~290-320)
- Monday.com API docs - \`create_subitem\` mutation

## Tasks
- [ ] Research Monday.com API \`create_subitem\` column support
- [ ] Test all column types with subitems
- [ ] Document which columns work and which don't
- [ ] Implement column value support for subitems
- [ ] Add tests for subitem creation with columns
- [ ] Update README with subitem examples

## Milestone
v3.2.0

---

See [ISSUES.md](https://github.com/binesamit/n8n-nodes-mondaycom-simply/blob/main/ISSUES.md) for more details.
`,
    labels: ['enhancement', 'priority: high', 'feature', 'research needed'],
    milestone: null,
  },

  {
    title: '📦 Feature: Bulk operations support',
    body: `## Feature Request

Add ability to create/update multiple items in one operation.

## Proposed UI

- **Toggle:** "Bulk Mode"
- **Input:** JSON array or CSV
- **Map columns automatically**

## Use Cases

1. **Data Migration:** Import 100+ items from external system
2. **Batch Updates:** Update status for multiple items at once
3. **Template Creation:** Create multiple similar items

## Example Input

\`\`\`json
[
  {
    "name": "Task 1",
    "status": "Working on it",
    "owner": "amit@example.com",
    "priority": "High"
  },
  {
    "name": "Task 2",
    "status": "Done",
    "owner": "or@example.com",
    "priority": "Medium"
  }
]
\`\`\`

## Benefits

- ✅ Faster for large datasets
- ✅ Reduced API calls (batch mutations)
- ✅ Better for migrations
- ✅ Time-saving for users

## Implementation Considerations

1. **API Rate Limits:** Monday.com has complexity-based limits
2. **Error Handling:** What happens if item 50 out of 100 fails?
3. **Progress Reporting:** Show user progress for large batches
4. **Validation:** Validate all items before sending

## Questions

- Should we support CSV import?
- How to map CSV columns to Monday.com columns?
- Maximum batch size? (suggest 50-100 items per batch)

## Milestone
v3.3.0

---

See [ISSUES.md](https://github.com/binesamit/n8n-nodes-mondaycom-simply/blob/main/ISSUES.md) for more details.
`,
    labels: ['enhancement', 'priority: medium', 'feature', 'discussion'],
    milestone: null,
  },

  {
    title: '💬 Enhancement: Better error messages with actionable suggestions',
    body: `## Problem

Current error messages from Monday.com API are often cryptic and don't help users understand what went wrong or how to fix it.

### Example Current Error
\`\`\`
Error: ColumnValueException
\`\`\`

### Example Improved Error
\`\`\`
❌ Error: Board Relation column "Customer" shows no items

Possible causes:
1. No boards are connected to this column
   → Solution: Go to Monday.com → Edit column → Add connected board

2. API token doesn't have access to linked board
   → Solution: Check token permissions in Monday.com Admin

3. Linked board is empty
   → Solution: Add items to the connected board first

📖 Read more: https://docs.monday.com/board-relations
\`\`\`

## Implementation Ideas

### 1. Error Code Mapping

Create a map of Monday.com error codes to user-friendly messages:

\`\`\`typescript
const errorMessages = {
  'ColumnValueException': {
    title: 'Invalid column value',
    suggestions: [
      'Check that the column type matches the value format',
      'Verify the column exists in your board',
      'Make sure the value is in the correct format for this column type',
    ],
    docs: 'https://developer.monday.com/api-reference/docs/column-values',
  },
  'ItemsLimitationError': {
    title: 'Too many items requested',
    suggestions: [
      'Reduce the number of items in your query',
      'Use pagination with limit and offset',
      'Consider splitting into multiple operations',
    ],
    docs: 'https://developer.monday.com/api-reference/docs/pagination',
  },
  // ... more error codes
};
\`\`\`

### 2. Context-Aware Suggestions

Based on the operation being performed, provide specific suggestions:

- **Board Relation errors** → Check linked boards
- **Status/Dropdown errors** → Verify label exists
- **Date/Timeline errors** → Check date format
- **People column errors** → Verify user IDs

### 3. Validation Before API Call

Catch common errors before sending to Monday.com:
- Invalid date formats
- Non-existent column IDs
- Empty required fields
- Type mismatches

## Files to Modify

- \`nodes/Monday/Monday.node.ts\` - Add error handler wrapper
- \`nodes/Monday/utils/errorHandler.ts\` - New file for error mapping
- \`nodes/Monday/utils/validators.ts\` - New file for pre-validation

## Benefits

- ✅ Users can self-resolve issues faster
- ✅ Less support requests
- ✅ Better developer experience
- ✅ Clearer understanding of what went wrong

## Milestone
v3.2.0

---

See [ISSUES.md](https://github.com/binesamit/n8n-nodes-mondaycom-simply/blob/main/ISSUES.md) for more details.
`,
    labels: ['enhancement', 'priority: medium', 'UX', 'help wanted'],
    milestone: null,
  },

  {
    title: '🪞 Enhancement: Display mirror columns in Column by Column mode',
    body: `## Feature Request

Display mirror columns in Column by Column mode (read-only) to help users understand data relationships.

## Current Behavior

Mirror columns are completely hidden in Column by Column mode.

## Proposed Behavior

Show mirror columns as **read-only informational fields**:

\`\`\`
📋 Column Type: Mirror Column (Read-only)

ℹ️ Mirror columns reflect data from connected boards.
   These values cannot be set directly - they update automatically.

Column: [Dropdown showing mirror columns]
Current Value: [Display only - shows current value]
Source: Project Board → Status Column
\`\`\`

## Benefits

- ✅ Users see complete picture of item structure
- ✅ Understand which fields are automatic
- ✅ Better documentation of board relationships
- ✅ Helps plan workflow automation

## Implementation

1. Add \`loadMirrorColumns()\` to show mirror columns
2. Display as disabled/read-only fields
3. Show source board and column information
4. Optionally display current value when updating

## Use Case

User wants to update an item and see all its data:
- Editable columns → Column by Column mode
- Mirror columns → Display current values (read-only)
- Formula columns → Display current values (read-only)

## Milestone
Future

---

See [ISSUES.md](https://github.com/binesamit/n8n-nodes-mondaycom-simply/blob/main/ISSUES.md) for more details.
`,
    labels: ['enhancement', 'priority: low', 'UX', 'good first issue'],
    milestone: null,
  },

  {
    title: '🔬 Research: Formula column creation support',
    body: `## Research Task

Investigate Monday.com API support for creating formula columns.

## Background

- Formula columns are currently **read-only** (API 2024-01+)
- API version **2024-04** claims to support formula creation
- Need to research if this is feasible in n8n node

## Questions to Answer

1. **API Support:**
   - Does API 2024-04 actually support creating formulas?
   - What is the mutation/query syntax?
   - Are there limitations on formula complexity?

2. **Validation:**
   - How to validate formula syntax before sending to API?
   - What errors can occur?
   - Is there a formula testing endpoint?

3. **UI Considerations:**
   - How to build formula editor in n8n?
   - Syntax highlighting possible?
   - Autocomplete for column names?

4. **Security:**
   - Can formulas access data they shouldn't?
   - Any rate limits or restrictions?

## Research Steps

- [ ] Read Monday.com API 2024-04 documentation
- [ ] Test formula creation via GraphQL explorer
- [ ] Document mutation syntax and examples
- [ ] Test error cases (invalid formulas)
- [ ] Determine if n8n UI can support this
- [ ] Document findings in this issue

## Example Use Case

User wants to create a calculated field:
\`\`\`
Formula: {Numbers Column 1} + {Numbers Column 2}
Result: Auto-calculated sum
\`\`\`

## References

- [Monday.com Formula Columns](https://support.monday.com/hc/en-us/articles/360001510679-Formula-Column)
- [API 2024-04 Release Notes](https://developer.monday.com/api-reference/changelog)

## Milestone
Research → v4.0.0 if feasible

---

See [ISSUES.md](https://github.com/binesamit/n8n-nodes-mondaycom-simply/blob/main/ISSUES.md) for more details.
`,
    labels: ['research', 'priority: low', 'question', 'future'],
    milestone: null,
  },
];

// Main function
async function createIssues() {
  console.log('🚀 Starting GitHub Issues creation...\n');
  console.log(`Repository: ${OWNER}/${REPO}\n`);

  let created = 0;
  let failed = 0;

  for (const issue of issues) {
    try {
      console.log(`📝 Creating: ${issue.title}...`);

      const response = await octokit.issues.create({
        owner: OWNER,
        repo: REPO,
        title: issue.title,
        body: issue.body,
        labels: issue.labels,
        milestone: issue.milestone,
      });

      console.log(`✅ Created: #${response.data.number} - ${issue.title}`);
      console.log(`   URL: ${response.data.html_url}\n`);
      created++;

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Failed to create: ${issue.title}`);
      console.error(`   Error: ${error.message}\n`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Summary:`);
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📋 Total: ${issues.length}`);
  console.log('='.repeat(60));

  if (created > 0) {
    console.log(`\n🎉 Success! View issues at:`);
    console.log(`   https://github.com/${OWNER}/${REPO}/issues`);
  }
}

// Run
createIssues().catch(error => {
  console.error('\n💥 Fatal error:', error.message);
  process.exit(1);
});
