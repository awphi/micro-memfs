import microfs from "../src/index";

describe("nanofs", () => {
  describe("exists", () => {
    test("simple exists", () => {
      const fs = microfs({
        "a.txt": "Text",
      });
      expect(fs.exists("a.txt")).toBe(true);
      expect(fs.exists("b.txt")).toBe(false);
    });
    test("nested exists", () => {
      const fs = microfs({
        "/b/c/d/a.txt": "Text",
      });
      expect(fs.exists("b/c/d/a.txt")).toBe(true);
      expect(fs.exists("b/c/d/n.txt")).toBe(false);
    });
    test("directory exists", () => {
      const fs = microfs({
        "/b/c/d/a.txt": "Text",
      });
      expect(fs.exists("b")).toBe(true);
      expect(fs.exists("c")).toBe(false);
    });
    test("nested directory exists", () => {
      const fs = microfs({
        "/b/c/d/a.txt": "Text",
      });
      expect(fs.exists("b/c/d")).toBe(true);
      expect(fs.exists("b/c/e")).toBe(false);
    });
    test("executable exists", () => {
      const fs = microfs(
        {},
        {
          a: () => ["output"],
        }
      );
      expect(fs.exists("a")).toBe(true);
      expect(fs.exists("b")).toBe(false);
    });
  });

  test("isDirectory", () => {
    const fs = microfs(
      {
        "/b/c.txt": "Text",
      },
      {
        a: () => ["output"],
      }
    );
    // Only directory in the fs should be true
    expect(fs.isDirectory("b")).toBe(true);
    // Non-existent dir/executable = false
    expect(fs.isDirectory("n")).toBe(false);
    // Executable = false
    expect(fs.isDirectory("a")).toBe(false);
    // File = false
    expect(fs.isDirectory("b/c.txt")).toBe(false);
    // Non-existent file = false
    expect(fs.isDirectory("b/q.txt")).toBe(false);
  });

  describe("cwd", () => {
    test("basic changing of cwd", () => {
      const fs = microfs({
        "a/t.txt": "Text",
      });
      expect(fs.cwd()).toBe("/");
      fs.cwd("/a");
      expect(fs.cwd()).toBe("/a");
    });

    test("relative changing of cwd", () => {
      const fs = microfs({
        "a/b/t.txt": "Text",
      });
      fs.cwd("/a");
      fs.cwd("/..");
      expect(fs.cwd()).toBe("/");
    });
  });

  // TODO tests for all the API
});
