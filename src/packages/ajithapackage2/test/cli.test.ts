import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const cliPath = path.resolve(__dirname, '../lib/cli.js');

const execCLI = (
  args: string[],
): Promise<{ code: number; stdout: string; stderr: string }> => {
  return new Promise((resolve) => {
    const proc = spawn(cliPath, args);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      resolve({ code: code ?? -1, stdout, stderr });
    });
  });
};

describe('ajithapackage2 CLI', () => {
  beforeAll(() => {
    if (!fs.existsSync(cliPath)) {
      throw new Error(
        `CLI not built: ${cliPath} not found. Run \`npx projen build\` first.`,
      );
    }
    // Ensure it's executable
    fs.chmodSync(cliPath, 0o755);
  });

  describe('main command', () => {
    test('displays help information', async () => {
      const { code, stdout, stderr } = await execCLI(['--help']);

      expect(code).toBe(0);
      expect(stdout).toContain('Usage: ajithapackage2');
      expect(stdout).toContain('Commands:');
      expect(stdout).toContain('display-books');
      expect(stdout).toContain('display-movies');
      expect(stderr).toBe('');
    });

    test('displays version information', async () => {
      const { code, stdout, stderr } = await execCLI(['--version']);

      expect(code).toBe(0);
      expect(stdout).toBe('1.0.0\n'); // Assuming version is 1.0.0
      expect(stderr).toBe('');
    });
  });

  describe('display-books command', () => {
    test('runs successfully', async () => {
      const { code, stdout, stderr } = await execCLI(['display-books']);

      expect(code).toBe(0);
      expect(stdout).toBeTruthy(); // Add more specific expectations based on your displayBooks output
      expect(stderr).toBe('');
    });

    test('handles errors appropriately', async () => {
      // Mock a scenario where displayBooks throws an error
      // This might require modifying your implementation to simulate an error
      const { code, stderr } = await execCLI([
        'display-books',
        '--invalid-flag',
      ]);

      expect(code).toBe(1);
      expect(stderr).toBeTruthy();
    });
  });

  describe('display-movies command', () => {
    test('runs successfully', async () => {
      const { code, stdout, stderr } = await execCLI(['display-movies']);

      expect(code).toBe(0);
      expect(stdout).toBeTruthy(); // Add more specific expectations based on your displayMovies output
      expect(stderr).toBe('');
    });

    test('handles errors appropriately', async () => {
      // Mock a scenario where displayMovies throws an error
      // This might require modifying your implementation to simulate an error
      const { code, stderr } = await execCLI([
        'display-movies',
        '--invalid-flag',
      ]);

      expect(code).toBe(1);
      expect(stderr).toBeTruthy();
    });
  });
});
