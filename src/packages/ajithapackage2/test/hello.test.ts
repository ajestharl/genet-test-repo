import { spawn } from 'child_process';
import { displayBooks } from '../src/index';
describe('displayBooks', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('displays books in numbered format', async () => {
    const mockBooks = ['Book 1', 'Book 2', 'Book 3'];
    const mockListBooks = jest.fn().mockResolvedValue(mockBooks);

    await displayBooks({ listBooks: mockListBooks });

    expect(consoleSpy).toHaveBeenCalledWith('\nAvailable books:');
    expect(consoleSpy).toHaveBeenCalledWith('1. Book 1');
    expect(consoleSpy).toHaveBeenCalledWith('2. Book 2');
    expect(consoleSpy).toHaveBeenCalledWith('3. Book 3');
    expect(consoleSpy).toHaveBeenCalledWith('\nTotal books found: 3\n');
  });

  it('throws error when no books found', async () => {
    const mockListBooks = jest.fn().mockResolvedValue([]);

    await expect(displayBooks({ listBooks: mockListBooks })).rejects.toThrow(
      'No books found in the library',
    );
  });
});

describe('display CLI', () => {
  it('should display books when called via display command unit', (done) => {
    const process = spawn('display');

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
