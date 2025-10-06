# n8n-nodes-mondaycom-simply

A powerful n8n community node for Monday.com with intelligent column detection and seamless integration.

## ✨ Key Features

- 🎯 **Smart Column Detection** - Automatically detects and handles all Monday.com column types
- 🎨 **Simple Mode UI** - User-friendly interface with dynamic dropdowns for all column types
- 📊 **Formula Column Reading** - Read calculated values from formula columns (API 2024-01+)
- 🔗 **Board Relations** - Select items from linked boards with automatic loading
- 🔄 **Intelligent Caching** - Reduces API calls with smart caching (board metadata, users, items)
- 🚀 **Auto API Versioning** - Automatically uses the correct API version for each operation
- 🌐 **Full Hebrew Support** - Works perfectly with Hebrew text and RTL languages

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

### Configuring in n8n

1. In n8n, add a new Monday.com credential
2. Paste your API token
3. Select API version (or keep default `2023-10`)
4. Enable **Auto-Upgrade** to automatically use newer API versions when needed

### API Version Guide

| Version | Features | When to Use |
|---------|----------|-------------|
| **2023-10** | Standard operations | Default, works for most cases |
| **2024-01** | Formula column reading | When you need to read calculated values |
| **2024-04** | Formula creation | Advanced formula operations |
| **2025-07** | Latest features | All new capabilities |

**💡 Tip**: Enable **Auto-Upgrade** and the node will automatically select the right version!

## 🎯 Operations

### Item Operations

| Operation | Description |
|-----------|-------------|
| **Create** | Create a new item with column values |
| **Update** | Update an existing item's columns |
| **Get** | Retrieve a single item by ID |
| **Get All** | Retrieve all items from a board (with limit) |
| **Delete** | Delete an item by ID |
| **Read Formula Columns** | Read calculated values from formula columns |

## 🎨 Simple Mode - Column Types

### Status Column
Select from predefined status labels with visual colors.

**What it does:**
- Loads all status options from your selected status column
- Displays status labels exactly as they appear in Monday.com
- Updates the item with the selected status

**Example:** "Working on it", "Done", "Stuck"

---

### Dropdown Column
Single or multi-select dropdown values.

**What it does:**
- Loads all dropdown options from your selected dropdown column
- Supports multi-selection (you can choose multiple values)
- Automatically formats values for Monday.com API

**Example:** Select "Priority: High" and "Type: Bug" from your custom dropdowns

---

### People Column
Assign users and guests to items.

**What it does:**
- Loads all users and guests from your Monday.com workspace
- Shows users with 👤 icon and guests with 👥 icon
- Displays names and email addresses for easy identification
- Supports multiple people selection

**Example:** Assign "Amit Bines" and "Or Drori" to work on an item

---

### Board Relation Column
Link items from other boards.

**What it does:**
- Detects which boards are linked to the selected board relation column
- Automatically fetches all items from the linked board(s)
- Displays item names with IDs for easy identification
- Supports linking multiple items

**How the system works:**
1. You select a board relation column (e.g., "🌐 Website", "Customer Name")
2. The node reads the column settings to find which board(s) it links to
3. Fetches all items from those linked boards (up to 500 items)
4. Displays them in a searchable dropdown
5. When you save, creates the relationship in Monday.com

**Example:** Link a task to specific website projects or customer records

---

### Timeline Column
Set start and end dates for timeline visualization.

**What it does:**
- Provides date/time pickers for start and end dates
- Formats dates correctly for Monday.com timeline columns
- Creates visual timeline bars in your Monday.com board

**Example:** Set project duration from October 6, 2025 to October 14, 2025

---

### Text, Number, Date, Checkbox
Simple input fields for basic data types.

**What they do:**
- **Text**: Plain text input for short text columns
- **Number**: Numeric input with validation
- **Date**: Date picker for date columns
- **Checkbox**: Toggle for yes/no values

---

## 🔄 How The System Works

### Dynamic Column Loading

1. **Board Selection**: When you select a board, the node fetches all column metadata
2. **Column Type Detection**: Automatically identifies each column's type (status, dropdown, people, etc.)
3. **Dynamic Options**: For each column type, loads the relevant options:
   - Status columns → Load all status labels
   - Dropdown columns → Load all dropdown options
   - People columns → Load all workspace users and guests
   - Board relation columns → Load items from linked boards
4. **Smart Caching**: Caches results to minimize API calls and improve performance

### API Query Optimization

The node uses GraphQL queries to efficiently fetch data:

```graphql
# Example: Loading linked board items
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

### Caching Strategy

| Data Type | Cache Duration | Why |
|-----------|----------------|-----|
| Board metadata & columns | 5 minutes | Columns don't change frequently |
| Status/Dropdown values | 5 minutes | Labels rarely change |
| Linked board items | 2 minutes | Items change more frequently |
| Users and guests | 10 minutes | User list is relatively stable |

**Cache automatically refreshes when:**
- You switch to a different board
- Cache duration expires
- You refresh the workflow

## 📚 Examples

### Example 1: Create a Complete Task

**Simple Mode Configuration:**

```
Board: "Project Management"
Item Name: "Design new landing page"

Status Column: "Task Status"
Status Value: "Working on it"

Dropdown Column: "Priority"
Dropdown Values: ["High"]

People Column: "Owner"
People: ["Amit B (amit@example.com)", "Or Drori (or@example.com)"]

Board Relation Column: "Related Project"
Related Items: ["Website Redesign (#1234567)"]

Timeline Column: "Project Timeline"
Timeline Start Date: 2025-10-06
Timeline End Date: 2025-10-20
```

**Result:** Creates a fully configured item with all relationships!

---

### Example 2: Read Formula Columns

**Configuration:**
```json
{
  "operation": "readFormula",
  "board": "2111900974",
  "formulaColumns": ["revenue_formula", "profit_margin"],
  "outputFormat": "both",
  "itemIds": "789012,789013"
}
```

**Output:**
```json
{
  "item_id": "789012",
  "item_name": "Q4 Campaign",
  "revenue_formula": {
    "value": 15000,
    "text": "$15,000"
  },
  "profit_margin": {
    "value": 0.33,
    "text": "33%"
  }
}
```

---

### Example 3: Advanced Mode (JSON)

For complex scenarios, use JSON input:

```json
{
  "status": {
    "label": "Done"
  },
  "people": {
    "personsAndTeams": [
      {"id": 12345, "kind": "person"}
    ]
  },
  "date": {
    "date": "2025-10-15"
  },
  "timeline": {
    "from": "2025-10-06",
    "to": "2025-10-20"
  },
  "board_relation": {
    "item_ids": [1234567, 1234568]
  },
  "dropdown": {
    "labels": ["בדיקה 1", "בדיקה 2"]
  }
}
```

## 🐛 Troubleshooting

### "No data" in Related Items field

**Solution:** The board relation column needs to have linked boards configured in Monday.com first.

1. Go to Monday.com
2. Edit the board relation column settings
3. Add at least one connected board
4. Refresh your n8n workflow

---

### Dropdown values not saving

**Issue:** Sending dropdown IDs instead of label text.

**Solution:** Version 2.0.0+ automatically handles this. Make sure you're using the latest version:
```bash
npm update @bines/n8n-nodes-mondaycom-simply
```

---

### API Version Errors

**Error:** "Cannot query field 'items' on type 'Board'"

**Solution:** This is fixed in version 1.5.6+. The node now uses `items_page` for newer API versions.

Update to the latest version:
```bash
npm update @bines/n8n-nodes-mondaycom-simply
```

## 🔧 Technical Details

### Supported Column Types

| Column Type | Create/Update | Read | Notes |
|-------------|---------------|------|-------|
| Status | ✅ | ✅ | Uses label text |
| Text | ✅ | ✅ | Plain text |
| Long Text | ✅ | ✅ | Multi-line text |
| Numbers | ✅ | ✅ | Integer or decimal |
| Date | ✅ | ✅ | ISO format |
| Timeline | ✅ | ✅ | Start and end dates |
| People | ✅ | ✅ | User and guest IDs |
| Dropdown | ✅ | ✅ | Label text (not IDs) |
| Email | ✅ | ✅ | Validated email |
| Phone | ✅ | ✅ | Phone number |
| Link | ✅ | ✅ | URL with optional text |
| Checkbox | ✅ | ✅ | Boolean |
| Rating | ✅ | ✅ | 1-5 stars |
| Tags | ✅ | ✅ | Multiple tags |
| Board Relation | ✅ | ✅ | Item IDs from linked boards |
| Dependency | ✅ | ✅ | Item dependencies |
| Formula | ❌ | ✅ | Read-only (API 2024-01+) |

### GraphQL Queries Used

The node uses optimized GraphQL queries:

- **Board metadata**: Fetches columns with types and settings
- **Items from boards**: Uses `items_page` for pagination support (API 2024+)
- **Create/Update**: Uses mutations with proper JSON formatting

## 🆕 Changelog

### Version 2.0.0 (Current)
- ✅ **Fixed:** Board relation items now load correctly with `items_page` query
- ✅ **Fixed:** Dropdown values use label text instead of IDs
- ✅ **Fixed:** Support for `boardIds` (camelCase) in board relation settings
- ✅ **Improved:** Enhanced README with detailed explanations
- ✅ **Added:** Comprehensive troubleshooting guide
- 🎉 **Stable:** All Simple Mode fields working perfectly

### Version 1.5.7
- Fixed dropdown label text handling
- Improved error messages

### Version 1.5.6
- Fixed GraphQL query to use `items_page`
- Fixed `boardIds` field name in settings

### Version 1.5.0
- Restored v1.1.0 structure with critical bug fixes
- Enhanced Simple Mode with all column types

### Version 1.0.0
- Initial release
- Dynamic column support
- Formula column reading
- Smart caching

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

**Amit Bines**
- Email: amit@bines.co.il
- GitHub: [@binesamit](https://github.com/binesamit)

## 🙏 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚠️ Disclaimer

This project is provided "as is", without warranty of any kind. Use at your own risk.

## 📞 Support

Need help?
- 📖 [Monday.com API Documentation](https://developer.monday.com/api-reference/docs)
- 🐛 [Report an Issue](https://github.com/binesamit/n8n-nodes-mondaycom-simply/issues)
- 💬 [n8n Community](https://community.n8n.io/)

---

**Made with ❤️ for the n8n community**
