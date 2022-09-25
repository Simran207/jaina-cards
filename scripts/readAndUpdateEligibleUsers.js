"use strict";

const fs = require('fs');
const csv = require('fast-csv');
let userController;
const cn = require("../config/config");
const path = require("path");

const FILE_NAMES = {
    USER: 'finalround.csv'
};

async function main() {
    for (let f in FILE_NAMES) {
        fs.createReadStream(path.join(__dirname, `../user/${FILE_NAMES[f]}`))
            .pipe(csv.parse({ headers: true }))
            .on('error', error => console.error(error))
            .on('data', async (row) => {
                console.log(row);
                await userController.readAndUpdateUsers(row.contact_no, row.dob, true);
            })
            .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));
    }
}

cn.init().then(async function () {
    userController = require("../controller/userController");
    await main();
    // process.exit(0);
});