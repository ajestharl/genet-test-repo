import { spawn } from 'child_process';

describe('book-list CLI', () => {
  it('should display books when called via book-list', (done) => {
    const process = spawn('ajitha-cli');

    let output = '';
    let errorOutput = '';

    process.stdout.on('data', (data) => {
      output += data.toString();
    });

    process.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    process.on('error', (error) => {
      done(error);
    });

    process.on('close', (code) => {
      try {
        expect(code).toBe(0);
        expect(output).toContain('Available books:');
        expect(output).toContain('1. Book One');
        expect(output).toContain('2. Book Two');
        expect(output).toContain('3. Book Three');
        expect(output).toContain('Total books found: 3');
        done();
      } catch (error) {
        if (errorOutput) {
          console.error('CLI Error:', errorOutput);
        }
        done(error);
      }
    });
  });
});
