const fs = require("fs");
const path = require("path");

/**
 * The method checks if an id is already defined in a map.
 */
const checkId = (ids, id, file) => {
  if (!id) {
    throw new Error(`ID is not defined: "${file}"`);
  }

  if (ids.has(id)) {
    throw new Error(
      `key: "${id}" for: "${file}" already defined in: "${ids.get(id)}"`
    );
  }
};

/**
 * The method filtes the files array.
 */
const filterFiles = (files) => {
  return files.filter((f) => f.endsWith(".json") && !f.endsWith("topics.json"));
};

/**
 * The method processes a json file and extracts its ids.
 */
const processFile = (file, data, ids) => {
  const json = JSON.parse(data);

  json.forEach((elem) => {
    checkId(ids, elem.id, file);
    ids.set(elem.id, file);
  });

  console.log("Reading file:", file, "number of ids:", json.length);
};

/**
 * The method processes an array with json file. It read the file content and
 * delegates the file processing to the processFile method.
 */
const processFiles = (files) => {
  const ids = new Map();

  const filtered = filterFiles(files);
  let count = filtered.length;

  filtered.forEach((file) => {
    fs.readFile(file, (err, data) => {
      if (err) {
        throw Error(err);
      }

      processFile(file, data, ids);

      if (--count === 0) {
        withIds(ids);
      }
    });
  });
};

/**
 * The method walks through a directory tree.
 */
const walker = (parent, dirs, files) => {
  fs.readdir(parent, (err, entries) => {
    if (err) {
      throw err;
    }

    let count = entries.length;

    entries.forEach((entry) => {
      const p = path.join(parent, entry);

      fs.lstat(p, (err, stats) => {
        if (err) {
          throw err;
        }

        if (stats.isDirectory()) {
          dirs.push(p);
        } else if (stats.isFile()) {
          files.push(p);
        }

        if (--count === 0) {
          if (dirs.length > 0) {
            walker(dirs.shift(), dirs, files);
          } else {
            processFiles(files);
          }
        }
      });
    });
  });
};

const withIds = (ids) => {
  console.log("end-files", ids.size);
};

walker("data", [], []);
console.log("eeeeeeeeeeeeeeeeemd");
