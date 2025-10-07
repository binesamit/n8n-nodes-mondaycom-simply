# n8n-nodes-mondaycom-simply

> A powerful, feature-rich n8n community node for Monday.com with intelligent column detection and seamless integration.

[![npm version](https://img.shields.io/npm/v/@bines/n8n-nodes-mondaycom-simply)](https://www.npmjs.com/package/@bines/n8n-nodes-mondaycom-simply)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Key Features

- 🎯 **Column by Column Mode** - Add and configure columns one by one with type-specific input fields
- 🔍 **Smart Column Filtering** - Each column type shows only relevant columns (e.g., Status Column shows only status fields)
- 📊 **Formula Column Reading** - Read calculated values from formula columns (API 2024-01+)
- 🔗 **Board Relations** - Automatically loads items from linked boards with multi-select support
- 🚫 **No Cache for Values** - Always fetches fresh data from Monday.com when you click dropdowns
- 🚀 **Auto API Versioning** - Automatically uses the correct API version for each operation
- 🌐 **Full RTL Support** - Works perfectly with Hebrew text and RTL languages
- ⚡ **Performance Optimized** - Smart caching for board metadata reduces API calls

## 📦 Installation

### Using npm (Recommended)

```bash
npm install @bines/n8n-nodes-mondaycom-simply
```

### Manual Installation

1. Navigate to your n8n installation folder
2. Go to the custom nodes folder (usually `~/.n8n/custom/`)
3. Run: `npm install @bines/n8n-nodes-mondaycom-simply`
4. Restart n8n

## 🔐 Authentication

### Getting Your API Token

1. Log in to your Monday.com account
2. Click on your profile picture → **Admin**
3. Navigate to **API** section
4. Click **Generate** to create a **Personal API Token**
5. Copy the token and save it securely

⚠️ **Security Notice**: Never commit your API token to version control or share it publicly.

### Configuring in n8n

1. In n8n, add a new Monday.com credential
2. Paste your API token
3. Select API version (recommended: `2025-10`)
4. Enable **Auto-Upgrade** to automatically use newer API versions when needed

### API Version Guide

| Version | Features | When to Use |
|---------|----------|-------------|
| **2023-10** | Standard operations | Basic item CRUD operations |
| **2024-01** | Formula column reading | When you need to read calculated values |
| **2024-04** | Formula creation | Advanced formula operations |
| **2025-10** | Latest features | All new capabilities + improved queries |

**💡 Tip**: Enable **Auto-Upgrade** and the node will automatically select the right version!

## 🎯 Available Resources

### 📋 Item Operations

| Operation | Description |
|-----------|-------------|
| **Create** | Create a new item with column values (supports sub-items) |
| **Update** | Update an existing item's columns |
| **Get** | Retrieve a single item by ID |
| **Get All** | Retrieve all items from a board with pagination |
| **Delete** | Delete an item by ID |
| **Get by Column Value** | Find items by specific column values |

### 📊 Board Operations

| Operation | Description |
|-----------|-------------|
| **Get Boards** | List all accessible boards |
| **Get Board** | Get detailed information about a specific board |
| **Get Columns** | Retrieve all columns and their settings |

### 📁 Additional Resources

- **Groups**: Create, update, delete, and manage board groups
- **Folders**: Organize boards in workspaces
- **Docs**: Manage Monday Docs integration
- **Updates**: Post updates and comments on items
- **Users**: List workspace users and guests

## 🎨 Column Input Modes

### Mode 1: Column by Column (Default & Recommended)

The most user-friendly way to set column values with type-specific inputs.

**How it works:**
1. Click **"Add Column"** to select a column type
2. Choose the specific column from your board
3. Click the value field - options load automatically from Monday.com
4. Repeat for each column you want to set

**Supported Column Types:**

#### 🎯 Status Column
Select from predefined status labels with visual colors.

**Features:**
- Loads all status options from your selected status column
- Displays status labels exactly as they appear in Monday.com
- Single-select dropdown

**Example:** "Working on it", "Done", "Stuck"

---

#### 📋 Dropdown Column
Single or multi-select dropdown values.

**Features:**
- Loads all dropdown options dynamically
- Supports multi-selection (choose multiple values)
- Always up-to-date with your board settings

**Example:** Select "Priority: High" and "Type: Bug"

---

#### 👥 People Column
Assign users and guests to items.

**Features:**
- Loads all users and guests from your Monday.com workspace
- Shows users with 👤 icon and guests with 👥 icon
- Displays names and email addresses
- Supports multiple people assignment

**Example:** Assign "Amit Bines (amit@example.com)" and "Or Drori (or@example.com)"

---

#### 🔗 Board Relation Column
Link items from other boards.

**Features:**
- Automatically detects linked boards from column settings
- Fetches all items from connected boards
- Displays item names with IDs: "Project Name (#1234567)"
- Supports linking multiple items
- No caching - always fresh data

**How the system works:**
1. You select a board relation column (e.g., "🌐 Website", "Customer")
2. Node reads column settings to find `boardIds`
3. Fetches all items from those linked boards (up to 500 items per board)
4. Displays them in searchable multi-select dropdown
5. Saves relationships using `item_ids` format

**Example:** Link a task to "Website Redesign (#1234567)" and "Mobile App (#1234568)"

---

#### 📅 Timeline Column
Set start and end dates for timeline visualization.

**Features:**
- Dual date/time pickers for start and end dates
- ISO format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss`
- Creates visual timeline bars in Monday.com

**Example:**
- Start Date: `2025-10-06`
- End Date: `2025-10-20`

---

#### 📝 Text Column
Plain text input (shows only `text` and `long-text` columns).

**Features:**
- Filtered column list - only shows text-type columns
- Supports both short text and long text
- String input field

---

#### 🔢 Number Column
Numeric input (shows only `numbers` and `numeric` columns).

**Features:**
- Filtered column list - only number columns
- Number input with validation
- Supports integers and decimals

---

#### 📆 Date Column
Date selection (shows only `date` columns).

**Features:**
- Filtered column list - only date columns
- Date/time picker
- ISO format output

---

#### ✅ Checkbox Column
Boolean toggle (shows only `checkbox` columns).

**Features:**
- Filtered column list - only checkbox columns
- True/false toggle
- Sends as `{"checked": "true"}` or `{"checked": "false"}`

---

#### 🆓 Free Column
Advanced users: any column with custom string/JSON input.

**Features:**
- Shows **all columns** from the board with type indicator
- Accepts string or JSON input
- Auto-parses JSON if input starts with `{` or `[`
- Use for column types not yet supported by specific fields

**Example:**
```json
{"label": "Done"}
```

---

### Mode 2: Advanced (JSON)

For complex scenarios or when you need full control.

**When to use:**
- Updating multiple columns in one operation
- Using expressions or variables from previous nodes
- Setting complex nested structures
- File uploads (not supported in Column by Column mode)

**Example:**
```json
{
  "status": {
    "label": "Done"
  },
  "people": {
    "personsAndTeams": [
      {"id": 12345, "kind": "person"},
      {"id": 67890, "kind": "person"}
    ]
  },
  "timeline": {
    "from": "2025-10-06",
    "to": "2025-10-20"
  },
  "board_relation": {
    "item_ids": [1234567, 1234568]
  },
  "dropdown": {
    "labels": ["Option 1", "Option 2"]
  },
  "text": "Hello World",
  "number": 42,
  "date": {
    "date": "2025-10-15"
  },
  "checkbox": {
    "checked": "true"
  }
}
```

**File Upload Example:**
```json
{
  "files": {
    "fileUrls": [
      {
        "url": "https://example.com/file.pdf",
        "name": "document.pdf"
      }
    ]
  }
}
```

---

## 🔄 How The System Works

### Dynamic Column Loading

1. **Board Selection**: When you select a board, the node fetches all column metadata using GraphQL
2. **Column Type Detection**: Automatically identifies each column's type from `settings_str`
3. **Filtered Options**: Each column type shows only relevant columns:
   - `loadTextColumns` → filters by `text` and `long-text`
   - `loadNumberColumns` → filters by `numbers` and `numeric`
   - `loadStatusColumns` → filters by `status`
   - etc.
4. **Dynamic Value Loading**: When you click a value field:
   - Reads the selected column's settings
   - Fetches available options (status labels, dropdown values, items from linked boards)
   - Returns fresh data every time (no cache for values)

### GraphQL Query Optimization

**Board Metadata Query:**
```graphql
query {
  boards(ids: [BOARD_ID]) {
    id
    name
    columns {
      id
      title
      type
      settings_str
    }
  }
}
```

**Linked Board Items Query:**
```graphql
query {
  boards(ids: [LINKED_BOARD_IDS]) {
    items_page(limit: 500) {
      items {
        id
        name
      }
    }
  }
}
```

**Create Item Mutation:**
```graphql
mutation {
  create_item(
    board_id: BOARD_ID
    item_name: "Task Name"
    column_values: "{\"status\":{\"label\":\"Done\"}}"
  ) {
    id
  }
}
```

### Caching Strategy

| Data Type | Cache Duration | Refresh Trigger |
|-----------|----------------|-----------------|
| **Board metadata** | 5 minutes | Board change, manual refresh |
| **Column lists** | 5 minutes | Board change, manual refresh |
| **Status/Dropdown values** | ❌ None | Fetched fresh every time |
| **Linked board items** | ❌ None | Fetched fresh every time |
| **Users and guests** | 10 minutes | Workspace change |

**Why no cache for values?**
- Ensures you always see the latest data from Monday.com
- No stale dropdown options
- No need to manually refresh workflow
- Better UX - click and see current data

---

## 📚 Usage Examples

### Example 1: Create a Complete Task with All Column Types

**Configuration:**
```
Resource: Item
Operation: Create
Board: "Project Management"
Item Name: "Design new landing page"
Column Input Mode: Column by Column

Add Status Column:
  Column: "Task Status"
  Value: "Working on it"

Add Dropdown Column:
  Column: "Priority"
  Values: ["High", "Urgent"]

Add People Column:
  Column: "Owner"
  People: ["Amit B (amit@example.com)", "Or Drori (or@example.com)"]

Add Board Relation:
  Column: "Related Project"
  Related Items: ["Website Redesign (#1234567)", "Mobile App (#1234568)"]

Add Timeline:
  Column: "Project Timeline"
  Start Date: 2025-10-06T09:00:00
  End Date: 2025-10-20T17:00:00

Add Text Column:
  Column: "Description"
  Text Value: "Create modern, responsive landing page with hero section"

Add Number Column:
  Column: "Estimated Hours"
  Number Value: 40

Add Checkbox:
  Column: "Approved"
  Checked: true
```

**Result:** Creates a fully configured item with all relationships, timeline, and metadata! ✅

---

### Example 2: Update Item with Hebrew Text

**Configuration:**
```
Resource: Item
Operation: Update
Board: "ניהול פרויקטים"
Item: "משימה חדשה (#9876543)"
Column Input Mode: Column by Column

Add Status Column:
  Column: "סטטוס משימה"
  Value: "בתהליך עבודה"

Add Text Column:
  Column: "תיאור"
  Text Value: "עיצוב דף נחיתה חדש עם תמיכה מלאה ב-RTL"
```

**Result:** Updates item with Hebrew text properly encoded! 🇮🇱

---

### Example 3: Link Multiple Items from Different Boards

**Scenario:** You have a "Tasks" board and want to link to both "Projects" and "Customers" boards.

**Configuration:**
```
Add Board Relation (Projects):
  Column: "Related Project"
  Related Items: ["Website Redesign (#1111)", "Mobile App (#2222)"]

Add Board Relation (Customers):
  Column: "Customer"
  Related Items: ["Acme Corp (#3333)"]
```

**Behind the scenes:**
1. Node reads "Related Project" column settings → finds it links to "Projects" board
2. Fetches all items from "Projects" board
3. Node reads "Customer" column settings → finds it links to "Customers" board
4. Fetches all items from "Customers" board
5. You select the items you want
6. Creates the relationships

---

### Example 4: Advanced JSON Mode with Expressions

**Use Case:** Set status based on previous node output

**Configuration:**
```json
{
  "status": {
    "label": "{{ $json.taskStatus }}"
  },
  "text": "{{ $json.description }}",
  "number": {{ $json.estimatedHours }},
  "people": {
    "personsAndTeams": {{ $json.assignees }}
  }
}
```

---

## 🐛 Troubleshooting

### Issue: "No data" appears in dropdown value fields

**Symptoms:**
- You select a column but the value field shows "No data"
- Options don't load automatically

**Current Status (v3.1.0):**
- ⚠️ Known issue in alpha version
- Values need to be clicked/refreshed to load
- Fix in progress for automatic loading

**Workaround:**
1. Click on the value dropdown
2. Click the refresh icon (↻) in n8n
3. Values should load

**Permanent fix coming soon in v3.2.0**

---

### Issue: Board Relation shows "No data"

**Solution 1: Check Board Relation Configuration**
1. Go to Monday.com
2. Click on the board relation column settings
3. Verify that at least one board is connected
4. If no boards are connected, add one
5. Refresh your n8n workflow

**Solution 2: Check API Permissions**
- Your API token needs access to both the source board and linked boards
- Check in Monday.com: Admin → API → Token Permissions

---

### Issue: Dropdown values not saving correctly

**Symptom:** Values appear selected in n8n but don't save to Monday.com

**Cause:** Old versions used dropdown IDs instead of label text

**Solution:** Update to v3.0.0+
```bash
npm update @bines/n8n-nodes-mondaycom-simply
```

Version 3.0.0+ automatically uses label text (the correct format).

---

### Issue: Timeline dates not appearing

**Common mistakes:**
1. **Wrong format**: Use ISO format `YYYY-MM-DD` not `DD/MM/YYYY`
2. **Missing both dates**: Timeline needs both start AND end dates
3. **Reversed dates**: Start date must be before end date

**Correct format:**
```
Start Date: 2025-10-06
End Date: 2025-10-20
```

---

### Issue: API Version Errors

**Error:** `Cannot query field 'items' on type 'Board'`

**Cause:** Older API versions use `items` field, newer versions use `items_page`

**Solution:**
1. Update to latest version: `npm update @bines/n8n-nodes-mondaycom-simply`
2. Enable "Auto-Upgrade" in credentials
3. The node will automatically use the correct query based on API version

---

### Issue: Hebrew or RTL text appears broken

**Symptoms:**
- Hebrew text shows as `??????` or boxes
- Text direction is wrong

**Solution:** This should work automatically in v3.0.0+

If still having issues:
1. Make sure your Monday.com board language is set to Hebrew
2. Use UTF-8 encoding in n8n
3. Update to latest version

---

## 🔧 Technical Details

### Supported Column Types Matrix

| Column Type | Create | Update | Read | Input Type | API Field |
|-------------|--------|--------|------|------------|-----------|
| **Status** | ✅ | ✅ | ✅ | Dropdown | `{label: "text"}` |
| **Text** | ✅ | ✅ | ✅ | String | `"text"` |
| **Long Text** | ✅ | ✅ | ✅ | String | `"text"` |
| **Numbers** | ✅ | ✅ | ✅ | Number | `42` or `"42"` |
| **Date** | ✅ | ✅ | ✅ | ISO Date | `{date: "2025-10-15"}` |
| **Timeline** | ✅ | ✅ | ✅ | Date Range | `{from: "...", to: "..."}` |
| **People** | ✅ | ✅ | ✅ | Multi-Select | `{personsAndTeams: [...]}` |
| **Dropdown** | ✅ | ✅ | ✅ | Multi-Select | `{labels: ["text"]}` |
| **Email** | ✅ | ✅ | ✅ | String (validated) | `{email: "...", text: "..."}` |
| **Phone** | ✅ | ✅ | ✅ | String | `{phone: "...", countryCode: "..."}` |
| **Link** | ✅ | ✅ | ✅ | String | `{url: "...", text: "..."}` |
| **Checkbox** | ✅ | ✅ | ✅ | Boolean | `{checked: "true"}` |
| **Rating** | ✅ | ✅ | ✅ | Number (1-5) | `{rating: 5}` |
| **Tags** | ✅ | ✅ | ✅ | Array | `{tag_ids: [1,2,3]}` |
| **Board Relation** | ✅ | ✅ | ✅ | Multi-Select | `{item_ids: [123, 456]}` |
| **Dependency** | ✅ | ✅ | ✅ | Array | `{item_ids: [123]}` |
| **Formula** | ❌ | ❌ | ✅ | Read-only | N/A (API 2024-01+) |
| **Files** | ✅ | ✅ | ✅ | Advanced only | `{fileUrls: [{url, name}]}` |
| **Mirror** | ❌ | ❌ | ✅ | Read-only | N/A |
| **Auto Number** | ❌ | ❌ | ✅ | Read-only | N/A |
| **Creation Log** | ❌ | ❌ | ✅ | Read-only | N/A |
| **Last Updated** | ❌ | ❌ | ✅ | Read-only | N/A |

### Architecture Overview

```
📁 nodes/Monday/
├── 📄 Monday.node.ts              # Main node entry point
├── 📁 descriptions/
│   ├── ItemDescription.ts         # Item operations UI
│   ├── ColumnFields.ts           # Column by Column mode fields
│   ├── BoardDescription.ts       # Board operations
│   └── ...
├── 📁 methods/
│   ├── loadOptionsMethods.ts     # Basic loadOptions (boards, columns)
│   └── loadOptionsMethodsExtended.ts  # Advanced (filtered columns, values)
├── 📁 utils/
│   ├── apiClient.ts              # Monday.com GraphQL client
│   ├── columnMapper.ts           # Column type detection
│   ├── columnByColumnBuild.ts    # Build column_values from UI
│   ├── cache.ts                  # Caching manager
│   └── ...
└── 📁 types/
    └── Monday.types.ts           # TypeScript interfaces
```

### Load Options Methods

| Method | Purpose | Filters | Cache |
|--------|---------|---------|-------|
| `loadBoards` | List all boards | - | 5 min |
| `loadColumns` | All columns from board | - | 5 min |
| `loadStatusColumns` | Status columns only | `type === 'status'` | 5 min |
| `loadDropdownColumns` | Dropdown columns only | `type === 'dropdown'` | 5 min |
| `loadPeopleColumns` | People columns only | `type === 'people'` | 5 min |
| `loadBoardRelationColumns` | Board relation only | `type === 'board_relation'` | 5 min |
| `loadTimelineColumns` | Timeline only | `type === 'timeline'` | 5 min |
| `loadTextColumns` | Text fields only | `type === 'text' \|\| 'long-text'` | 5 min |
| `loadNumberColumns` | Number fields only | `type === 'numbers' \|\| 'numeric'` | 5 min |
| `loadDateColumns` | Date fields only | `type === 'date'` | 5 min |
| `loadCheckboxColumns` | Checkbox only | `type === 'checkbox'` | 5 min |
| `loadAllColumns` | All columns with type | Shows type in name | 5 min |
| `loadStatusValuesForSelectedColumn` | Status labels | From `settings_str` | ❌ None |
| `loadDropdownValuesForSelectedColumn` | Dropdown options | From `settings_str` | ❌ None |
| `loadLinkedBoardItemsForSelectedColumn` | Items from linked boards | Reads `boardIds` | ❌ None |
| `loadUsersAndGuests` | Workspace members | Users + Guests | 10 min |

---

## 🆕 Version History

### v3.1.0 (Latest - 2025-10-07)
**🚀 Performance & UX Improvements**
- ✅ **Removed caching from value loaders** - Always fresh data from Monday.com
- ✅ **Improved hints** - Better guidance on how to use fields
- ✅ **Updated notice** - Clear instructions for Column by Column mode
- 🐛 **Known Issue**: Values sometimes need manual refresh (fix coming in v3.2.0)

### v3.0.4 (2025-10-07)
**📝 UX Enhancements**
- ✅ Added helpful notices and hints
- ✅ Improved field descriptions
- ✅ 5-minute cache with clear refresh instructions

### v3.0.3 (2025-10-07)
**🔗 Board Relation Fix**
- ✅ Fixed `boardIds` key (camelCase instead of snake_case)
- ✅ Added caching for board relation items
- ✅ Added caching for dropdown values

### v3.0.2 (2025-10-07)
**🔄 Dynamic Value Loading**
- ✅ Fixed value loading in fixedCollection context
- ✅ Multiple fallback methods for accessing column IDs
- ✅ Improved "No data" issue

### v3.0.1 (2025-10-07)
**🎯 Filtered Column Loaders**
- ✅ Added type-specific column loaders
- ✅ Text Column shows only text fields
- ✅ Number Column shows only number fields
- ✅ Added Free Column for advanced users

### v3.0.0 (2025-10-07) - MAJOR RELEASE
**💥 Breaking Changes - Complete Redesign**
- 🗑️ **Removed Smart Mode** (resourceMapper doesn't support multiOptions)
- 🗑️ **Removed Simple Mode** (replaced by Column by Column)
- ✅ **New: Column by Column Mode** - Default mode with fixedCollection
- ✅ **Add Field button** - Users can add multiple columns of same type
- ✅ **Type-specific inputs** - Each column type has appropriate UI
- ✅ Timeline: Dual date pickers (start/end)
- ✅ Board Relation: Multi-select from linked boards
- ✅ Dropdown: Multi-select with dynamic loading

### v2.13.0 (Previous Stable)
- Smart mode with resourceMapper
- Simple mode with dynamic UI
- Formula column reading

### v1.0.0 (Initial Release)
- Basic item operations
- Dynamic column support
- Smart caching

---

## 🗺️ Roadmap

### Planned for v3.2.0
- 🔄 **Fix**: Automatic value loading without manual refresh
- 🎯 **New**: Bulk operations (create/update multiple items)
- 📊 **New**: Subitems support in Column by Column mode
- 🔍 **Improved**: Better error messages with suggestions

### Future Features
- 📈 **Dashboards**: Read dashboard data
- 🔔 **Webhooks**: Monday.com webhook integration
- 🧪 **Testing**: Automated tests for all column types
- 📚 **Docs**: Video tutorials and more examples

---

## 📄 License

MIT License

Copyright (c) 2025 Amit Bines

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## ⚠️ Disclaimer

**IMPORTANT - PLEASE READ CAREFULLY**

This project is provided **"AS IS"**, without any warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and noninfringement.

### Use at Your Own Risk

- The maintainers are **not responsible** for any issues, damages, data loss, or other problems caused by the use of this software
- This is a **community-developed node**, not an official Monday.com product
- Always **test in a development environment** before using in production
- **Backup your data** before performing bulk operations
- Review the code and understand what it does before using it

### No Affiliation

- This project is **not affiliated with, endorsed by, or sponsored by** Monday.com Ltd.
- Monday.com® is a registered trademark of Monday.com Ltd.
- All trademarks and product names mentioned are the property of their respective owners

### API Rate Limits

- Monday.com enforces API rate limits (complexity-based)
- Excessive API calls may result in temporary rate limiting or account restrictions
- The node includes caching to minimize API calls, but users are responsible for managing their usage
- Refer to Monday.com's official documentation for current rate limits

### Data Privacy & Security

- **Never commit API tokens** to version control or share them publicly
- API tokens have full access to your Monday.com account
- Use environment variables or n8n's secure credential storage
- Review Monday.com's privacy policy and terms of service

### Community Support

- This is a **community project** maintained by volunteers
- Support is provided on a best-effort basis
- Response times may vary
- Consider contributing if you find bugs or have improvements

### Official Resources

For official Monday.com API documentation and support:
- 📖 [Monday.com API Reference](https://developer.monday.com/api-reference/reference/about-the-api-reference)
- 📘 [Monday.com Developer Center](https://developer.monday.com/)
- 💬 [Monday.com Community](https://community.monday.com/)

---

## 👨‍💻 Author

**Amit Bines**
- Email: amit@bines.co.il
- GitHub: [@binesamit](https://github.com/binesamit)
- Repository: [n8n-nodes-mondaycom-simply](https://github.com/binesamit/n8n-nodes-mondaycom-simply)

---

## 🙏 Contributing

Contributions are welcome! Here's how you can help:

1. **Report Bugs**: [Open an issue](https://github.com/binesamit/n8n-nodes-mondaycom-simply/issues)
2. **Suggest Features**: Share your ideas in issues
3. **Submit PRs**: Fork, make changes, and submit a pull request
4. **Improve Docs**: Help make the documentation better
5. **Share Examples**: Show how you're using the node

### Development Setup

```bash
# Clone the repo
git clone https://github.com/binesamit/n8n-nodes-mondaycom-simply.git

# Install dependencies
cd n8n-nodes-mondaycom-simply
npm install

# Build
npm run build

# Link locally for testing
npm link
cd ~/.n8n/nodes
npm link @bines/n8n-nodes-mondaycom-simply
```

---

## 📞 Support & Resources

### Get Help

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/binesamit/n8n-nodes-mondaycom-simply/issues)
- 💬 **Questions**: [n8n Community Forum](https://community.n8n.io/)
- 📖 **Documentation**: This README + [Monday.com API Docs](https://developer.monday.com/api-reference/docs)

### Useful Links

- 🌐 [n8n Official Website](https://n8n.io/)
- 📦 [npm Package](https://www.npmjs.com/package/@bines/n8n-nodes-mondaycom-simply)
- 🔧 [Monday.com API Reference](https://developer.monday.com/api-reference/reference/about-the-api-reference)
- 💻 [GraphQL Explorer](https://monday.com/developers/v2/try-it-yourself) (requires login)

---

## ⭐ Show Your Support

If this node helped you, please consider:
- ⭐ **Star this repo** on GitHub
- 📢 **Share** with others who might benefit
- 💝 **Contribute** improvements or bug fixes
- ☕ **Buy me a coffee** (coming soon)

---

**Made with ❤️ for the n8n and Monday.com communities**

*Last updated: October 7, 2025*
