const exec = require("child_process").exec;
const fs = require("fs");
const path = require("path");
const { createHash } = require('crypto');

const fsPromises = fs.promises;
const ok = Object.keys;

// Save FileNameHashPair
const nameHashPair = {};

// Set to save all changed contracts or 
// artifacts that are not available
const changed = new Set();

// File containing contract hash
var tracker;

// Creates file only if it doesn't exist in cache
const upsertFile = async() => {
    const dirpath = path.join(__dirname, "../cache/cairo-files-cache.json");
    try {
      // try to read file
      tracker = await fsPromises.readFile(dirpath)
    } catch (err) {
      // create file, if it's not found
      tracker = await fsPromises.writeFile(dirpath, '{}')
    }
}

// Gets hash of each .cairo file inside contracts
const getContractHash = async () => {
    try {
        // traverse directory contracts/
        const dirpath = path.join(__dirname, '../contracts');
        const files = await fsPromises.readdir(dirpath);
        // check only cairo file extensions
        const filesList = files.filter(el => path.extname(el).toLowerCase() === '.cairo');
        // select file name
        for(const cairoContract of filesList) {
            const data = await fsPromises.readFile(dirpath.concat(`/${cairoContract}`));
            const hash = createHash('sha256');
            hash.update(data);
            nameHashPair[`${cairoContract}`] = hash.copy().digest('hex').toString();
        }
    } catch (err) {
        console.log(err)
    }
}

// Check artifacts availability
const checkArtifacts = async () => {
    console.log('Cheking artifacts availability...')
    try {
        // traverse directory starknet-artifacts/contracts
        const dirpath = path.join(__dirname, '../starknet-artifacts/contracts');
        const files = await fsPromises.readdir(dirpath);
        for(const name of ok(nameHashPair)) {
            if (!files.includes(name)) {
                changed.add(`contracts/${name}`);
            }
        }
    } catch (err) {
        console.log(err)
    }
}

// Compile changed contracts
const compileChangedContracts = () => {
    console.log('nameHashPair', nameHashPair)
    if (ok(nameHashPair).length === ok(tracker)) {
        ok(nameHashPair).forEach(k => {
            if (nameHashPair[k] !== tracker[k]) {
                changed.add(`contracts/${k}`);
            }
        })
    } else {
        // Compile only that are not in tracker
        ok(nameHashPair).forEach(k => {
            if (nameHashPair[k] !== tracker[k]) {
                changed.add(`contracts/${k}`);
            }
        })
    }

    if (changed.size > 0) {
        console.log('Compiling changed contracts...')
        exec(`npx hardhat starknet-compile ${[...changed].join(' ')}`,
            function (error, stdout, stderr) {
                console.log(stdout);
                console.log(stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });
    }
}

const main = async () => {
    await upsertFile();
    await getContractHash();
    await checkArtifacts();
    compileChangedContracts();
    // Write to file new NameHashPair of contracts
    try {
        const dirPath = path.join(__dirname, "../cache/cairo-files-cache.json");
        await fsPromises.writeFile(dirPath, JSON.stringify(nameHashPair));
    } catch (err) {
        console.log(err)
    }
}
main();
