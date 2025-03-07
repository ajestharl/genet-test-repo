import { awscdk } from "projen";
const project = new awscdk.AwsCdkConstructLibrary({
  author: "Amazon OSPO",
  authorAddress: "osa-dev+puzzleglue@amazon.com",
  cdkVersion: "2.1.0",
  defaultReleaseBranch: "main",
  jsiiVersion: "~5.7.0",
  name: "genet-test-repo",
  projenrcTs: true,
  repositoryUrl: "https://github.com/ajestharl/genet-test-repo.git",
  docgen: true,
  github: true,
  gitignore: [".idea"],
  eslint: true,
  eslintOptions: {
    prettier: true,
    fileExtensions: [".ts", ".md"],
    dirs: ["src", "test", "docs"],
  },
  jestOptions: {
    jestConfig: {
      verbose: true,
    },
  },
  cdkVersionPinning: false,
  release: false,
  autoMerge: false,
  releaseToNpm: false,
  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();
