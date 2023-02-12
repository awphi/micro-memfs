import { normalizeString, resolve, CHAR_FORWARD_SLASH } from "../src/path";

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
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/");

  if (resolvedAbsolute) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
}

const resolveInputs: [string, string][] = [
  ["..", "/b/c"],
  ["../h/../../g", "/b/c/d/e/f/g/h"],
  ["a.txt", "/"],
  ["./a.txt", "/b/c/d/e"],
  ["../a/b/c.txt", "/c/f/e"],
  ["/", "/"],
  ["", "/"],
  [".", "/c/f/e"],
  ["./qysr/.././test.ts", "/x"],
];

// Test our modified smaller resolve function against the original implementation ripped from node's `path` module
describe("resolve", () => {
  resolveInputs.forEach(([pth, cwd]) => {
    test("resolve vs. resolveOld path: " + pth + " cwd:" + cwd, () => {
      expect(resolve(pth, cwd)).toBe(resolveOld([pth], cwd));
    });
  });
});
