# micro-memfs
`micro-memfs` is a tiny in-memory "file system" for use in a simple applications that need a mocked file system i.e. unit testing, web apps or games.

- **Small** 860 bytes (minified + gzipped in empty esbuild project). [Size Limit](https://github.com/ai/size-limit) controls the size.
- **Self-contained** No dependencies. All utilities are managed internally (i.e. no reliance on `process.cwd()`)
- **Simple** For quick, small fake file systems there's no need for a fully mocked test-focused library weighing multiple kilobytes.

## API
For a full description of the API please see the generated TypeScript definition files in the built package.

## Licenses
- [nanopath](https://github.com/fabiospampinato/nanopath): MIT © Fabio Spampinato

## Contributions
Contributions are always welcome! Please submit them on GitHub :)