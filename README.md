# micro-memfs
`micro-memfs` is a tiny in-memory "file system" for use in a simple applications that need a mocked file system i.e. unit testing, web apps or games.

We purposefully deviate from the node `fs` API somewhat to add extra utilities and to keep the API all in one bundle (e.g. not relying on `process.cwd()` and instead offering our own `fs.cwd()`. 

Multiple independent instances of `micro-memfs` can be safely created and used simultaneously. 

## API
For a full description of the API please see the generated TypeScript definition files in the built package.

## Contributions
Contributions are always welcome! Please submit them on GitHub :)