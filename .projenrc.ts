import { awscdk, JsonFile, Project, typescript } from "projen";
import { TypeScriptAppProject } from "projen/lib/typescript";

const projectMetadata = {
  author: "Ajitha",
  authorAddress: "ajithamanit@gmail.com",
  repositoryUrl: "https://github.com/ajestharl/genet-test-repo.git",
  cdkVersion: "2.1.0",
  defaultReleaseBranch: "main",
  name: "genet-test-repo",
};

export const configureMarkDownLinting = (tsProject: TypeScriptAppProject) => {
  tsProject.addDevDeps(
    "eslint-plugin-md",
    "markdown-eslint-parser",
    "eslint-plugin-prettier",
  );
  tsProject.eslint?.addExtends(
    "plugin:md/recommended",
    "plugin:prettier/recommended",
  );
  tsProject.eslint?.addOverride({
    files: ["*.md"],
    parser: "markdown-eslint-parser",
    rules: {
      "prettier/prettier": ["error", { parser: "markdown" }],
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/return-await": "off",
      quotes: "off",
    },
  });
  tsProject.eslint?.addRules({
    "prettier/prettier": "error",
    "md/remark": [
      "error",
      {
        plugins: [
          "preset-lint-markdown-style-guide",
          ["lint-list-item-indent", "space"],
        ],
      },
    ],
  });
};

export const addTestTargets = (subProject: Project) => {
  const eslintTask = subProject.tasks.tryFind("eslint");
  const testTask = subProject.tasks.tryFind("test");
  if (testTask && eslintTask) {
    testTask.reset();
    testTask.exec(
      "jest --passWithNoTests --updateSnapshot --testPathIgnorePatterns=.*\\.accept\\.test\\.ts$",
      {
        receiveArgs: true,
      },
    );
    testTask.spawn(eslintTask);
  }

  const acceptTask = subProject.addTask("accept", {
    description: "Run all acceptance tests",
  });
  const defaultTask = subProject.tasks.tryFind("default");
  if (defaultTask) acceptTask.spawn(defaultTask);

  const preCompileTask = subProject.tasks.tryFind("pre-compile");
  if (preCompileTask) acceptTask.spawn(preCompileTask);

  const compileTask = subProject.tasks.tryFind("compile");
  if (compileTask) acceptTask.spawn(compileTask);

  const postCompileTask = subProject.tasks.tryFind("post-compile");
  if (postCompileTask) acceptTask.spawn(postCompileTask);

  acceptTask.exec("jest --passWithNoTests --updateSnapshot --group=accept", {
    receiveArgs: true,
  });
};

const project = new awscdk.AwsCdkConstructLibrary({
  ...projectMetadata,
  jsiiVersion: "~5.7.0",
  projenrcTs: true,
  docgen: true,
  github: true,
  gitignore: [".idea", "API.md"],
  eslint: true,
  eslintOptions: {
    prettier: true,
    fileExtensions: [".ts", ".md"],
    dirs: ["src", "test", "docs"],
    ignorePatterns: ["src/packages/smithy/build/**/*"],
  },
  jestOptions: {
    jestConfig: {
      verbose: true,
    },
  },
  cdkVersionPinning: false,
  release: true,
  autoMerge: false,
  releaseToNpm: false,
  constructsVersion: "10.4.2",
  packageName: "@example/genet-test-repo",
  description: "Test Package",
  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});

if (project.github) {
  const buildWorkflow = project.github?.tryFindWorkflow("build");
  if (buildWorkflow && buildWorkflow.file) {
    buildWorkflow.file.addOverride("jobs.build.permissions.contents", "read");
    buildWorkflow.file.addOverride("jobs.build.env", {
      CI: "true",
      // Increasing heap size to mitigate potential "heap out of memory" errors during ESLint execution.
      // TODO: Need to find a better way to do this, but this works for now.
      NODE_OPTIONS: "--max-old-space-size=8192",
    });
  }
}
// Add Lerna configuration file (lerna.json)
new JsonFile(project, "lerna.json", {
  obj: {
    packages: ["src/packages/*", "src/packages/smithy/build/smithy/source/*"],
    version: "0.0.0",
    npmClient: "yarn",
  },
});

// Add workflow for smithy client package
new JsonFile(project, ".github/workflows/release_hello_client.yml", {
  obj: {
    name: "release_hello_client",
    on: {
      push: {
        branches: ["main"],
      },
      workflow_dispatch: {},
    },
    concurrency: {
      group: "${{ github.workflow }}",
      "cancel-in-progress": false,
    },
    jobs: {
      release: {
        "runs-on": "ubuntu-latest",
        permissions: {
          contents: "write",
        },
        outputs: {
          latest_commit: "${{ steps.git_remote.outputs.latest_commit }}",
          tag_exists: "${{ steps.check_tag_exists.outputs.exists }}",
        },
        env: {
          CI: "true",
        },
        defaults: {
          run: {
            "working-directory":
              "./src/packages/smithy/build/smithy/source/typescript-client-codegen",
          },
        },
        steps: [
          {
            name: "Checkout",
            uses: "actions/checkout@v4",
            with: {
              "fetch-depth": 0,
            },
          },
          {
            name: "Set git identity",
            run: 'git config user.name "github-actions"\ngit config user.email "github-actions@github.com"',
          },
          {
            name: "Setup Node.js",
            uses: "actions/setup-node@v4",
            with: {
              "node-version": "lts/*",
            },
          },
          {
            name: "Install dependencies",
            run: "yarn install --check-files --frozen-lockfile",
            "working-directory": "./",
          },
          {
            name: "release",
            run: "npx projen release",
          },
          {
            name: "Check if version has already been tagged",
            id: "check_tag_exists",
            run: 'TAG=$(cat dist/releasetag.txt)\n([ ! -z "$TAG" ] && git ls-remote -q --exit-code --tags origin $TAG && (echo "exists=true" >> $GITHUB_OUTPUT)) || (echo "exists=false" >> $GITHUB_OUTPUT)\ncat $GITHUB_OUTPUT',
          },
          {
            name: "Check for new commits",
            id: "git_remote",
            run: 'echo "latest_commit=$(git ls-remote origin -h ${{ github.ref }} | cut -f1)" >> $GITHUB_OUTPUT\ncat $GITHUB_OUTPUT',
          },
          {
            name: "Backup artifact permissions",
            if: "${{ steps.git_remote.outputs.latest_commit == github.sha }}",
            run: "cd dist && getfacl -R . > permissions-backup.acl",
            "continue-on-error": true,
          },
          {
            name: "Upload artifact",
            if: "${{ steps.git_remote.outputs.latest_commit == github.sha }}",
            uses: "actions/upload-artifact@v4.4.0",
            with: {
              name: "build-artifact",
              path: "src/packages/smithy/build/smithy/source/typescript-client-codegen/dist",
              overwrite: true,
            },
          },
        ],
      },
      release_github: {
        name: "Publish to GitHub Releases",
        needs: ["release", "release_npm"],
        "runs-on": "ubuntu-latest",
        permissions: {
          contents: "write",
        },
        if: "needs.release.outputs.tag_exists != 'true' && needs.release.outputs.latest_commit == github.sha",
        steps: [
          {
            uses: "actions/setup-node@v4",
            with: {
              "node-version": "lts/*",
            },
          },
          {
            name: "Download build artifacts",
            uses: "actions/download-artifact@v4",
            with: {
              name: "build-artifact",
              path: "dist",
            },
          },
          {
            name: "Restore build artifact permissions",
            run: "cd dist && setfacl --restore=permissions-backup.acl",
            "continue-on-error": true,
          },
          {
            name: "Release",
            env: {
              GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}",
              GITHUB_REPOSITORY: "${{ github.repository }}",
              GITHUB_REF: "${{ github.sha }}",
            },
            run: 'errout=$(mktemp); gh release create $(cat dist/releasetag.txt) -R $GITHUB_REPOSITORY -F dist/changelog.md -t $(cat dist/releasetag.txt) --target $GITHUB_REF 2> $errout && true; exitcode=$?; if [ $exitcode -ne 0 ] && ! grep -q "Release.tag_name already exists" $errout; then cat $errout; exit $exitcode; fi',
          },
        ],
      },
      release_npm: {
        name: "Publish to npm",
        needs: "release",
        "runs-on": "ubuntu-latest",
        permissions: {
          "id-token": "write",
          contents: "read",
        },
        if: "needs.release.outputs.tag_exists != 'true' && needs.release.outputs.latest_commit == github.sha",
        steps: [
          {
            uses: "actions/setup-node@v4",
            with: {
              "node-version": "lts/*",
            },
          },
          {
            name: "Download build artifacts",
            uses: "actions/download-artifact@v4",
            with: {
              name: "build-artifact",
              path: "dist",
            },
          },
          {
            name: "Restore build artifact permissions",
            run: "cd dist && setfacl --restore=permissions-backup.acl",
            "continue-on-error": true,
          },
          {
            name: "Checkout",
            uses: "actions/checkout@v4",
            with: {
              path: ".repo",
            },
          },
          {
            name: "Install Dependencies",
            run: "cd .repo && yarn install --check-files --frozen-lockfile",
          },
          {
            name: "Extract build artifact",
            run: "tar --strip-components=1 -xzvf dist/js/*.tgz -C .repo",
          },
          {
            name: "Move build artifact out of the way",
            run: "mv dist dist.old",
          },
          {
            name: "Create js artifact",
            run: "cd .repo && npx projen package:js",
          },
          {
            name: "Collect js artifact",
            run: "mv .repo/dist dist",
          },
          {
            name: "Release",
            env: {
              NPM_DIST_TAG: "latest",
              NPM_REGISTRY: "registry.npmjs.org",
              NPM_CONFIG_PROVENANCE: "true",
              NPM_TOKEN: "${{ secrets.NPM_TOKEN }}",
            },
            run: "npx -p publib@latest publib-npm",
          },
        ],
      },
    },
  },
  committed: true,
});

// Add workflow for smithy server package
new JsonFile(project, ".github/workflows/release_hello_server.yml", {
  obj: {
    name: "release_hello_server",
    on: {
      push: {
        branches: ["main"],
      },
      workflow_dispatch: {},
    },
    concurrency: {
      group: "${{ github.workflow }}",
      "cancel-in-progress": false,
    },
    jobs: {
      release: {
        "runs-on": "ubuntu-latest",
        permissions: {
          contents: "write",
        },
        outputs: {
          latest_commit: "${{ steps.git_remote.outputs.latest_commit }}",
          tag_exists: "${{ steps.check_tag_exists.outputs.exists }}",
        },
        env: {
          CI: "true",
        },
        defaults: {
          run: {
            "working-directory":
              "./src/packages/smithy/build/smithy/source/typescript-ssdk-codegen",
          },
        },
        steps: [
          {
            name: "Checkout",
            uses: "actions/checkout@v4",
            with: {
              "fetch-depth": 0,
            },
          },
          {
            name: "Set git identity",
            run: 'git config user.name "github-actions"\ngit config user.email "github-actions@github.com"',
          },
          {
            name: "Setup Node.js",
            uses: "actions/setup-node@v4",
            with: {
              "node-version": "lts/*",
            },
          },
          {
            name: "Install dependencies",
            run: "yarn install --check-files --frozen-lockfile",
            "working-directory": "./",
          },
          {
            name: "release",
            run: "npx projen release",
          },
          {
            name: "Check if version has already been tagged",
            id: "check_tag_exists",
            run: 'TAG=$(cat dist/releasetag.txt)\n([ ! -z "$TAG" ] && git ls-remote -q --exit-code --tags origin $TAG && (echo "exists=true" >> $GITHUB_OUTPUT)) || (echo "exists=false" >> $GITHUB_OUTPUT)\ncat $GITHUB_OUTPUT',
          },
          {
            name: "Check for new commits",
            id: "git_remote",
            run: 'echo "latest_commit=$(git ls-remote origin -h ${{ github.ref }} | cut -f1)" >> $GITHUB_OUTPUT\ncat $GITHUB_OUTPUT',
          },
          {
            name: "Backup artifact permissions",
            if: "${{ steps.git_remote.outputs.latest_commit == github.sha }}",
            run: "cd dist && getfacl -R . > permissions-backup.acl",
            "continue-on-error": true,
          },
          {
            name: "Upload artifact",
            if: "${{ steps.git_remote.outputs.latest_commit == github.sha }}",
            uses: "actions/upload-artifact@v4.4.0",
            with: {
              name: "build-artifact",
              path: "src/packages/smithy/build/smithy/source/typescript-ssdk-codegen/dist",
              overwrite: true,
            },
          },
        ],
      },
      release_github: {
        name: "Publish to GitHub Releases",
        needs: ["release", "release_npm"],
        "runs-on": "ubuntu-latest",
        permissions: {
          contents: "write",
        },
        if: "needs.release.outputs.tag_exists != 'true' && needs.release.outputs.latest_commit == github.sha",
        steps: [
          {
            uses: "actions/setup-node@v4",
            with: {
              "node-version": "lts/*",
            },
          },
          {
            name: "Download build artifacts",
            uses: "actions/download-artifact@v4",
            with: {
              name: "build-artifact",
              path: "dist",
            },
          },
          {
            name: "Restore build artifact permissions",
            run: "cd dist && setfacl --restore=permissions-backup.acl",
            "continue-on-error": true,
          },
          {
            name: "Release",
            env: {
              GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}",
              GITHUB_REPOSITORY: "${{ github.repository }}",
              GITHUB_REF: "${{ github.sha }}",
            },
            run: 'errout=$(mktemp); gh release create $(cat dist/releasetag.txt) -R $GITHUB_REPOSITORY -F dist/changelog.md -t $(cat dist/releasetag.txt) --target $GITHUB_REF 2> $errout && true; exitcode=$?; if [ $exitcode -ne 0 ] && ! grep -q "Release.tag_name already exists" $errout; then cat $errout; exit $exitcode; fi',
          },
        ],
      },
      release_npm: {
        name: "Publish to npm",
        needs: "release",
        "runs-on": "ubuntu-latest",
        permissions: {
          "id-token": "write",
          contents: "read",
        },
        if: "needs.release.outputs.tag_exists != 'true' && needs.release.outputs.latest_commit == github.sha",
        steps: [
          {
            uses: "actions/setup-node@v4",
            with: {
              "node-version": "lts/*",
            },
          },
          {
            name: "Download build artifacts",
            uses: "actions/download-artifact@v4",
            with: {
              name: "build-artifact",
              path: "dist",
            },
          },
          {
            name: "Restore build artifact permissions",
            run: "cd dist && setfacl --restore=permissions-backup.acl",
            "continue-on-error": true,
          },
          {
            name: "Checkout",
            uses: "actions/checkout@v4",
            with: {
              path: ".repo",
            },
          },
          {
            name: "Install Dependencies",
            run: "cd .repo && yarn install --check-files --frozen-lockfile",
          },
          {
            name: "Extract build artifact",
            run: "tar --strip-components=1 -xzvf dist/js/*.tgz -C .repo",
          },
          {
            name: "Move build artifact out of the way",
            run: "mv dist dist.old",
          },
          {
            name: "Create js artifact",
            run: "cd .repo && npx projen package:js",
          },
          {
            name: "Collect js artifact",
            run: "mv .repo/dist dist",
          },
          {
            name: "Release",
            env: {
              NPM_DIST_TAG: "latest",
              NPM_REGISTRY: "registry.npmjs.org",
              NPM_CONFIG_PROVENANCE: "true",
              NPM_TOKEN: "${{ secrets.NPM_TOKEN }}",
            },
            run: "npx -p publib@latest publib-npm",
          },
        ],
      },
    },
  },
  committed: true,
});
project.package.file.addOverride("private", true);
project.package.file.addOverride("workspaces", [
  "src/packages/*",
  "src/packages/smithy/build/smithy/source/*",
]);
// Run Lerna build one package at a time and,
// waits for each package to complete before showing its logs.
project.preCompileTask.exec("npx lerna run build --concurrency=1 --no-stream");
project.addScripts({
  "import-private-key":
    "ts-node src/packages/app-framework-ops-tools/src/importPrivateKey.ts",
  "get-table-name":
    "ts-node src/packages/app-framework-ops-tools/src/getTableName.ts",
});

addTestTargets(project);
configureMarkDownLinting(project);

interface PackageConfig {
  name: string;
  outdir: string;
  deps?: string[];
  devDeps?: string[];
  bundledDeps?: string[];
}
const addPrettierConfig = (projectType: Project) => {
  new JsonFile(projectType, ".prettierrc.json", {
    obj: {
      singleQuote: true,
      trailingComma: "all",
    },
  });
};

export const createPackage = (config: PackageConfig) => {
  const tsProject = new awscdk.AwsCdkConstructLibrary({
    ...projectMetadata,
    name: config.name,
    outdir: config.outdir,
    parent: project,
    deps: config.deps,
    devDeps: config.devDeps,
    bundledDeps: config.bundledDeps,
    docgen: false,
    packageName: config.name,
    release: true,
    releaseToNpm: true,
  });
  addTestTargets(tsProject);
  addPrettierConfig(tsProject);
  configureMarkDownLinting(tsProject);
  tsProject.package.file.addOverride("private", false);
  return tsProject;
};

createPackage({
  name: "ajithapackage1",
  outdir: "src/packages/ajithapackage1",
});

const package2 = new typescript.TypeScriptProject({
  ...projectMetadata,
  name: "ajithapackage2",
  outdir: "src/packages/ajithapackage2",
  parent: project,
  projenrcTs: false,
  release: true,
  releaseToNpm: true,
  repository: projectMetadata.repositoryUrl,
});
addTestTargets(package2);
addPrettierConfig(package2);
configureMarkDownLinting(package2);
package2.package.file.addOverride("private", false);
project.synth();
