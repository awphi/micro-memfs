import { resolve } from "../src/nanopath";

const CHAR_FORWARD_SLASH = "/".charCodeAt(0);
const CHAR_DOT = ".".charCodeAt(0);

function normalizeString(path: string, allowAboveRoot: boolean): string {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let code = 0;
  for (let i = 0; i <= path.length; ++i) {
    if (i < path.length) code = path.charCodeAt(i);
    else if (code === CHAR_FORWARD_SLASH) break;
    else code = CHAR_FORWARD_SLASH;

    if (code === CHAR_FORWARD_SLASH) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (dots === 2) {
        if (
          res.length < 2 ||
          lastSegmentLength !== 2 ||
          res.charCodeAt(res.length - 1) !== CHAR_DOT ||
          res.charCodeAt(res.length - 2) !== CHAR_DOT
        ) {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = i;
            dots = 0;
            continue;
          } else if (res.length !== 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? `/..` : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) res += `/${path.slice(lastSlash + 1, i)}`;
        else res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === CHAR_DOT && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

// Ripped from node's `path` module
function resolveOld(args: string[], cwd: string) {
  let resolvedPath = "";
  let resolvedAbsolute = false;

  for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    const path = i >= 0 ? args[i] : cwd;

    // Skip empty entries
    if (path.length === 0) {
      continue;
    }

    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);

  if (resolvedAbsolute) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
}

const resolveInputs: [string[], string][] = [
  [[".."], "/b/c"],
  [["../h/../../g"], "/b/c/d/e/f/g/h"],
  [["a.txt"], "/"],
  [["./a.txt"], "/b/c/d/e"],
  [["../a/b/c.txt"], "/c/f/e"],
  [["/"], "/"],
  [[""], "/"],
  [["."], "/c/f/e"],
  [["./qysr/.././test.ts"], "/x"],
];

// Test our modified smaller resolve function against the original implementation ripped from node's `path` module
describe("resolve", () => {
  resolveInputs.forEach(([pth, cwd]) => {
    test("resolve vs. resolveOld path: " + pth + " cwd:" + cwd, () => {
      expect(resolve(cwd, ...pth)).toBe(resolveOld(pth, cwd));
    });
  });
});
