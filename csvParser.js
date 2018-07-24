const fs = require('fs');

function load(path) {
    const file = fs.readFileSync(path, 'utf-8');
    const content = file.split('\n');
    content.shift();
    let i = -1;
    const data = content.map((line) => {
        i += 1;
        const values = line.split(',');
        return {
            id: i,
            open: values[1],
            high: values[2],
            low: values[3],
            close: values[4],
            volume: values[6],
        };
    });
    return data;
}

module.exports = load;
