# micro-memfs
`micro-memfs` is a tiny in-memory "file system" for use in a simple applications that need a mocked file system i.e. unit testing, web apps or games.

- **Small** 860 bytes (minified + gzipped in empty esbuild project). [Size Limit](https://github.com/ai/size-limit) controls the size.
- **Self-contained** No dependencies & all utilities are managed internally (i.e. no reliance on `process.cwd()`)
- **Simple** For quick, small fake file systems there's no need for a fully mocked test-focused library weighing multiple kilobytes.
- **Flexible** Supports "executables" to store/run JS and standard [`path`](https://nodejs.org/api/path.html)-like path resolution to support absolute and relative paths.

## API
The mock file system is made up of directories, files and "executables". 

Files map a path to some text. This text can encode whatever you'd like. A file must have an extension - e.g. `directory/file.txt`.

Executables are sync/async functions that will return some output. These are analogous to regular old binaries and thus their source code can be read with `readFile()` too.

```ts
type CommandFunc = (args: string[]) => string[] | Promise<string[]>;

interface MicroFs {
  /** Check if a path exists in the file system. */
  exists(path: string): boolean;
  /** Check if a given path is a directory or a file/doesn't exist. This method also ensures the path exists. */
  isDirectory(path: string): boolean;
  /** Read the text content of a file in the file system.  */
  readFile(pth: string): string | undefined;
  /** Read the contents of a directory in the file system. */
  readDir(pth: string): string[];
  /** Get or set the cwd (current working directory of this file system) */
  cwd(pth?: string): string;
  /** 
   * Find an "executable" in the file system returning a callable function if found. 
   * Use this to prevent your linter going crazy if you try to `eval()` the output from `readFile() `
   * */
  findExecutable(prog: string): CommandFunc | null;
}
```

## Example

```ts
import microfs from 'micro-memfs';

const fs = microfs({
  "usr/file.txt": "Some text content",
},
{
  "usr/emphasize": (args) => args.concat(["!"]),
});

fs.cwd() // '/'
fs.exists('usr') // true
fs.isDirectory('usr') // true
fs.cwd('usr') // '/usr'
fs.readFile('file.txt') // 'Some text content'
fs.readFile('emphasize') // '(args) => args.concat(["!"])'
const emphasize = fs.findExecutable("emphasize");
emphasize(['hello', 'world']) // -> ['hello', 'world']
fs.cwd('another-dir') // will throw an `Error` as /usr/another-dir doesn't exist
```

## TODO
- Support for empty directories
- File/directory addition/deletion after instantiation of the file system
- Extend tests to cover all methods

## Licenses
- [nanopath](https://github.com/fabiospampinato/nanopath): MIT © Fabio Spampinato

## Contributions
Contributions are always welcome! Please submit them on GitHub :)