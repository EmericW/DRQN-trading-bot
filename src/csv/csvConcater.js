const fs = require('fs');

const files = [
    '1.csv',
    '2.csv',
    '3.csv',
    '4.csv',
    '5.csv',
    '6.csv',
    '7.csv',
    '8.csv',
    '9.csv',
    '10.csv',
    '11.csv',
];
let data = '';

files.forEach((file) => {
    let content = fs.readFileSync(`data/hourly/${file}`, 'utf-8');
    content = content.split('\n');
    content.shift();
    content = content.join('\n');
    data += content;
});

fs.writeFileSync('data/hourly/BTC.csv', data);
