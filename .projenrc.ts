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
  tsProject.package.addField("publishConfig", {
    access: "public",
  });
  return tsProject;
};

createPackage({
  name: "ajithapackage",
  outdir: "src/packages/ajithapackage1",
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
        tag_exists: {
          stepId: "check_tag_exists",
          outputName: "exists",
        },
        latest_commit: {
          stepId: "git_remote",
          outputName: "latest_commit",
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
          name: "Get Next Version",
          id: "next_version",
          run: [
            "cd src/packages/ajithapackage1",
            "CURRENT=$(npm view ajithapackage version 2>/dev/null || echo '0.0.0')",
            "echo $CURRENT > .version.tmp",
            'NEXT_VERSION=$(awk -F. \'{$NF+=1; print $1"."$2"."$3}\' .version.tmp)',
            'echo "next_version=$NEXT_VERSION" >> $GITHUB_OUTPUT',
            'echo "Next version would be: $NEXT_VERSION"',
          ].join(" && "),
        },
        {
          name: "Check if version has already been tagged",
          id: "check_tag_exists",
          run: [
            'TAG="v${{ steps.next_version.outputs.next_version }}"',
            'echo "Checking for tag: $TAG"',
            '(git ls-remote -q --exit-code --tags origin $TAG && echo "exists=true" >> $GITHUB_OUTPUT) || echo "exists=false" >> $GITHUB_OUTPUT',
            "cat $GITHUB_OUTPUT",
          ].join("\n"),
        },
        {
          name: "Run Projen Release (ajithapackage1)",
          if: "steps.check_tag_exists.outputs.exists != 'true'",
          run: "npx projen release",
          workingDirectory: "src/packages/ajithapackage1",
        },
        {
          name: "Read Version",
          id: "getver",
          if: "steps.check_tag_exists.outputs.exists != 'true'",
          run: [
            "VERSION=$(cat src/packages/ajithapackage1/dist/releasetag.txt | sed 's/^v//')",
            'echo "version=$VERSION" >> $GITHUB_OUTPUT',
            'echo "Release version: $VERSION"',
          ].join("\n"),
        },
        {
          name: "Check for new commits",
          id: "git_remote",
          run: [
            'echo "latest_commit=$(git ls-remote origin -h ${{ github.ref }} | cut -f1)" >> $GITHUB_OUTPUT',
            "cat $GITHUB_OUTPUT",
          ].join("\n"),
        },
      ],
    },

    release_ajithapackage: {
      if: "needs.bump_version.outputs.tag_exists != 'true' && needs.bump_version.outputs.latest_commit == github.sha",
      needs: ["bump_version"],
      permissions: {
        contents: JobPermission.WRITE,
        idToken: JobPermission.WRITE,
      },
      uses: "./.github/workflows/release_package.yml",
      with: {
        version: "${{ needs.bump_version.outputs.version }}",
        package_name: "ajithapackage",
        package_path: "src/packages/ajithapackage1",
      },
      secrets: "inherit",
    },

    release_ajithapackage2: {
      if: "needs.bump_version.outputs.tag_exists != 'true' && needs.bump_version.outputs.latest_commit == github.sha",
      needs: ["bump_version"],
      permissions: {
        contents: JobPermission.WRITE,
        idToken: JobPermission.WRITE,
      },
      uses: "./.github/workflows/release_package.yml",
      with: {
        version: "${{ needs.bump_version.outputs.version }}",
        package_name: "ajithapackage2",
        package_path: "src/packages/ajithapackage2",
      },
      secrets: "inherit",
    },

    release_smithy_client: {
      if: "needs.bump_version.outputs.tag_exists != 'true' && needs.bump_version.outputs.latest_commit == github.sha",
      needs: ["bump_version"],
      permissions: {
        contents: JobPermission.WRITE,
        idToken: JobPermission.WRITE,
      },
      uses: "./.github/workflows/release_package.yml",
      with: {
        version: "${{ needs.bump_version.outputs.version }}",
        package_name: "smithy-client",
        package_path:
          "src/packages/my-api/build/smithy/source/typescript-client-codegen",
      },
      secrets: "inherit",
    },

    release_smithy_ssdk: {
      if: "needs.bump_version.outputs.tag_exists != 'true' && needs.bump_version.outputs.latest_commit == github.sha",
      needs: ["bump_version"],
      permissions: {
        contents: JobPermission.WRITE,
        idToken: JobPermission.WRITE,
      },
      uses: "./.github/workflows/release_package.yml",
      with: {
        version: "${{ needs.bump_version.outputs.version }}",
        package_name: "smithy-ssdk",
        package_path:
          "src/packages/my-api/build/smithy/source/typescript-ssdk-codegen",
      },
      secrets: "inherit",
    },

    npm_release: {
      needs: [
        "bump_version",
        "release_ajithapackage",
        "release_ajithapackage2",
        "release_smithy_client",
        "release_smithy_ssdk",
      ],
      runsOn: ["ubuntu-latest"],
      permissions: {
        contents: JobPermission.WRITE,
        idToken: JobPermission.WRITE,
      },
      env: {
        CI: "true",
      },
      if: "needs.bump_version.outputs.tag_exists != 'true' && needs.bump_version.outputs.latest_commit == github.sha",
      steps: [
        {
          name: "Setup Node.js",
          uses: "actions/setup-node@v4",
          with: {
            "node-version": "lts/*",
            "registry-url": "https://registry.npmjs.org",
          },
        },
        {
          name: "Download artifacts",
          uses: "actions/download-artifact@v4",
          with: {
            "merge-multiple": true,
          },
        },
        {
          name: "List downloaded artifacts",
          run: "ls -la",
        },

        {
          name: "Extract packages",
          run: [
            "packages=(ajithapackage ajithapackage2 smithy-client smithy-ssdk)",
            'for pkg in "${packages[@]}"; do',
            '  echo "Extracting $pkg..."',
            '  mkdir -p "$pkg"',
            '  tar -xzf "$pkg.tgz" -C "$pkg" --strip-components=1 || { echo "Error extracting $pkg"; exit 1; }',
            "done",
          ].join("\n"),
        },
        {
          name: "Patch version and Remove prepack in each package",
          run: [
            'version="${{ needs.bump_version.outputs.version }}"',
            "packages=(ajithapackage ajithapackage2 smithy-client smithy-ssdk)",
            'for pkg in "${packages[@]}"; do',
            '  echo "Patching version in $pkg/package.json"',
            '  cd "$pkg"',
            "  jq --arg ver \"$version\" '.version = $ver' package.json > tmp.json && mv tmp.json package.json",
            "  jq 'del(.scripts.prepack)' package.json > tmp.json && mv tmp.json package.json",
            "  cat package.json | grep version",
            "  cd ..",
            "done",
          ].join("\n"),
        },
        {
          name: "Publish packages to npm",
          id: "publish",
          env: {
            NODE_AUTH_TOKEN: "${{ secrets.TOKEN }}",
          },
          run: [
            "published=()",
            'version="${{ needs.bump_version.outputs.version }}"',
            "rollback() {",
            '  echo "Error during publishing, rolling back..."',
            '  for pkg in "${published[@]}"; do',
            '    echo "Unpublishing $pkg@$version"',
            '    npm unpublish "$pkg@$version" --force || echo "Failed to unpublish $pkg"',
            "  done",
            '  echo "publishing_failed=true" >> $GITHUB_OUTPUT',
            "  exit 1",
            "}",
            "trap rollback ERR",
            "packages=(ajithapackage ajithapackage2 smithy-client smithy-ssdk)",
            'for pkg in "${packages[@]}"; do',
            '  echo "Publishing $pkg@$version"',
            '  cd "$pkg"',
            "  if npm publish --access public; then",
            '    published+=("$pkg")',
            '    echo "Successfully published $pkg@$version"',
            "    cd ..",
            "  else",
            '    echo "Failed to publish $pkg"',
            "    cd ..",
            "    rollback",
            "  fi",
            "done",
            'echo "All packages published successfully"',
            'echo "publishing_failed=false" >> $GITHUB_OUTPUT',
          ].join("\n"),
        },
        {
          name: "Finalize Release",
          run: [
            'echo "All child workflows have completed successfully."',
            'echo "All packages are published to NPM"',
          ].join("\n"),
        },
      ],
    },

    github_release: {
      if: "needs.bump_version.outputs.tag_exists != 'true' && needs.bump_version.outputs.latest_commit == github.sha",
      needs: ["npm_release", "bump_version"],
      runsOn: ["ubuntu-latest"],
      permissions: {
        contents: JobPermission.WRITE,
        idToken: JobPermission.WRITE,
      },
      env: {
        CI: "true",
      },
      steps: [
        {
          name: "Checkout",
          uses: "actions/checkout@v4",
        },
        {
          name: "Download all artifacts",
          uses: "actions/download-artifact@v4",
          with: {
            "merge-multiple": true,
          },
        },
        {
          name: "Create GitHub Release",
          env: {
            GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}",
          },
          run: [
            'gh release create "v${{ needs.bump_version.outputs.version }}"',
            '--title "v${{ needs.bump_version.outputs.version }}"',
            '--notes "Automated release for all packages"',
            "*.tgz",
          ].join(" "),
        },
      ],
    },

    cleanup_failed_tag: {
      if: "failure() && (needs.bump_version.result == 'success' || needs.npm_release.outputs.publishing_failed == 'true')",
      needs: ["github_release"],
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

// reusable workflow
const reusableWorkflow = project.github?.addWorkflow("release_package");

if (reusableWorkflow) {
  reusableWorkflow.on({
    workflowCall: {
      inputs: {
        version: { required: true, type: "string" },
        packageName: { required: true, type: "string" },
        packagePath: { required: true, type: "string" },
      },
    },
  });

  reusableWorkflow.addJobs({
    build_artifacts: {
      runsOn: ["ubuntu-latest"],
      permissions: {
        contents: JobPermission.READ,
        idToken: JobPermission.WRITE,
      },
      env: {
        CI: "true",
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
          name: "who am i",
          env: {
            NODE_AUTH_TOKEN: "${{ secrets.TOKEN }}",
          },
          run: "npm whoami",
        },
        {
          name: "Install dependencies",
          run: "yarn install --check-files --frozen-lockfile",
        },
        {
          name: "Build package",
          run: "yarn build",
          workingDirectory: "${{ inputs.package_path }}",
        },
        {
          name: "Pack artifact",
          run: "yarn pack --filename ${{ inputs.package_name }}.tgz",
          workingDirectory: "${{ inputs.package_path }}",
        },
        {
          name: "Backup artifact permissions",
          workingDirectory: "${{ inputs.package_path }}",
          run: [
            "mkdir -p dist",
            "cp ${{ inputs.package_name }}.tgz dist/",
            "cd dist && getfacl -R . > permissions-backup.acl",
          ].join("&&"),
        },
        {
          name: "Prepare for publishing",
          run: [
            "cd dist",
            "tar -xzf ${{ inputs.package_name }}.tgz --strip-components=1",
            "jq '.version = \"${{ inputs.version }}\"' package.json > tmp.json",
            "mv tmp.json package.json",
            "jq 'del(.scripts.prepack)' package.json > tmp.json",
            "mv tmp.json package.json",
          ].join(" && "),
          workingDirectory: "${{ inputs.package_path }}",
        },
        {
          name: "Upload artifact",
          uses: "actions/upload-artifact@v4.4.0",
          with: {
            name: "${{ inputs.package_name }}-artifact",
            path: "${{ inputs.package_path }}/dist",
            overwrite: true,
          },
        },
      ],
    },
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
package2.package.addField("publishConfig", {
  access: "public",
});
package2.addDeps("commander@^11.0.0");
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
package2.package.addBin({
  ajithapackage2: "lib/cli.js",
});

project.synth();
