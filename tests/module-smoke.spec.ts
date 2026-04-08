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

const pageSmokeExclusions = new Set([
  path.join(rootDir, "app", "(portfolio)", "js", "page.tsx"),
  path.join(rootDir, "app", "(portfolio-3D)", "home", "page.tsx"),
]);

const componentSmokeExclusions = new Set([
  path.join(rootDir, "components", "AxeModel.tsx"),
  path.join(rootDir, "components", "CapsuleModel.tsx"),
  path.join(rootDir, "components", "Display.tsx"),
  path.join(rootDir, "components", "FlatScreenModel.tsx"),
  path.join(rootDir, "components", "GuitarModel.tsx"),
  path.join(rootDir, "components", "PortfolioScene.tsx"),
  path.join(rootDir, "components", "RobotModel.tsx"),
]);

const pageFiles = collectTsxFiles(path.join(rootDir, "app"))
  .filter((file) => /(page|not-found)\.tsx$/.test(file))
  .filter((file) => !pageSmokeExclusions.has(file));

const componentFiles = collectTsxFiles(path.join(rootDir, "components")).filter(
  (file) =>
    !componentSmokeExclusions.has(file) &&
    !file.startsWith(path.join(rootDir, "components", "portfolio", "js")) &&
    !file.startsWith(path.join(rootDir, "components", "three"))
);

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
