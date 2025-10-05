# n8n-nodes-mondaycom-simply

This is an n8n community node for Monday.com with enhanced features including:

- 🎯 **Dynamic Column Support** - Automatically detects and maps column types
- 📊 **Formula Column Reading** - Read calculated values from formula columns (API 2024-01+)
- 🔄 **Smart Caching** - Reduces API calls with intelligent caching
- 🎨 **Simple & Advanced Modes** - Choose between UI-driven or JSON input
- 🚀 **Auto-Versioning** - Automatically uses the right API version for each operation

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Using npm

```bash
npm install @bines/n8n-nodes-mondaycom-simply
```

### Manual Installation

1. Navigate to your n8n installation folder
2. Go to the custom nodes folder (usually `~/.n8n/custom/`)
3. Run: `npm install @bines/n8n-nodes-mondaycom-simply`
4. Restart n8n

## Credentials

To use this node, you need a Monday.com API token:

1. Log in to your Monday.com account
2. Go to **Admin** → **API**
3. Generate a **Personal API Token**
4. Copy the token and paste it into the n8n credential configuration

### API Version Selection

You can choose which Monday.com API version to use:

- **2023-10** (Default) - Compatible with all existing workflows
- **2024-01** - Required for reading formula columns
- **2024-04** - Supports formula column creation
- **2025-07** - Latest version with all features

**Auto-Upgrade**: Enable this option to automatically upgrade the API version when using features that require a newer version.

## Operations

### Item

- **Create** - Create a new item on a board
- **Update** - Update an existing item
- **Get** - Retrieve a single item
- **Get All** - Retrieve all items from a board
- **Delete** - Delete an item
- **Read Formula Columns** - Read calculated values from formula columns

## Features

### Column Input Modes

#### Advanced Mode (JSON)
Traditional method - enter column values as JSON:

```json
{
  "status": {
    "label": "Done"
  },
  "text": "Hello World",
  "numbers": 42
}
```

#### Simple Mode (Dynamic UI)
Select values using dynamic UI fields that adapt to your board's column types.

### Supported Column Types

- ✅ Status
- ✅ Text
- ✅ Long Text
- ✅ Numbers
- ✅ Date
- ✅ Timeline
- ✅ People
- ✅ Dropdown
- ✅ Email
- ✅ Phone
- ✅ Link
- ✅ Checkbox
- ✅ Rating
- ✅ Tags
- ✅ Board Relation
- ✅ Dependency
- ✅ **Formula** (read-only, requires API 2024-01+)

### Formula Columns

Read calculated values from formula columns:

```javascript
// Get items with formula columns
{
  "board": "123456",
  "formulaColumns": ["formula_revenue", "formula_profit"],
  "outputFormat": "both" // value | text | both
}
```

Output:
```json
{
  "item_id": "789012",
  "item_name": "Q4 Campaign",
  "formula_revenue": {
    "value": 15000,
    "text": "$15,000"
  },
  "formula_profit": {
    "value": 5000,
    "text": "$5,000"
  }
}
```

## Caching

The node implements smart caching to reduce API calls:

- **Board metadata**: 5 minutes
- **Column definitions**: 5 minutes
- **Linked board items**: 2 minutes
- **Users/Teams**: 10 minutes

Cache is automatically invalidated when:
- Switching boards
- Manual refresh is triggered
- TTL expires

## Examples

### Create an Item with Multiple Columns

**Advanced Mode:**
```json
{
  "status": {"label": "In Progress"},
  "people": {
    "personsAndTeams": [
      {"id": "12345", "kind": "person"}
    ]
  },
  "date": {"date": "2025-10-15"},
  "numbers": 1000
}
```

**Simple Mode:**
Just select values from dropdowns and fill in fields!

### Read Formula Columns

```javascript
// Node configuration
{
  "resource": "item",
  "operation": "readFormula",
  "board": "123456",
  "formulaColumns": ["revenue_formula"],
  "outputFormat": "value",
  "itemIds": "789012,789013"
}
```

## Compatibility

- n8n version: 1.0.0+
- Monday.com API versions: 2023-10, 2024-01, 2024-04, 2025-07
- Node.js: 18+

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Monday.com API documentation](https://developer.monday.com/api-reference/docs)
- [Monday.com API changelog](https://developer.monday.com/api-reference/changelog)

## Support

If you encounter any issues or have feature requests:

- Open an issue on [GitHub](https://github.com/binesamit/n8n-nodes-mondaycom-simply/issues)
- Check the [Monday.com API documentation](https://developer.monday.com/api-reference/docs)

## License

MIT License - see LICENSE file for details

## Author

Amit Bines
- Email: amit@bines.co.il
- GitHub: [@binesamit](https://github.com/binesamit)

## Changelog

### 1.0.0
- Initial release
- Dynamic column support
- Formula column reading
- Smart caching
- Simple & Advanced input modes
- API version management
