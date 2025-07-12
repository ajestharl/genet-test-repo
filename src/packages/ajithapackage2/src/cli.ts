#!/usr/bin/env node

import { Command } from 'commander';
import { displayBooks } from './index';
import { displayMovies } from './index2';

const program = new Command();

program
  .name('ajithapackage2')
  .description('CLI to display books and movies')
  .version('1.0.0');

program
  .command('display-books')
  .description('Display available books')
  .action(async () => {
    try {
      await displayBooks({});
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

program
  .command('display-movies')
  .description('Display available movies')
  .action(async () => {
    try {
      await displayMovies({});
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

program.parse(process.argv);