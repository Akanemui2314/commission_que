import { execFileSync } from "node:child_process";
for (const page of ["admin", "commission"]) {
  execFileSync(
    "npx",
    [
      "--yes",
      "esbuild@0.25.10",
      `${page}-page.js`,
      "--minify",
      `--outfile=${page}-page.min.js`,
    ],
    { stdio: "inherit" },
  );
}
execFileSync(
  "npx",
  [
    "--yes",
    "esbuild@0.25.10",
    "akane-studio.js",
    "--bundle",
    "--minify",
    "--format=iife",
    "--outfile=akane-studio-bundle.js",
  ],
  { stdio: "inherit" },
);
