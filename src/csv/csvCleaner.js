const fs = require('fs');
const cliProgress = require('cli-progress');

const progressBar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);

let content = fs.readFileSync('../data/min/coinbase.csv', 'utf-8');
content = content.split('\n');
content.pop();

progressBar.start(content.length, 0);
const cleanedLines = content.filter((item, i) => {
    progressBar.update(i);
    const values = item.split(',');
    return !values.find(value => isNaN(value));
});
progressBar.stop();

console.log(`Removed ${content.length - cleanedLines.length} from the ${content.length}`);

fs.writeFileSync('../data/min/coinbase.clean.csv', cleanedLines.join('\n'));
