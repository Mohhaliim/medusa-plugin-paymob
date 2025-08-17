# Publishing Guide for medusa-plugin-paymob

## Prerequisites

1. Make sure you have an npm account and are logged in:

   ```bash
   npm login
   ```

2. Ensure you're a member of the organization (if publishing under an org)

## Publishing Steps

### 1. Pre-publish Check

Run a dry-run to see what will be included in the package:

```bash
npm run publish:dry
```

### 2. Test the Build

Make sure everything builds correctly:

```bash
npm run build
```

### 3. Update Version (if needed)

Update the version in package.json:

```bash
npm version patch  # for bug fixes
npm version minor  # for new features
npm version major  # for breaking changes
```

### 4. Publish to npm

```bash
npm run publish:npm
```

Or manually:

```bash
npm publish
```

## What Gets Published

The following files/folders will be included in the npm package:

- `dist/` - Compiled JavaScript and TypeScript definitions
- `index.js` - Root entry point
- `package.json` - Package metadata
- `README.md` - Documentation

The following are excluded via `.npmignore`:

- `src/` - TypeScript source files
- `node_modules/` - Dependencies
- Development files (tests, configs, etc.)
- Build artifacts (`build/`, uploads, etc.)

## Package Structure

```
medusa-plugin-paymob/
├── dist/
│   ├── index.js           # Main entry point
│   ├── index.d.ts         # TypeScript definitions
│   ├── api/               # API routes
│   ├── services/          # Payment services
│   └── subscribers/       # Event subscribers
├── index.js               # Root server entry
└── package.json
```

## Verification

After publishing, you can verify the package:

1. Check on npmjs.com: https://www.npmjs.com/package/medusa-plugin-paymob
2. Install in a test project: `npm install medusa-plugin-paymob`
3. Test the plugin functionality

## Troubleshooting

- If build fails, check TypeScript compilation errors
- If admin build fails, it's okay - the server build is the main requirement for npm
- Make sure all dependencies are properly listed in package.json
- Verify the main entry point (`dist/index.js`) exists and exports correctly
