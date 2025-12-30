const fs = require('fs');
const path = require('path');
const { canonicalize } = require('../src/canonicalize');
const { sha256 } = require('../src/hash');
const { computeRoot } = require('../src/merkle');

const args = process.argv.slice(2);
let datasetName = 'batch-10'; // default

for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--dataset=')) {
        datasetName = args[i].split('=')[1];
    } else if (args[i] === '--dataset' && i + 1 < args.length) {
        datasetName = args[i + 1];
        i++; // skip the value
    }
}

async function main() {
    console.log('--- 2. Compute Merkle Root (Local) ---');
    console.log(`Using dataset: ${datasetName}`);

    // 1. Load Dataset
    const filePath = path.join(__dirname, `../data/${datasetName}.json`);
    if (!fs.existsSync(filePath)) {
        console.error(`Error: Dataset not found at ${filePath}`);
        process.exit(1);
    }
    const batch = JSON.parse(fs.readFileSync(filePath));
    console.log(`1) Loaded ${batch.length} records.`);

    // 2. Canonicalize & 3. Hash Leaves
    const leaves = batch.map(record => sha256(canonicalize(record)));
    console.log('2, 3) Canonicalized and computed leaf hashes.');

    // 4. Compute Root
    const rootBuffer = computeRoot(leaves);
    const rootHex = rootBuffer.toString('hex');
    console.log(`4) Computed Merkle Root: ${rootHex}`);
    console.log('\nSuccess! You can now anchor this root on HCS in the next step.');
}

main();
