import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const rootDir = process.cwd();

function collectTsxFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return collectTsxFiles(fullPath);
    }

    if (!entry.name.endsWith(".tsx")) {
      return [];
    }

    return [fullPath];
  });
}

const pageFiles = collectTsxFiles(path.join(rootDir, "app")).filter((file) =>
  /(page|not-found)\.tsx$/.test(file)
);

const componentFiles = collectTsxFiles(path.join(rootDir, "components"));

describe("page module smoke", () => {
  test.each(pageFiles)("imports %s", async (file) => {
    const mod = await import(pathToFileURL(file).href);

    expect(mod.default).toBeDefined();
  });
});

describe("component module smoke", () => {
  test.each(componentFiles)("imports %s", async (file) => {
    await expect(import(pathToFileURL(file).href)).resolves.toBeDefined();
  });
});
