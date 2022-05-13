/**
 * Simple script, that writes a prototype for a language file.
 */
const fs = require('fs');
const path = require('path');
const { exit } = require('process');
const readline = require('readline');

/**
 * The function creates the json content as a string.
 */
const createData = (prefix, count) => {
  const arr = [];

  for (let i = 0; i < count; i++) {
    const n = i < 10 ? `0${i}` : `${i}`;

    arr.push({
      id: `${prefix}#${n}`,
      quest: [''],
      answer: [''],
    });
  }

  return JSON.stringify(arr, null, 2);
};

/**
 * The function writes the json data to the file.
 */
const writeFile = (file, data) => {
  fs.writeFile(path.join(__dirname, file), data, (err) => {
    if (err) {
      throw err;
    }
    console.log('File written:', file);
  });
};

/**
 * The function writes an error message followed by the usage and terminates
 * the program.
 */
const logUsage = (msg) => {
  console.log(msg);
  console.error('node createTemplate <id> <count> <file>');
  exit(1);
};

const usage = `node createTemplate <id> <count> <file>`;

if (process.argv.length != 5) {
  logUsage(`Numer of args: ${process.argv.length}`);
}

const prefix = process.argv[2];
const count = process.argv[3];
const file = process.argv[4];

if (isNaN(count) || count < 0 || count > 40) {
  logUsage('Wrong count:', count);
}

console.log('prefix:', prefix);
console.log('count:', count);
console.log('file:', file);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Go on? ', () => {
  rl.close();
  writeFile(file, createData(prefix, count));
});
