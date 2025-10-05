# Contributing to n8n-nodes-mondaycom-simply

First off, thank you for considering contributing to this project! 🎉

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please create an issue with the following information:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Screenshots** if applicable
- **n8n version** you're using
- **Node version** of this package
- **Error messages** or logs

### Suggesting Features

Feature requests are welcome! Please include:

- **Clear description** of the feature
- **Use case** - why would this be useful?
- **Examples** if possible

### Pull Requests

1. **Fork** the repository
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test your changes** (run `npm run build`)
5. **Commit** with clear messages:
   ```bash
   git commit -m "Add feature: your feature description"
   ```
6. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request**

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

```bash
# Clone your fork
git clone git@github.com:YOUR_USERNAME/n8n-nodes-mondaycom-simply.git
cd n8n-nodes-mondaycom-simply

# Install dependencies
npm install

# Build
npm run build
```

### Project Structure

```
n8n-nodes-mondaycom-simply/
├── credentials/
│   └── MondayApi.credentials.ts    # API credentials
├── nodes/
│   └── Monday/
│       ├── Monday.node.ts          # Main node implementation
│       ├── descriptions/           # Node field descriptions
│       ├── methods/                # Load options methods
│       ├── utils/                  # Utility functions
│       │   ├── apiClient.ts        # Monday API client
│       │   ├── apiVersionManager.ts # API version handling
│       │   ├── cache.ts            # Caching system
│       │   └── columnMapper.ts     # Column type mapping
│       └── types/                  # TypeScript types
├── package.json
└── README.md
```

## Coding Guidelines

### TypeScript

- Use **TypeScript** for all code
- Enable **strict mode**
- Add **type definitions** for all functions
- Use **interfaces** for data structures

### Code Style

We use Prettier and ESLint:

```bash
# Format code
npm run format

# Lint code
npm run lint

# Fix linting issues
npm run lintfix
```

### Naming Conventions

- **Variables/Functions**: `camelCase`
- **Classes**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Files**: Match the class/export name

### Comments

- Add **JSDoc comments** for public functions
- Explain **why**, not **what** (code should be self-explanatory)
- Keep comments **up to date**

## Testing

Currently, we don't have automated tests, but please:

1. **Manual test** your changes
2. **Test with n8n** locally
3. **Verify** the build succeeds: `npm run build`

## Adding New Column Types

To add support for a new column type:

1. **Add type** to `types/Column.types.ts`
2. **Update ColumnMapper** in `utils/columnMapper.ts`:
   - Add to `mapColumnToUIField()`
   - Add to `mapValueToMondayFormat()`
   - Add to `validateColumnValue()` if needed
3. **Update README** with the new column type
4. **Test** with Monday.com

## Documentation

- Update **README.md** for user-facing changes
- Update **CHANGELOG.md** with your changes
- Add **inline comments** for complex logic

## Commit Messages

Use clear, descriptive commit messages:

```
feat: add support for color picker column type
fix: resolve caching issue for linked items
docs: update README with new examples
refactor: improve API client error handling
```

Prefixes:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## Questions?

Feel free to:
- Open an **issue** for questions
- Email: **amit@bines.co.il**

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🙏
