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

// Centralized package list - single source of truth for all release operations
// Add/remove packages here to modify what gets released together
const RELEASE_PACKAGES = [
  "@example/ajithapackage",
  "ajithapackage2",
  "my-service-client",
  "my-service-ssdk",
];

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

  tsProject.package.addField("publishConfig", {
    access: "public",
  });
  return tsProject;
};

createPackage({
  name: "@example/ajithapackage",
  outdir: "src/packages/ajithapackage1",
});

// Centralized Release Workflow - coordinates atomic releases of all packages
// Triggered on push to 'rel' branch, ensures all packages get same version
const centralizedRelease = project.github?.addWorkflow("centralized-release");
if (centralizedRelease) {
  centralizedRelease.on({
    push: { branches: ["rel"] },
  });
  centralizedRelease.addJobs({
    // Step 1: Calculate next version and validate release conditions
    setup_release: {
      runsOn: ["ubuntu-latest"],
      permissions: {
        contents: JobPermission.READ,
      },
      outputs: {
        version: {
          stepId: "next_version",
          outputName: "version",
        },
        tag_exists: {
          stepId: "next_version",
          outputName: "tag_exists",
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
          // Query NPM registry for current versions of all packages
          name: "Get Latest NPM Versions",
          id: "npm_versions",
          run: `
            get_version() { npm view "$1" version 2>/dev/null || echo "0.0.0"; }
            PACKAGES="${RELEASE_PACKAGES.join(" ")}"
            VERSIONS=()
            echo "Found NPM versions:"
            for pkg in $PACKAGES; do
              version=$(get_version "$pkg")
              echo "$pkg: $version"
              VERSIONS+=("$version")
            done
            LATEST_NPM=$(printf "%s\\n" "\${VERSIONS[@]}" | sort -V | tail -n1)
            echo "Latest NPM version: $LATEST_NPM"
            echo "latest_npm=$LATEST_NPM" >> $GITHUB_OUTPUT
          `,
        },
        {
          // Find next version that doesn't conflict with existing Git tags
          // Handles failed release recovery by skipping existing tags
          name: "Find Next Available Version",
          id: "next_version",
          run: `
            LATEST_NPM="\${{ steps.npm_versions.outputs.latest_npm }}"
            IFS="." read -r major minor patch <<< "$LATEST_NPM"
            CANDIDATE_VERSION="$major.$minor.$((patch + 1))"
            echo "Starting with candidate version: $CANDIDATE_VERSION"
            while git ls-remote --tags origin "refs/tags/v$CANDIDATE_VERSION" | grep -q "v$CANDIDATE_VERSION"; do
              echo "Tag v$CANDIDATE_VERSION already exists, trying next version"
              patch=$((patch + 1))
              CANDIDATE_VERSION="$major.$minor.$patch"
            done
            echo "Next available version: $CANDIDATE_VERSION"
            echo "version=$CANDIDATE_VERSION" >> $GITHUB_OUTPUT
            echo "tag_exists=false" >> $GITHUB_OUTPUT
          `,
        },
        {
          name: "Check for new commits",
          id: "git_remote",
          run: [
            'echo "latest_commit=$(git ls-remote origin -h ${{ github.ref }} | cut -f1)" >> $GITHUB_OUTPUT',
          ].join("\n"),
        },
      ],
    },

    // Step 2: Build all packages in parallel with determined version
    // Each job creates a build artifact for later publishing
    package_ajithapackage: {
      if: "needs.setup_release.outputs.tag_exists != 'true' && needs.setup_release.outputs.latest_commit == github.sha",
      needs: ["setup_release"],
      permissions: {
        contents: JobPermission.READ,
        idToken: JobPermission.WRITE,
      },
      uses: "./.github/workflows/build-package-artifact.yml",
      with: {
        version: "${{ needs.setup_release.outputs.version }}",
        package_name: "ajithapackage",
        package_path: "src/packages/ajithapackage1",
      },
      secrets: "inherit",
    },

    package_ajithapackage2: {
      if: "needs.setup_release.outputs.tag_exists != 'true' && needs.setup_release.outputs.latest_commit == github.sha",
      needs: ["setup_release"],
      permissions: {
        contents: JobPermission.READ,
        idToken: JobPermission.WRITE,
      },
      uses: "./.github/workflows/build-package-artifact.yml",
      with: {
        version: "${{ needs.setup_release.outputs.version }}",
        package_name: "ajithapackage2",
        package_path: "src/packages/ajithapackage2",
      },
      secrets: "inherit",
    },

    package_smithy_client: {
      if: "needs.setup_release.outputs.tag_exists != 'true' && needs.setup_release.outputs.latest_commit == github.sha",
      needs: ["setup_release"],
      permissions: {
        contents: JobPermission.READ,
        idToken: JobPermission.WRITE,
      },
      uses: "./.github/workflows/build-package-artifact.yml",
      with: {
        version: "${{ needs.setup_release.outputs.version }}",
        package_name: "my-service-client",
        package_path:
          "src/packages/my-api/build/smithy/source/typescript-client-codegen",
      },
      secrets: "inherit",
    },

    package_smithy_ssdk: {
      if: "needs.setup_release.outputs.tag_exists != 'true' && needs.setup_release.outputs.latest_commit == github.sha",
      needs: ["setup_release"],
      permissions: {
        contents: JobPermission.READ,
        idToken: JobPermission.WRITE,
      },
      uses: "./.github/workflows/build-package-artifact.yml",
      with: {
        version: "${{ needs.setup_release.outputs.version }}",
        package_name: "my-service-ssdk",
        package_path:
          "src/packages/my-api/build/smithy/source/typescript-ssdk-codegen",
      },
      secrets: "inherit",
    },

    // Step 3: Publish all packages atomically after successful builds
    // Creates Git tag only after successful NPM publishing
    npm_publish: {
      needs: [
        "setup_release",
        "package_ajithapackage",
        "package_ajithapackage2",
        "package_smithy_client",
        "package_smithy_ssdk",
      ],
      runsOn: ["ubuntu-latest"],
      permissions: {
        contents: JobPermission.WRITE,
        idToken: JobPermission.WRITE,
      },
      env: {
        CI: "true",
      },
      if: "needs.setup_release.outputs.tag_exists != 'true' && needs.setup_release.outputs.latest_commit == github.sha",
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
          name: "Set package list",
          run: `echo "PACKAGES=${RELEASE_PACKAGES.join(" ")}" >> $GITHUB_ENV`,
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
          name: "Download artifacts",
          uses: "actions/download-artifact@v4",
          with: {
            "merge-multiple": true,
          },
        },

        {
          name: "Extract packages",
          run: [
            "for pkg in $PACKAGES; do",
            '  echo "Extracting $pkg..."',
            '  # Extract just the package name (remove scope)',
            '  dir_name=$(echo "$pkg" | sed "s|.*/||")',
            '  # Use the same package name that was passed to build workflow',
            '  safe_name="$dir_name"',
            '  mkdir -p "$dir_name"',
            '  tar -xzf "${safe_name}.tgz" -C "$dir_name" --strip-components=1',
            "done",
          ].join("\n"),
        },
        {
          name: "Patch version and Remove prepack in each package",
          run: [
            'version="${{ needs.setup_release.outputs.version }}"',
            "for pkg in $PACKAGES; do",
            '  dir_name=$(echo "$pkg" | sed "s|.*/||")',
            '  echo "Patching version in $dir_name/package.json"',
            '  cd "$dir_name"',
            "  jq --arg ver \"$version\" '.version = $ver' package.json > tmp.json && mv tmp.json package.json",
            "  jq 'del(.scripts.prepack)' package.json > tmp.json && mv tmp.json package.json",

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
            "version='${{ needs.setup_release.outputs.version }}'",
            "for pkg in $PACKAGES; do",
            '  dir_name=$(echo "$pkg" | sed "s|.*/||")',
            '  echo "Publishing $pkg@$version"',
            '  cd "$dir_name"',
            "  npm publish --access public",
            '  echo "Successfully published $pkg@$version"',
            "  cd ..",
            "done",
            'echo "All packages published successfully"',
            'echo "publishing_failed=false" >> $GITHUB_OUTPUT',
          ].join("\n"),
        },
        {
          // Create Git tag only after successful NPM publishing
          // This ensures tags only exist for successfully released versions
          name: "Create Git Tag",
          workingDirectory: "${{ github.workspace }}",
          run: `
            TAG="v\${{ needs.setup_release.outputs.version }}"
            git tag "$TAG"
            git push origin "$TAG"
            echo "Created and pushed tag: $TAG"
          `,
        },
      ],
    },
    // Step 4: Create GitHub release with all package artifacts
    create_release: {
      if: "needs.setup_release.outputs.tag_exists != 'true' && needs.setup_release.outputs.latest_commit == github.sha",
      needs: ["npm_publish", "setup_release"],
      runsOn: ["ubuntu-latest"],
      permissions: {
        contents: JobPermission.WRITE,
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
            'gh release create "v${{ needs.setup_release.outputs.version }}"',
            '--title "v${{ needs.setup_release.outputs.version }}"',
            '--notes "Automated release for all packages"',
            "--target $(git rev-parse HEAD)",
            "*.tgz",
          ].join(" "),
        },
      ],
    },
  });
}
if (centralizedRelease) {
  // Prevent concurrent releases to avoid version conflicts
  // cancel-in-progress: false ensures running releases complete
  centralizedRelease.file?.addOverride("concurrency", {
    group: "release",
    "cancel-in-progress": false,
  });
}

// Reusable workflow for building individual package artifacts
// Called by each package job in the centralized release
const buildArtifactWorkflow = project.github?.addWorkflow(
  "build-package-artifact",
);


if (buildArtifactWorkflow) {
  buildArtifactWorkflow.on({
    workflowCall: {
      inputs: {
        version: { required: true, type: "string" },
        packageName: { required: true, type: "string" },
        packagePath: { required: true, type: "string" },
      },
    },
  });

  buildArtifactWorkflow.addJobs({
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
          run: "yarn pack --filename \"${{ inputs.package_name }}.tgz\"",
          workingDirectory: "${{ inputs.package_path }}",
        },
        {
          name: "Backup artifact permissions",
          workingDirectory: "${{ inputs.package_path }}",
          run: [
            "mkdir -p dist",
            "cp \"${{ inputs.package_name }}.tgz\" dist/",
            "cd dist && getfacl -R . > permissions-backup.acl",
          ].join(" && "),
        },
        {
          name: "Prepare for publishing",
          run: [
            "cd dist",
            "tar -xzf \"${{ inputs.package_name }}.tgz\" --strip-components=1",
          ].join(" && "),
          workingDirectory: "${{ inputs.package_path }}",
        },
        {
          name: "Upload artifact",
          uses: "actions/upload-artifact@v4.4.0",
          with: {
            name: "${{ inputs.package_name }}",
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
