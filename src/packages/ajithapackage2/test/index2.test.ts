// import { spawn } from 'child_process';
import { displayMovies } from '../src/index2';

describe('displayMovies', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('displays movies in numbered format', async () => {
    const mockMovies = ['Movie 1', 'Movie 2', 'Movie 3'];
    const mockListMovies = jest.fn().mockResolvedValue(mockMovies);

    await displayMovies({ listMovies: mockListMovies });

    expect(consoleSpy).toHaveBeenCalledWith('\nAvailable movies:');
    expect(consoleSpy).toHaveBeenCalledWith('1. Movie 1');
    expect(consoleSpy).toHaveBeenCalledWith('2. Movie 2');
    expect(consoleSpy).toHaveBeenCalledWith('3. Movie 3');
    expect(consoleSpy).toHaveBeenCalledWith('\nTotal movies found: 3\n');
  });

  it('throws error when no movies found', async () => {
    const mockListMovies = jest.fn().mockResolvedValue([]);

    await expect(displayMovies({ listMovies: mockListMovies })).rejects.toThrow(
      'No movies found in the library',
    );
  });
});

// describe('display-movies CLI', () => {
//   it('should display movies when called via display-movies command', (done) => {
//     const process = spawn('display-movies');

//     let output = '';
//     let errorOutput = '';

//     process.stdout.on('data', (data) => {
//       output += data.toString();
//     });

//     process.stderr.on('data', (data) => {
//       errorOutput += data.toString();
//     });

//     process.on('error', (error) => {
//       done(error);
//     });

//     process.on('close', (code) => {
//       try {
//         expect(code).toBe(0);
//         expect(output).toContain('Available movies:');
//         expect(output).toContain('1. The Shawshank Redemption');
//         expect(output).toContain('2. The Godfather');
//         expect(output).toContain('3. The Dark Knight');
//         expect(output).toContain('Total movies found: 3');
//         done();
//       } catch (error) {
//         if (errorOutput) {
//           console.error('CLI Error:', errorOutput);
//         }
//         done(error);
//       }
//     });
//   });
// });
