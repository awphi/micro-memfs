import { resolve, parse } from "./path";

export type CommandFunc = (args: string[]) => string[] | Promise<string[]>;

export interface MicroFs {
  exists(path: string): boolean;
  isDirectory(path: string): boolean;
  readFile(pth: string): string | undefined;
  readDir(pth: string): string[];
  cwd(): string;
  findExecutable(prog: string): CommandFunc | undefined;
}

function microfs(
  voldDefIn: { [path: string]: string } = Object.create(null),
  executablesIn: { [id: string]: CommandFunc } = Object.create(null)
): MicroFs {
  let cwd = "/";
  const volDef = Object.create(null);
  // Add our files and executables source code to the file system ensuring they're prefixed with cwd()
  Object.entries({ ...voldDefIn, ...executablesIn }).forEach(([file, f]) => {
    volDef[file.startsWith(cwd) ? file : cwd + file] = f.toString();
  });

  // Append cwd() to executables too and ensure object is of null prototype
  const executables: { [id: string]: CommandFunc } = Object.create(null);
  Object.entries(executablesIn).forEach(([file, f]) => {
    executables[file.startsWith(cwd) ? file : cwd + file] = f;
  });

  function resolvePath(path: string): string {
    return resolve([path], cwd);
  }

  const fs = {
    exists(pth: string): boolean {
      const res = resolvePath(pth);
      // Resolve all the unique directories present in the volume definition
      const dirs = [...new Set(Object.keys(volDef).map((d) => parse(d).dir))];
      return (
        res in volDef ||
        dirs.includes(res) ||
        dirs.some((d) => d.startsWith(res))
      );
    },
    isDirectory(pth: string): boolean {
      // Naive as hell but works for now
      const res = resolvePath(pth);
      return fs.exists(pth) && !res.includes(".") && !(res in executables);
    },
    readFile(pth: string): string | undefined {
      return volDef[resolvePath(pth)];
    },
    readDir(pth: string): string[] {
      const res = resolvePath(pth);
      const contents = Object.keys(volDef)
        .filter((a) => a.startsWith(res))
        .map((a) => {
          // Lob of the directory from the start of the URI
          const lobbed = a.split(res)[1];
          const parts = lobbed.split("/");
          // Only search 1 level deep, we take the min to deal with being at root (/)
          return parts[Math.min(parts.length - 1, 1)];
        });
      // Unique-ify
      return [...new Set(contents)];
    },
    cwd: (pth: string | undefined) => {
      if (pth !== undefined) {
        if (fs.isDirectory(pth)) {
          cwd = resolvePath(pth);
        } else {
          throw new Error(`Cannot set cwd to non-existent directory: ${pth}`);
        }
      }

      return cwd;
    },
    findExecutable: (prog: string): CommandFunc | null => {
      if (fs.exists(prog)) {
        const exe = resolvePath(`./${prog}`);
        if (exe in executables) {
          return executables[exe];
        }
      }
      return null;
    },
  };

  return fs;
}

export { microfs as default };
