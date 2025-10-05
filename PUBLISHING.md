# Publishing Guide

## Prerequisites

1. **NPM Account**: You need an NPM account. Sign up at [npmjs.com](https://www.npmjs.com)
2. **Login to NPM**: Run `npm login` in your terminal
3. **Organization Access**: Make sure you have access to the `@bines` organization on NPM

## Pre-Publishing Checklist

- [ ] All tests pass (if you have tests)
- [ ] Documentation is up to date
- [ ] Version number is updated in `package.json`
- [ ] CHANGELOG is updated
- [ ] Build is successful (`npm run build`)

## Publishing Steps

### 1. Update Version

Update the version in `package.json`:

```json
{
  "version": "1.0.0"
}
```

Or use npm version command:

```bash
# Patch version (1.0.0 -> 1.0.1)
npm version patch

# Minor version (1.0.0 -> 1.1.0)
npm version minor

# Major version (1.0.0 -> 2.0.0)
npm version major
```

### 2. Build the Package

```bash
npm run build
```

This will:
- Compile TypeScript to JavaScript
- Copy icons to dist folder
- Generate type declarations

### 3. Test the Package Locally (Optional)

```bash
npm pack
```

This creates a `.tgz` file you can test locally.

### 4. Publish to NPM

```bash
npm publish --access public
```

**Note**: The `--access public` flag is required for scoped packages (@bines/...).

### 5. Verify Publication

Check your package at:
```
https://www.npmjs.com/package/@bines/n8n-nodes-mondaycom-simply
```

## Installation in n8n

Users can install your node in n8n in several ways:

### Method 1: Via n8n UI (n8n Cloud or self-hosted 0.199.0+)

1. Go to **Settings** → **Community Nodes**
2. Click **Install**
3. Enter: `@bines/n8n-nodes-mondaycom-simply`
4. Click **Install**

### Method 2: Via npm (Self-hosted)

```bash
cd ~/.n8n/custom
npm install @bines/n8n-nodes-mondaycom-simply
```

Then restart n8n.

### Method 3: Docker

Add to your `Dockerfile`:

```dockerfile
FROM n8nio/n8n

USER root
RUN cd /usr/local/lib/node_modules/n8n && \
    npm install @bines/n8n-nodes-mondaycom-simply
USER node
```

## Updating the Package

1. Make your changes
2. Update version number
3. Commit changes
4. Run `npm publish --access public` again

## Troubleshooting

### Error: "You do not have permission to publish"

Make sure you're logged in:
```bash
npm whoami
npm login
```

### Error: "Package already exists"

You need to update the version number in `package.json`.

### Error: "Access denied to scoped package"

Use the `--access public` flag:
```bash
npm publish --access public
```

## Resources

- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [NPM Publishing Guide](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages)
- [Semantic Versioning](https://semver.org/)

## Support

For issues or questions:
- GitHub Issues: https://github.com/binesamit/n8n-nodes-mondaycom-simply/issues
- Email: amit@bines.co.il
