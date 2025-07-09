import { awscdk, JsonFile, Project, typescript } from "projen";
import { JobPermission } from "projen/lib/github/workflows-model";
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
  publishToPypi: {
    distName: projectMetadata.name,
    module: projectMetadata.name,
  },
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
    packages: ["src/packages/*", "src/packages/my-api/build/smithy/source/*"],
    version: "0.0.0",
    npmClient: "yarn",
  },
});
project.package.file.addOverride("private", true);
project.package.file.addOverride("workspaces", [
  "src/packages/*",
  "src/packages/my-api/build/smithy/source/*",
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
    releaseToNpm: true,
    publishToPypi: {
      distName: config.name,
      module: config.name,
    },
    workflowNodeVersion: "lts/*",
    release: true,
    releaseWorkflowSetupSteps: [
      {
        name: "Set Version",
        run: 'echo "version=${{ inputs.version }}" >> $GITHUB_OUTPUT',
        id: "next_version",
      },
    ],
    buildWorkflowTriggers: {
      workflowCall: {
        inputs: {
          version: {
            required: true,
            type: "string",
            description: "Version to release",
          },
        },
      },
    },
  });
  addTestTargets(tsProject);
  addPrettierConfig(tsProject);
  configureMarkDownLinting(tsProject);
  tsProject.package.file.addOverride("private", false);
  return tsProject;
};

createPackage({
  name: "ajithapackage",
  outdir: "src/packages/ajithapackage1",
});

const wf = project.github?.addWorkflow("release_smithy_ssdk");
if (wf) {
  wf.on({
    push: { branches: ["main"] },
    workflowDispatch: {},
    workflowCall: {
      inputs: {
        version: {
          required: true,
          type: "string",
          description: "Version to release"
        }
      }
    }
  });
  wf.addJobs({
    release: {
      runsOn: ["ubuntu-latest"],
      permissions: {
        contents: JobPermission.WRITE,
        idToken: JobPermission.WRITE,
      },
      outputs: {
        latest_commit: {
          stepId: "git_remote",
          outputName: "latest_commit",
        },
        next_version: {
          stepId: "next_version",
          outputName: "version",
        },
        tag_exists: {
          stepId: "check_tag_exists",
          outputName: "exists",
        },
      },
      env: {
        CI: "true",
      },
      defaults: {
        run: {
          workingDirectory:
            "./src/packages/my-api/build/smithy/source/typescript-ssdk-codegen",
        },
      },
      steps: [
        {
          name: "Checkout",
          uses: "actions/checkout@v4",
          with: { "fetch-depth": 0 },
        },
        {
          name: "Setup Node.js",
          uses: "actions/setup-node@v4",
          with: { "node-version": "lts/*" },
        },
        {
          name: "Install Dependencies",
          run: "yarn install --check-files --frozen-lockfile",
          workingDirectory: "./",
        },
        {
          name: "Determine Next Version",
          id: "next_version",
          run: [
            "PACKAGE_NAME=$(node -p \"require('./package.json').name\")",
            "CURRENT_VERSION=$(npm view $PACKAGE_NAME version 2>/dev/null || echo '0.0.0')",
            "NEXT_VERSION=$(echo $CURRENT_VERSION | awk -F. '{$NF = $NF + 1;} 1' | sed 's/ /./g')",
            'echo "Next version will be: $NEXT_VERSION"',
            'echo "version=$NEXT_VERSION" >> $GITHUB_OUTPUT',
          ].join(" && "),
        },
        {
          name: "Check if Tag Exists",
          id: "check_tag_exists",
          run: [
            'TAG="v${{ steps.next_version.outputs.version }}"',
            'echo "Checking for tag: $TAG"',
            'if git rev-parse "$TAG" >/dev/null 2>&1; then',
            '  echo "Tag exists=true"',
            '  echo "exists=true" >> $GITHUB_OUTPUT',
            "else",
            '  echo "Tag exists=false"',
            '  echo "exists=false" >> $GITHUB_OUTPUT',
            "fi",
            'echo "Output value:"',
            "cat $GITHUB_OUTPUT",
          ].join("\n"),
        },

        {
          name: "Create Tag",
          if: "steps.check_tag_exists.outputs.exists == 'false'",
          run: [
            'VERSION="${{ steps.next_version.outputs.version }}"',
            'git tag "v$VERSION"',
            'git push origin "v$VERSION"',
          ].join("\n"),
        },
        {
          name: "Check for new commits",
          id: "git_remote",
          run: 'echo "latest_commit=${{ github.sha }}" >> $GITHUB_OUTPUT',
        },
        {
          name: "Pack Artifact",
          run: "yarn pack --filename smithy-ssdk.tgz",
        },
        {
          name: "Upload Artifact",
          uses: "actions/upload-artifact@v4",
          with: {
            name: "build-artifact",
            path: "./src/packages/my-api/build/smithy/source/typescript-ssdk-codegen",
            overwrite: true,
          },
        },
      ],
    },
  });

  wf.addJobs({
    release_npm: {
      name: "Publish to NPM",
      needs: ["release"],
      runsOn: ["ubuntu-latest"],
      permissions: {
        contents: JobPermission.READ,
        idToken: JobPermission.WRITE,
      },
      if: "needs.release.outputs.tag_exists != 'true' && needs.release.outputs.latest_commit == github.sha",
      steps: [
        {
          uses: "actions/setup-node@v4",
          with: {
            "node-version": "lts/*",
            "registry-url": "https://registry.npmjs.org",
          },
        },
        {
          name: "Download Artifact",
          uses: "actions/download-artifact@v4",
          with: {
            name: "build-artifact",
            path: "./dist",
          },
        },
        {
          name: "Extract smithy-ssdk.tgz",
          run: [
            "mkdir repo",
            "tar -xzf ./dist/smithy-ssdk.tgz -C repo --strip-components=1",
          ].join(" && "),
        },
        {
          name: "Update Version",
          workingDirectory: "./repo",
          run: [
            'VERSION="${{ needs.release.outputs.next_version }}"',
            'sed -i "s/\\"version\\": \\".*\\"/\\"version\\": \\"$VERSION\\"/" package.json',
            'echo "Updated version to $VERSION"',
            "cat package.json | grep version",
          ].join(" && "),
        },
        {
          name: "Remove prepack script",
          workingDirectory: "./repo",
          run: "jq 'del(.scripts.prepack)' package.json > package.tmp.json && mv package.tmp.json package.json",
        },
        {
          name: "Publish",
          workingDirectory: "./repo",
          env: {
            NODE_AUTH_TOKEN: "${{ secrets.NPM_TOKEN_SMITHY }}",
          },
          run: "npm publish --access public",
        },
      ],
    },
  });

  wf.addJobs({
    release_github: {
      name: "Publish to GitHub Releases",
      needs: ["release", "release_npm"],
      runsOn: ["ubuntu-latest"],
      permissions: {
        contents: JobPermission.WRITE,
      },
      if: "needs.release.outputs.tag_exists != 'true' && needs.release.outputs.latest_commit == github.sha",
      steps: [
        {
          name: "Checkout", // Add this step
          uses: "actions/checkout@v4",
          with: { "fetch-depth": 0 },
        },
        {
          name: "Download Artifact",
          uses: "actions/download-artifact@v4",
          with: {
            name: "build-artifact",
            path: "./dist",
          },
        },
        {
          name: "GitHub Release",
          env: {
            GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}",
          },
          run: [
            'VERSION="${{ needs.release.outputs.next_version }}"',
            'echo "Creating release for version: v$VERSION"',
            'gh release create "v$VERSION" --title "v$VERSION" --notes "Automated release for SSDK" ./dist/smithy-ssdk.tgz',
          ].join(" && "),
        },
      ],
    },
  });
}
const wf1 = project.github?.addWorkflow("release_smithy_client");
if (wf1) {
  wf1.on({
    push: { branches: ["main"] },
    workflowDispatch: {},
    workflowCall: {
      inputs: {
        version: {
          required: true,
          type: "string",
          description: "Version to release"
        }
      }
    }
  });
  wf1.addJobs({
    release: {
      runsOn: ["ubuntu-latest"],
      permissions: {
        contents: JobPermission.WRITE,
        idToken: JobPermission.WRITE,
      },
      outputs: {
        latest_commit: {
          stepId: "git_remote",
          outputName: "latest_commit",
        },
        next_version: {
          stepId: "next_version",
          outputName: "version",
        },
        tag_exists: {
          stepId: "check_tag_exists",
          outputName: "exists",
        },
      },
      env: {
        CI: "true",
      },
      defaults: {
        run: {
          workingDirectory:
            "./src/packages/my-api/build/smithy/source/typescript-client-codegen",
        },
      },
      steps: [
        {
          name: "Checkout",
          uses: "actions/checkout@v4",
          with: { "fetch-depth": 0 },
        },
        {
          name: "Setup Node.js",
          uses: "actions/setup-node@v4",
          with: { "node-version": "lts/*" },
        },
        {
          name: "Install Dependencies",
          run: "yarn install --check-files --frozen-lockfile",
          workingDirectory: "./",
        },
        {
          name: "Determine Next Version",
          id: "next_version",
          run: [
            "PACKAGE_NAME=$(node -p \"require('./package.json').name\")",
            "CURRENT_VERSION=$(npm view $PACKAGE_NAME version 2>/dev/null || echo '0.0.0')",
            "NEXT_VERSION=$(echo $CURRENT_VERSION | awk -F. '{$NF = $NF + 1;} 1' | sed 's/ /./g')",
            'echo "Next version will be: $NEXT_VERSION"',
            'echo "version=$NEXT_VERSION" >> $GITHUB_OUTPUT',
          ].join(" && "),
        },
        {
          name: "Check if Tag Exists",
          id: "check_tag_exists",
          run: [
            'TAG="v${{ steps.next_version.outputs.version }}"',
            'echo "Checking for tag: $TAG"',
            'if git rev-parse "$TAG" >/dev/null 2>&1; then',
            '  echo "Tag exists=true"',
            '  echo "exists=true" >> $GITHUB_OUTPUT',
            "else",
            '  echo "Tag exists=false"',
            '  echo "exists=false" >> $GITHUB_OUTPUT',
            "fi",
            'echo "Output value:"',
            "cat $GITHUB_OUTPUT",
          ].join("\n"),
        },

        {
          name: "Create Tag",
          if: "steps.check_tag_exists.outputs.exists == 'false'",
          run: [
            'VERSION="${{ steps.next_version.outputs.version }}"',
            'git tag "v$VERSION"',
            'git push origin "v$VERSION"',
          ].join("\n"),
        },
        {
          name: "Check for new commits",
          id: "git_remote",
          run: 'echo "latest_commit=${{ github.sha }}" >> $GITHUB_OUTPUT',
        },
        {
          name: "Pack Artifact",
          run: "yarn pack --filename smithy-client.tgz",
        },
        {
          name: "Upload Artifact",
          uses: "actions/upload-artifact@v4",
          with: {
            name: "build-artifact",
            path: "./src/packages/my-api/build/smithy/source/typescript-client-codegen",
            overwrite: true,
          },
        },
      ],
    },
  });

  wf1.addJobs({
    release_npm: {
      name: "Publish to NPM",
      needs: ["release"],
      runsOn: ["ubuntu-latest"],
      permissions: {
        contents: JobPermission.READ,
        idToken: JobPermission.WRITE,
      },
      if: "needs.release.outputs.tag_exists != 'true' && needs.release.outputs.latest_commit == github.sha",
      steps: [
        {
          uses: "actions/setup-node@v4",
          with: {
            "node-version": "lts/*",
            "registry-url": "https://registry.npmjs.org",
          },
        },
        {
          name: "Download Artifact",
          uses: "actions/download-artifact@v4",
          with: {
            name: "build-artifact",
            path: "./dist",
          },
        },
        {
          name: "Extract smithy-client.tgz",
          run: [
            "mkdir repo",
            "tar -xzf ./dist/smithy-client.tgz -C repo --strip-components=1",
          ].join(" && "),
        },
        {
          name: "Update Version",
          workingDirectory: "./repo",
          run: [
            'VERSION="${{ needs.release.outputs.next_version }}"',
            'sed -i "s/\\"version\\": \\".*\\"/\\"version\\": \\"$VERSION\\"/" package.json',
            'echo "Updated version to $VERSION"',
            "cat package.json | grep version",
          ].join(" && "),
        },
        {
          name: "Remove prepack script",
          workingDirectory: "./repo",
          run: "jq 'del(.scripts.prepack)' package.json > package.tmp.json && mv package.tmp.json package.json",
        },
        {
          name: "Publish",
          workingDirectory: "./repo",
          env: {
            NODE_AUTH_TOKEN: "${{ secrets.NPM_TOKEN_SMITHY }}",
          },
          run: "npm publish --access public",
        },
      ],
    },
  });

  wf1.addJobs({
    release_github: {
      name: "Publish to GitHub Releases",
      needs: ["release", "release_npm"],
      runsOn: ["ubuntu-latest"],
      permissions: {
        contents: JobPermission.WRITE,
      },
      if: "needs.release.outputs.tag_exists != 'true' && needs.release.outputs.latest_commit == github.sha",
      steps: [
        {
          name: "Checkout", // Add this step
          uses: "actions/checkout@v4",
          with: { "fetch-depth": 0 },
        },
        {
          name: "Download Artifact",
          uses: "actions/download-artifact@v4",
          with: {
            name: "build-artifact",
            path: "./dist",
          },
        },
        {
          name: "GitHub Release",
          env: {
            GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}",
          },
          run: [
            'VERSION="${{ needs.release.outputs.next_version }}"',
            'echo "Creating release for version: v$VERSION"',
            'gh release create "v$VERSION" --title "v$VERSION" --notes "Automated release for CLIENT" ./dist/smithy-client.tgz',
          ].join(" && "),
        },
      ],
    },
  });
}

const release = project.github?.addWorkflow("c_release");
if (release) {
  release.on({
    push: { branches: ["release"] },
    workflowDispatch: {},
  });
  release.addJobs({
    bump_version: {
      runsOn: ["ubuntu-latest"],
      permissions: {
        contents: JobPermission.WRITE,
        idToken: JobPermission.WRITE,
      },
      outputs: {
        version: {
          stepId: "getver",
          outputName: "version",
        },
      },
      steps: [
        {
          name: "Checkout",
          uses: "actions/checkout@v4",
          with: { "fetch-depth": 0 },
        },
        {
          name: "Set Git Identity",
          run: [
            "git config --global user.email 'github-actions@github.com'",
            "git config --global user.name 'GitHub Actions'",
          ].join("\n"),
        },
        {
          name: "Run Projen Release",
          run: "npx projen release",
          workingDirectory: "packages/projen-core",
        },
        {
          name: "Read Version from releasetag.txt",
          id: "getver",
          run: [
            "VERSION=$(cat dist/releasetag.txt | sed 's/^v//')",
            'echo "version=$VERSION" >> $GITHUB_OUTPUT',
            'echo "Release version: $VERSION"',
          ].join("\n"),
        },
      ],
    },
    trigger_smithy_client: {
      needs: ["bump_version"],
      permissions: {
        contents: JobPermission.WRITE,
        idToken: JobPermission.WRITE,
      },
      uses: "./.github/workflows/release_smithy_client.yml",
      with: {
        version: "${{ needs.bump_version.outputs.version }}",
      },
    },
    trigger_smithy_ssdk: {
      needs: ["bump_version"],
      permissions: {
        contents: JobPermission.WRITE,
        idToken: JobPermission.WRITE,
      },
      uses: "./.github/workflows/release_smithy_ssdk.yml",
      with: {
        version: "${{ needs.bump_version.outputs.version }}",
      },
    },
  });
}
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
