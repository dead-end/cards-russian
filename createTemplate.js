/**
 * Simple script, that writes a prototype for a language file.
 */
const fs = require("fs");
const path = require("path");
const { exit } = require("process");
const readline = require("readline");

/**
 * The method checks if an id is already defined in a map.
 */
const checkId = (map, id, newFile) => {
  if (!id) {
    throw new Error(`ID is not defined: "${newFile}"`);
  }

  if (map.has(id)) {
    const oldFile = map.get(id);
    throw new Error(
      `key: "${id}" for: "${newFile}" already defined in: "${oldFile}"`
    );
  }
};

/**
 * The method is called with a file and is gets the ids defined in it.
 */
const processFile = (file, map) => {
  if (!file.endsWith(".json") || file.endsWith("topics.json")) {
    return;
  }

  const data = fs.readFileSync(file);
  const json = JSON.parse(data);

  json.forEach((elem) => {
    if (!elem.id) {
      throw new Error(`${file} - No id`);
    }

    checkId(map, elem.id, file);

    map.set(elem.id, file);
  });
};

/**
 * The method walks through a file tree and calls a callback method on all
 * files found.
 */
const walk = (parent, callback, map) => {
  const entries = fs.readdirSync(parent);
  for (const entry of entries) {
    const p = path.join(parent, entry);

    if (fs.lstatSync(p).isDirectory()) {
      walk(p, callback, map);
    } else {
      callback(p, map);
    }
  }
};

/**
 * The method is called with an array of objects and each contains an id. It
 * checks if these ids are already defined in an other file.
 */
const checkIds = (arr) => {
  const map = new Map();
  walk("data", processFile, map);

  arr.forEach((elem) => {
    checkId(map, elem.id, "<NEW>");
  });
};

/**
 * The function creates the json content as a string.
 */
const createData = (prefix, count) => {
  const arr = [];

  for (let i = 0; i < count; i++) {
    const n = i < 10 ? `0${i}` : `${i}`;

    arr.push({
      id: `${prefix}#${n}`,
      quest: [""],
      answer: [""],
    });
  }

  return arr;
};

/**
 * The function writes the json data to the file.
 */
const writeFile = (file, data) => {
  const p = path.join(__dirname, file);
  fs.writeFileSync(p, data, { encoding: "utf8" });
  console.log("File written:", file);
};

/**
 * The function writes an error message followed by the usage and terminates
 * the program.
 */
const logUsage = (msg) => {
  console.log(msg);
  console.error("node createTemplate <id> <count> <file>");
  exit(1);
};

if (process.argv.length != 5) {
  logUsage(`Numer of args: ${process.argv.length}`);
}

const prefix = process.argv[2];
const count = process.argv[3];
const file = process.argv[4];

if (isNaN(count) || count < 0 || count > 40) {
  logUsage("Wrong count:", count);
}

console.log("prefix:", prefix);
console.log("count:", count);
console.log("file:", file);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Go on? ", (answer) => {
  rl.close();
  if (answer === "no" || answer === "n") {
    return;
  }

  try {
    const arr = createData(prefix, count);
    checkIds(arr);
    const data = JSON.stringify(arr, null, 2);
    writeFile(file, data);
    console.log("Done");
  } catch (err) {
    console.error("ERROR -", err.message);
  }
});
