/*
  This file includes utilities from the nanopath library the micro-memfs needs. 
  They've been stripped out of nanopath itself for tree-shakability and to reduce bundle size.
  nanopath is licensed as follows:
  
  The MIT License (MIT) nanopath - https://github.com/fabiospampinato/nanopath

  Copyright (c) 2022-present Fabio Spampinato

  Permission is hereby granted, free of charge, to any person obtaining a
  copy of this software and associated documentation files (the "Software"),
  to deal in the Software without restriction, including without limitation
  the rights to use, copy, modify, merge, publish, distribute, sublicense,
  and/or sell copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
  DEALINGS IN THE SOFTWARE.
 */

type PathObject = {
  root: string;
  dir: string;
  base: string;
  name: string;
  ext: string;
};

function findLastIndex<T>(
  arr: ArrayLike<T>,
  iterator: (value: T, index: number, arr: ArrayLike<T>) => boolean
): number {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (iterator(arr[i], i, arr)) return i;
  }

  return -1;
}

function isAbsolute(path: string): boolean {
  return path.startsWith("/");
}

function normalize(path: string): string {
  const absolute = isAbsolute(path);
  const isTrailing = path.endsWith("/");
  const fallback = absolute ? "/" : isTrailing ? "./" : ".";

  path = path.replace(/\/+/g, "/");

  while (true) {
    let next = path;

    next = next.replace(/^\.\//, "");
    next = next.replace(/^\/+\.\.(\/|$)/, "/");
    next = next.replace(/^(?!\.\.\/)([^\/]+)\/+\.\.(?=\/|$)/, ".");
    next = next.replace(/\/+(?!\.\.\/)([^\/]+)\/+\.\.$/, "");
    next = next.replace(/\/+(?!\.\.\/)([^\/]+)\/+\.\.\//, "/");
    next = next.replace(/(^|\/)([^\/]+)\/+\.(?=\/|$)/, "$1$2");
    next = next.replace(/(^|\/)\.\//, "$1");
    next = next.replace(/(^|\/)\.(?=\/|$)/, "$1");

    if (next === path) break;

    path = next;
  }

  return path || fallback;
}

export function parse(path: string): PathObject {
  const re =
    /^((\/?)(?:.*(?=\/+[^\/]))?)\/?((\.?(?:.+(?=\.)|\.(?=\/|$)|[^\.\/]*))((?:\.[^\/]*)?))\/*$/;
  const match = re.exec(path) || ["", "", "", "", ""];
  const [, dir, root, base, name, ext] = match;

  return { root, dir, base, name, ext };
}

export function resolve(cwd: string, ...paths: string[]): string {
  if (!paths.length) return ".";

  let filtered = paths.filter(Boolean);

  if (!filtered.length) return cwd;

  const lastAbsoluteIndex = findLastIndex(filtered, isAbsolute);

  if (lastAbsoluteIndex > 0) {
    filtered = filtered.slice(lastAbsoluteIndex);
  }

  if (!isAbsolute(filtered[0])) {
    filtered.splice(0, 0, cwd);
  }

  const path = filtered.join("/").replace(/(.)\/+$/, "$1");

  return normalize(path);
}
