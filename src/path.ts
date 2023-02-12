const CHAR_FORWARD_SLASH = 47; /* / */
const CHAR_DOT = 46; /* . */

const StringPrototypeCharCodeAt = (str: string, idx: number) =>
  str.charCodeAt(idx);
const StringPrototypeSlice = (str: string, start: number, end: number) =>
  str.slice(start, end);
const StringPrototypeLastIndexOf = (str: string, s: string) =>
  str.lastIndexOf(s);

function isPosixPathSeparator(code) {
  return code === CHAR_FORWARD_SLASH;
}

function validateString(value: unknown, name: string) {
  if (typeof value !== "string")
    throw new Error(name + " must of type string.");
}

function normalizeString(path, allowAboveRoot, separator, isPathSeparator) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let code = 0;
  for (let i = 0; i <= path.length; ++i) {
    if (i < path.length) code = StringPrototypeCharCodeAt(path, i);
    else if (isPathSeparator(code)) break;
    else code = CHAR_FORWARD_SLASH;

    if (isPathSeparator(code)) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (dots === 2) {
        if (
          res.length < 2 ||
          lastSegmentLength !== 2 ||
          StringPrototypeCharCodeAt(res, res.length - 1) !== CHAR_DOT ||
          StringPrototypeCharCodeAt(res, res.length - 2) !== CHAR_DOT
        ) {
          if (res.length > 2) {
            const lastSlashIndex = StringPrototypeLastIndexOf(res, separator);
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = StringPrototypeSlice(res, 0, lastSlashIndex);
              lastSegmentLength =
                res.length - 1 - StringPrototypeLastIndexOf(res, separator);
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
          res += res.length > 0 ? `${separator}..` : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += `${separator}${StringPrototypeSlice(path, lastSlash + 1, i)}`;
        else res = StringPrototypeSlice(path, lastSlash + 1, i);
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

export function resolve(args: string[], cwd: string) {
  let resolvedPath = "";
  let resolvedAbsolute = false;

  for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    const path = i >= 0 ? args[i] : cwd;

    validateString(path, "path");

    // Skip empty entries
    if (path.length === 0) {
      continue;
    }

    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute =
      StringPrototypeCharCodeAt(path, 0) === CHAR_FORWARD_SLASH;
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeString(
    resolvedPath,
    !resolvedAbsolute,
    "/",
    isPosixPathSeparator
  );

  if (resolvedAbsolute) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
}

export interface PathObject {
  root: string;
  dir: string;
  base: string;
  ext: string;
  name: string;
}

export function parse(path: string): PathObject {
  validateString(path, "path");

  const ret = { root: "", dir: "", base: "", ext: "", name: "" };
  if (path.length === 0) return ret;
  const isAbsolute = StringPrototypeCharCodeAt(path, 0) === CHAR_FORWARD_SLASH;
  let start;
  if (isAbsolute) {
    ret.root = "/";
    start = 1;
  } else {
    start = 0;
  }
  let startDot = -1;
  let startPart = 0;
  let end = -1;
  let matchedSlash = true;
  let i = path.length - 1;

  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  let preDotState = 0;

  // Get non-dir info
  for (; i >= start; --i) {
    const code = StringPrototypeCharCodeAt(path, i);
    if (code === CHAR_FORWARD_SLASH) {
      // If we reached a path separator that was not part of a set of path
      // separators at the end of the string, stop now
      if (!matchedSlash) {
        startPart = i + 1;
        break;
      }
      continue;
    }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === CHAR_DOT) {
      // If this is our first dot, mark it as the start of our extension
      if (startDot === -1) startDot = i;
      else if (preDotState !== 1) preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (end !== -1) {
    const start = startPart === 0 && isAbsolute ? 1 : startPart;
    if (
      startDot === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      (preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)
    ) {
      ret.base = ret.name = StringPrototypeSlice(path, start, end);
    } else {
      ret.name = StringPrototypeSlice(path, start, startDot);
      ret.base = StringPrototypeSlice(path, start, end);
      ret.ext = StringPrototypeSlice(path, startDot, end);
    }
  }

  if (startPart > 0) ret.dir = StringPrototypeSlice(path, 0, startPart - 1);
  else if (isAbsolute) ret.dir = "/";

  return ret;
}
