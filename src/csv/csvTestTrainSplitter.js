const fs = require('fs');

const trainPercentage = 90;

let content = fs.readFileSync('../../data/min/coinbase.clean.csv', 'utf-8');
content = content.split('\n');

const trainingLimit = Math.floor(content.length * (trainPercentage / 100));

const trainingSet = content.slice(0, trainingLimit);
const testSet = content.slice(trainingLimit);

fs.writeFileSync('../../data/min/coinbase.train.csv', trainingSet.join('\n'));
fs.writeFileSync('../../data/min/coinbase.test.csv', testSet.join('\n'));
