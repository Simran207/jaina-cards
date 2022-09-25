"use strict";

const fs = require('fs');
const csv = require('fast-csv');
let questionController;
const cn = require("../config/config");
const path = require("path");

const FILE_NAMES = {
    // RED: 'red.csv',
    // BLUE: 'pink.csv',
    // YELLOW: 'brown.csv',
    // GREEN: 'green.csv'
    FILE: 'questions.csv'
};

async function main() {
    console.log(path.join(__dirname, `../questions/red.csv`));
    for (let color in FILE_NAMES) {
        fs.createReadStream(path.join(__dirname, `../questions/${FILE_NAMES[color]}`))
            .pipe(csv.parse({ headers: true }))
            .on('error', error => console.error(error))
            .on('data', async (row) => {
                console.log(row);
                row.is_jaina_card_question = true;
                // row.color = color.toLowerCase();
                await questionController.insert(row);
            })
            .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));
    }
}

cn.init().then(async function () {
    questionController = require("../controller/questionController");
    await main();
    // process.exit(0);
});