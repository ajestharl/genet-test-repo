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
    release: false,
    releaseToNpm: false,
    publishToPypi: {
      distName: config.name,
      module: config.name,
    },
    workflowNodeVersion: "lts/*",
  });
  addTestTargets(tsProject);
  addPrettierConfig(tsProject);
  configureMarkDownLinting(tsProject);
  tsProject.package.file.addOverride("private", false);
  tsProject.addTask("release", {
    steps: [
      {
        exec: `CURRENT=$(npm view ${config.name} version 2>/dev/null || echo '0.0.0') && echo $CURRENT > .version.tmp`,
      },
      {
        exec: `VERSION=$(awk -F. '{$NF+=1; print $1"."$2"."$3}' .version.tmp) && echo $VERSION > .version.bumped`,
      },
      {
        exec: `TAG=v$(cat .version.bumped) && git tag $TAG && git push origin $TAG`,
      },
      {
        exec: "mkdir -p dist && echo v$(cat .version.bumped) > dist/releasetag.txt",
      },
    ],
  });

  return tsProject;
};

createPackage({
  name: "ajithapackage",
  outdir: "src/packages/ajithapackage1",
});

// Workflows
// Smithy SSDK
const wf = project.github?.addWorkflow("release_smithy_ssdk");
if (wf) {
  wf.on({
    workflowCall: {
      inputs: {
        version: { required: true, type: "string" },
      },
    },
  });

  wf.addJobs({
    release_npm: {
      runsOn: ["ubuntu-latest"],
      permissions: {
        contents: JobPermission.READ,
        idToken: JobPermission.WRITE,
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
          with: {
            "node-version": "lts/*",
            "registry-url": "https://registry.npmjs.org",
          },
        },
        {
          name: "Install dependencies",
          run: "yarn install --check-files --frozen-lockfile",
        },
        {
          name: "Build SSDK",
          run: "yarn build",
          workingDirectory:
            "src/packages/my-api/build/smithy/source/typescript-ssdk-codegen",
        },
        {
          name: "Pack artifact",
          run: "yarn pack --filename smithy-ssdk.tgz",
          workingDirectory:
            "src/packages/my-api/build/smithy/source/typescript-ssdk-codegen",
        },
        {
          name: "Extract artifact",
          run: [
            "mkdir repo",
            "tar -xzf src/packages/my-api/build/smithy/source/typescript-ssdk-codegen/smithy-ssdk.tgz -C repo --strip-components=1",
          ].join(" && "),
        },
        {
          name: "Patch version",
          workingDirectory: "repo",
          run: [
            "jq '.version = \"${{ inputs.version }}\"' package.json > tmp.json",
            "mv tmp.json package.json",
            "cat package.json | grep version",
          ].join(" && "),
        },
        {
          name: "Remove prepack",
          workingDirectory: "repo",
          run: "jq 'del(.scripts.prepack)' package.json > tmp.json && mv tmp.json package.json",
        },
        {
          name: "Publish to npm",
          workingDirectory: "repo",
          env: {
            NODE_AUTH_TOKEN: "${{ secrets.TOKEN }}",
          },
          run: "npm publish --access public",
        },
      ],
    },

    release_github: {
      name: "Publish GitHub Release",
      needs: ["release_npm"],
      runsOn: ["ubuntu-latest"],
      permissions: {
        contents: JobPermission.WRITE,
      },
      steps: [
        {
          name: "Checkout",
          uses: "actions/checkout@v4",
        },
        {
          name: "GitHub release",
          env: {
            GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}",
          },
          run: [
            'gh release create "v${{ inputs.version }}"',
            '--title "v${{ inputs.version }}"',
            '--notes "Automated release for SSDK"',
            "src/packages/my-api/build/smithy/source/typescript-ssdk-codegen/smithy-ssdk.tgz",
          ].join(" "),
        },
      ],
    },
  });
}


// Smithy Client
const wf1 = project.github?.addWorkflow("release_smithy_client");
if (wf1) {
  wf1.on({
    workflowCall: {
      inputs: {
        version: { required: true, type: "string" },
      },
    },
  });

  wf1.addJobs({
    release_npm: {
      runsOn: ["ubuntu-latest"],
      permissions: {
        contents: JobPermission.READ,
        idToken: JobPermission.WRITE,
      },
      steps: [
        {
          name: "Checkout",
          uses: "actions/checkout@v4",
        },
        {
          name: "Setup Node.js",
          uses: "actions/setup-node@v4",
          with: {
            "node-version": "lts/*",
            "registry-url": "https://registry.npmjs.org",
          },
        },
        {
          name: "Install dependencies",
          run: "yarn install --check-files --frozen-lockfile",
        },
        {
          name: "Build Client",
          run: "yarn build",
          workingDirectory:
            "src/packages/my-api/build/smithy/source/typescript-client-codegen",
        },
        {
          name: "Pack artifact",
          run: "yarn pack --filename smithy-client.tgz",
          workingDirectory:
            "src/packages/my-api/build/smithy/source/typescript-client-codegen",
        },
        {
          name: "Extract artifact",
          run: [
            "mkdir repo",
            "tar -xzf src/packages/my-api/build/smithy/source/typescript-client-codegen/smithy-client.tgz -C repo --strip-components=1",
          ].join(" && "),
        },
        {
          name: "Patch version",
          workingDirectory: "repo",
          run: [
            "jq '.version = \"${{ inputs.version }}\"' package.json > tmp.json",
            "mv tmp.json package.json",
            "cat package.json | grep version",
          ].join(" && "),
        },
        {
          name: "Remove prepack",
          workingDirectory: "repo",
          run: "jq 'del(.scripts.prepack)' package.json > tmp.json && mv tmp.json package.json",
        },
        {
          name: "Publish to npm",
          workingDirectory: "repo",
          env: {
            NODE_AUTH_TOKEN: "${{ secrets.TOKEN }}",
          },
          run: "npm publish --access public",
        },
      ],
    },

    release_github: {
      name: "Publish GitHub Release",
      needs: ["release_npm"],
      runsOn: ["ubuntu-latest"],
      permissions: {
        contents: JobPermission.WRITE,
      },
      steps: [
        {
          name: "Checkout",
          uses: "actions/checkout@v4",
        },
        {
          name: "GitHub release",
          env: {
            GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}",
          },
          run: [
            'gh release create "v${{ inputs.version }}"',
            '--title "v${{ inputs.version }}"',
            '--notes "Automated release for CLIENT"',
            "src/packages/my-api/build/smithy/source/typescript-client-codegen/smithy-client.tgz",
          ].join(" "),
        },
      ],
    },
  });
}

// Projen ajithapackage
const aj1 = project.github?.addWorkflow("release_ajithapackage");
aj1?.on({
  workflowCall: {
    inputs: {
      version: {
        required: true,
        type: "string",
      },
    },
  },
});
aj1?.addJobs({
  release: {
    runsOn: ["ubuntu-latest"],
    permissions: {
      contents: JobPermission.WRITE,
      idToken: JobPermission.WRITE,
    },
    outputs: {
      version: { stepId: "read_version", outputName: "version" },
    },
    defaults: {
      run: {
        workingDirectory: "src/packages/ajithapackage1",
      },
    },
    steps: [
      {
        name: "Checkout",
        uses: "actions/checkout@v4",
        with: { "fetch-depth": 0 },
      },
      {
        name: "Set Git identity",
        run: [
          'git config user.name "github-actions"',
          'git config user.email "github-actions@github.com"',
        ].join("\n"),
      },
      {
        name: "Setup Node.js",
        uses: "actions/setup-node@v4",
        with: {
          "node-version": "lts/*",
          "registry-url": "https://registry.npmjs.org",
        },
      },
      {
        name: "Install dependencies",
        run: "yarn install --check-files --frozen-lockfile",
        workingDirectory: ".",
      },
      {
        name: "Compile",
        run: "npx projen compile",
      },
      {
        name: "Build JS package",
        run: "npx projen package:js",
      },
      {
        name: "Backup artifact permissions",
        run: "cd dist && getfacl -R . > permissions-backup.acl",
        continueOnError: true,
      },
      {
        name: "Upload JS artifact",
        uses: "actions/upload-artifact@v4",
        with: {
          name: "ajithapackage-artifact",
          path: "src/packages/ajithapackage1/dist",
          overwrite: true,
        },
      },
      {
        name: "Publish to NPM",
        env: {
          NPM_TOKEN: "${{ secrets.TOKEN }}",
        },
        run: [
          'echo "Checking NPM_TOKEN length: ${#NPM_TOKEN}"',
          'echo "Publishing version: ${{ inputs.version }}"',
          "DEBUG=* npx -p publib publib-npm --version ${{ inputs.version }}",
        ].join("\n"),
      },
    ],
  },
  release_github: {
    name: "Publish GitHub Release",
    needs: ["release"],
    runsOn: ["ubuntu-latest"],
    permissions: {
      contents: JobPermission.WRITE,
    },
    if: "always() && needs.release.result == 'success'",
    steps: [
      {
        name: "Setup Node.js",
        uses: "actions/setup-node@v4",
        with: { "node-version": "lts/*" },
      },
      {
        name: "Download artifact",
        uses: "actions/download-artifact@v4",
        with: {
          name: "ajithapackage-artifact",
          path: "dist",
        },
      },
      {
        name: "Restore build artifact permissions",
        run: "cd dist && setfacl --restore=permissions-backup.acl",
        continueOnError: true,
      },
      {
        name: "GitHub Release",
        env: {
          GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}",
        },
        run: `
        TAG="v\${{ inputs.version }}"
        gh release create "$TAG" -F dist/changelog.md -t "$TAG" --target $GITHUB_SHA || echo "Release might already exist"
      `,
      },
    ],
  },
});

// Projen ajithapackage2
const aj2 = project.github?.addWorkflow("release_ajithapackage2");
aj2?.on({
  workflowCall: {
    inputs: {
      version: {
        required: true,
        type: "string",
      },
    },
  },
});
aj2?.addJobs({
  release: {
    runsOn: ["ubuntu-latest"],
    permissions: {
      contents: JobPermission.WRITE,
      idToken: JobPermission.WRITE,
    },
    defaults: {
      run: {
        workingDirectory: "src/packages/ajithapackage2",
      },
    },
    steps: [
      {
        name: "Checkout",
        uses: "actions/checkout@v4",
        with: { "fetch-depth": 0 },
      },
      {
        name: "Set Git identity",
        run: [
          'git config user.name "github-actions"',
          'git config user.email "github-actions@github.com"',
        ].join("\n"),
      },
      {
        name: "Setup Node.js",
        uses: "actions/setup-node@v4",
        with: {
          "node-version": "lts/*",
          "registry-url": "https://registry.npmjs.org",
        },
      },
      {
        name: "Install dependencies",
        run: "yarn install --check-files --frozen-lockfile",
        workingDirectory: ".",
      },
      {
        name: "Compile",
        run: "npx projen compile",
      },
      {
        name: "Build JS package",
        run: "npx projen package",
      },
      {
        name: "Backup artifact permissions",
        run: "cd dist && getfacl -R . > permissions-backup.acl",
        continueOnError: true,
      },
      {
        name: "Upload JS artifact",
        uses: "actions/upload-artifact@v4",
        with: {
          name: "ajithapackage2-artifact",
          path: "src/packages/ajithapackage2/dist",
          overwrite: true,
        },
      },
      {
        name: "Remove prepack",
        run: `jq 'del(.scripts.prepack)' package.json > package.tmp.json && mv package.tmp.json package.json`,
      },
      {
        name: "Release",
        env: {
          NPM_TOKEN: "${{ secrets.TOKEN }}",
        },
        run: [
          'echo "Checking NPM_TOKEN length: ${#NPM_TOKEN}"',
          'echo "Publishing version: ${{ inputs.version }}"',
          "DEBUG=* npx -p publib publib-npm --version ${{ inputs.version }}",
        ].join("\n"),
      },
    ],
  },
  release_github: {
    name: "Publish GitHub Release",
    needs: ["release"],
    runsOn: ["ubuntu-latest"],
    permissions: {
      contents: JobPermission.WRITE,
    },
    if: "always() && needs.release.result == 'success'",
    steps: [
      {
        name: "Setup Node.js",
        uses: "actions/setup-node@v4",
        with: { "node-version": "lts/*" },
      },
      {
        name: "Download artifact",
        uses: "actions/download-artifact@v4",
        with: {
          name: "ajithapackage2-artifact",
          path: "dist",
        },
      },
      {
        name: "Restore build artifact permissions",
        run: "cd dist && setfacl --restore=permissions-backup.acl",
        continueOnError: true,
      },
      {
        name: "GitHub Release",
        env: {
          GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}",
        },
        run: `
        TAG="v\${{ inputs.version }}"
        gh release create "$TAG" -F dist/changelog.md -t "$TAG" --target $GITHUB_SHA || echo "Release might already exist"
      `,
      },
    ],
  },
});

const central = project.github?.addWorkflow("central-release");

if (central) {
  central.on({
    push: { branches: ["rel"] },
    workflowDispatch: {},
  });

  central.addJobs({
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
            'git config --global user.email "github-actions@github.com"',
            'git config --global user.name "GitHub Actions"',
          ].join("\n"),
        },
        {
          name: "Run Projen Release (ajithapackage1)",
          run: "npx projen release",
          workingDirectory: "src/packages/ajithapackage1",
        },
        {
          name: "Read Version",
          id: "getver",
          run: [
            "VERSION=$(cat src/packages/ajithapackage1/dist/releasetag.txt | sed 's/^v//')",
            'echo "version=$VERSION" >> $GITHUB_OUTPUT',
            'echo "Release version: $VERSION"',
          ].join("\n"),
        },
      ],
    },

    release_ajithapackage: {
      needs: ["bump_version"],
      permissions: {
        contents: JobPermission.WRITE,
        idToken: JobPermission.WRITE,
      },
      uses: "./.github/workflows/release_ajithapackage.yml",
      with: {
        version: "${{ needs.bump_version.outputs.version }}",
      },
    },

    release_ajithapackage2: {
      needs: ["bump_version"],
      permissions: {
        contents: JobPermission.WRITE,
        idToken: JobPermission.WRITE,
      },
      uses: "./.github/workflows/release_ajithapackage2.yml",
      with: {
        version: "${{ needs.bump_version.outputs.version }}",
      },
    },

    release_smithy_client: {
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

    release_smithy_ssdk: {
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

    cleanup_failed_tag: {
      if: "failure() && needs.bump_version.result == 'success'",
      needs: ["bump_version"],
      permissions: {
        contents: JobPermission.WRITE,
        idToken: JobPermission.WRITE,
      },
      runsOn: ["ubuntu-latest"],
      steps: [
        {
          name: "Checkout",
          uses: "actions/checkout@v4",
          with: {
            "fetch-depth": 0,
          },
        },
        {
          name: "Delete Git Tag",
          run: [
            "TAG=$(cat src/packages/ajithapackage1/dist/releasetag.txt)",
            'echo "Deleting tag: $TAG"',
            'git tag -d "$TAG" || true',
            'git push origin ":refs/tags/$TAG" || true',
          ].join("\n"),
        },
      ],
    },
  });
}
if (central) {
  central.file?.addOverride("concurrency", {
    group: "release",
    "cancel-in-progress": false,
  });
}

const package2 = new typescript.TypeScriptProject({
  ...projectMetadata,
  name: "ajithapackage2",
  outdir: "src/packages/ajithapackage2",
  parent: project,
  projenrcTs: false,
  release: false,
  releaseToNpm: false,
  repository: projectMetadata.repositoryUrl,
});
addTestTargets(package2);
addPrettierConfig(package2);
configureMarkDownLinting(package2);
package2.package.file.addOverride("private", false);

package2.addTask("release", {
  steps: [
    { exec: "npx projen bump" },
    {
      exec: 'git commit -am "chore: bump version" || echo "No changes to commit"',
    },
    { exec: "git tag v$(node -p \"require('./package.json').version\")" },
    { exec: "mkdir -p dist" },
    {
      exec: 'echo "v$(node -p \\"require(\'./package.json\').version\\")" > dist/releasetag.txt',
    },
  ],
});
// package2.addTask("package:js", {
//   steps: [
//     { spawn: "compile" },
//     { spawn: "test" },
//     {
//       exec: "mkdir -p dist/js && cp package.json README.md dist/js/",
//     },
//     {
//       exec: "cd dist/js && npm pack",
//     },
//   ],
// });

project.synth();
