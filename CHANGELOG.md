# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-06

### Added
- Initial release of n8n-nodes-mondaycom-simply
- Dynamic column type detection and mapping
- Support for all major Monday.com column types:
  - Status
  - Text & Long Text
  - Numbers
  - Date & Timeline
  - People
  - Dropdown
  - Email
  - Phone
  - Link
  - Checkbox
  - Rating
  - Tags
  - Board Relation
  - Dependency
  - Formula (read-only)
- Formula column reading with API 2024-01+ support
- Smart caching system to reduce API calls:
  - Board metadata (5 min TTL)
  - Column definitions (5 min TTL)
  - Linked board items (2 min TTL)
  - Users/Teams (10 min TTL)
- API version management:
  - Support for versions: 2023-10, 2024-01, 2024-04, 2025-07
  - Auto-upgrade feature for operations requiring newer API versions
  - Version compatibility warnings
- Two input modes:
  - Advanced mode: Traditional JSON input
  - Simple mode: Dynamic UI fields (coming in future update)
- Item operations:
  - Create item
  - Update item
  - Get item
  - Get all items
  - Delete item
  - Read formula columns
- Load options methods:
  - Load boards
  - Load columns
  - Load formula columns
  - Load users and teams
  - Load linked board items
  - Load status values

### Documentation
- Comprehensive README with examples
- API version migration guide
- Publishing guide for NPM
- MIT License

### Developer Features
- TypeScript support
- Modular architecture
- Extensible column mapper
- Type-safe API client
- Cache manager for performance optimization

## [Unreleased]

### Planned Features
- Simple mode UI implementation
- Query builder for complex filters
- Batch operations
- Webhook trigger support
- More column types support
- Update operations for formula columns (API 2024-04+)
- File upload support
- Advanced permissions (API 2025-07)

---

For more details, see the [README](README.md) and [Project Specification](Project%20specification.md).
