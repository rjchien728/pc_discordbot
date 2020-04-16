const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// If the token has expired, delete it and run index.js
// for more details, please go to: https://developers.google.com/sheets/api/quickstart/nodejs?authuser=1

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';


// Load client secrets from a local file.
// fs.readFile('credentials.json', (err, content) => {
//     if (err) return console.log('Error loading client secret file:', err);
//     // Authorize a client with credentials, then call the Google Sheets API.
//     authorize(JSON.parse(content), listMajors);
// });

// console.log('start');

// console.log('end');


module.exports = {

    getUserList: function (SSID) {
        return new Promise(function (resolve, reject) {
            fs.readFile('credentials.json', async (err, content) => {
                if (err) {
                    console.log('Error loading client secret file:', err);
                    reject(err);
                    return;
                }
                try {
                    var oauth = await getauth(JSON.parse(content));
                    var data = await toget(oauth, SSID, '成員ID名稱對照表!A2:B42', 'ROWS');
                    resolve(data);
                }
                catch (err) {
                    reject(err);
                }
            });
        });
    },

    // getArrangeTable: function () {
    //     return new Promise(function (resolve, reject) {
    //         fs.readFile('credentials.json', async (err, content) => {
    //             if (err) {
    //                 console.log('Error loading client secret file:', err);
    //                 reject(err);
    //                 return;
    //             }
    //             try {
    //                 var oauth = await getauth(JSON.parse(content));
    //                 var sheetname = getSheetName()
    //                 var data = await toget(oauth, SSID, sheetname + '!G1:BH30');
    //                 resolve(data);
    //             }
    //             catch (err) {
    //                 reject(err);
    //             }
    //         });
    //     });
    // },

    getDemageTable: function (SSID) {
        return new Promise(function (resolve, reject) {
            fs.readFile('credentials.json', async (err, content) => {
                if (err) {
                    console.log('Error loading client secret file:', err);
                    reject(err);
                    return;
                }
                try {
                    var oauth = await getauth(JSON.parse(content));
                    var sheetname = getSheetName()
                    var data = await toget(oauth, SSID, sheetname + '!A1:T33', 'ROWS');
                    resolve(data);
                }
                catch (err) {
                    reject(err);
                }
            });
        });
    },

    getCollectingtable: function (SSID) {
        return new Promise(function (resolve, reject) {
            fs.readFile('credentials.json', async (err, content) => {
                if (err) {
                    console.log('Error loading client secret file:', err);
                    reject(err);
                    return;
                }
                try {
                    var oauth = await getauth(JSON.parse(content));
                    var data = await toget(oauth, SSID, '集刀' + '!A1:E31', 'COLUMNS');
                    // resolve(data);
                    var sheetname = getSheetName()
                    var data2 = await toget(oauth, SSID, sheetname + '!A1:T33', 'ROWS');
                    resolve([data, data2]);
                }
                catch (err) {
                    reject(err);
                }
            });
        });
    },

    getCollectingtablebyRow: function (SSID) {
        return new Promise(function (resolve, reject) {
            fs.readFile('credentials.json', async (err, content) => {
                if (err) {
                    console.log('Error loading client secret file:', err);
                    reject(err);
                    return;
                }
                try {
                    var oauth = await getauth(JSON.parse(content));
                    var data = await toget(oauth, SSID, '集刀' + '!A1:E31', 'ROWS');
                    resolve(data);
                }
                catch (err) {
                    reject(err);
                }
            });
        });
    },

    getBKCollectingtable: function (SSID) {
        return new Promise(function (resolve, reject) {
            fs.readFile('credentials.json', async (err, content) => {
                if (err) {
                    console.log('Error loading client secret file:', err);
                    reject(err);
                    return;
                }
                try {
                    var oauth = await getauth(JSON.parse(content));
                    var data = await toget(oauth, SSID, '集刀' + '!A33:E64', 'ROWS');
                    resolve(data);
                }
                catch (err) {
                    reject(err);
                }
            });
        });
    },

    getGroup: function (SSID) {
        return new Promise(function (resolve, reject) {
            fs.readFile('credentials.json', async (err, content) => {
                if (err) {
                    console.log('Error loading client secret file:', err);
                    reject(err);
                    return;
                }
                try {
                    var oauth = await getauth(JSON.parse(content));
                    var sheetname = getSheetName()
                    var data = await toget(oauth, SSID, sheetname + '!C41:G50', 'ROWS');
                    resolve(data);
                }
                catch (err) {
                    reject(err);
                }
            });
        });
    },

    fillin: function (range, value, SSID, sheetname) {
        return new Promise(function (resolve, reject) {
            fs.readFile('credentials.json', async (err, content) => {
                if (err) {
                    console.log('Error loading client secret file:', err);
                    reject(err);
                    return;
                }
                try {
                    var oauth = await getauth(JSON.parse(content));
                    if (sheetname === '')
                        sheetname = getSheetName()
                    result = await toset(oauth, SSID, sheetname + '!' + range, value);
                    resolve(result);
                }
                catch (err) {
                    reject(err)
                };
            });
        });
    }

}


/****************************************/


function getauth(credentials) {
    return new Promise(function (resolve, reject) {
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) reject(err);

            oAuth2Client.setCredentials(JSON.parse(token));
            resolve(oAuth2Client);
        });
    });
}

/**
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function toget(auth, sheetId, getRange, mDim) {
    return new Promise(function (resolve, reject) {
        const sheets = google.sheets({ version: 'v4', auth });
        sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: getRange,
            majorDimension: mDim,
            valueRenderOption: 'UNFORMATTED_VALUE'
        }, (err, res) => {
            if (err) {
                console.log('The API returned an error: ' + err);
                reject(err);
                return;
            }
            const rows = res.data.values;
            resolve(rows);
        });
    });
}

function toset(auth, sheetId, setRange, value) {
    return new Promise(function (resolve, reject) {
        const sheets = google.sheets({ version: 'v4', auth });

        // let values = [[value]];
        let values = value;
        const resource = {
            values,
        };

        sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: setRange,
            valueInputOption: 'RAW',
            resource,
        }, (err, res) => {
            if (err) {
                console.log('The API returned an error: ' + err);
                reject(err);
            }
            else
                // console.log(res);
                resolve(res);
        });
    });
}

function getSheetName() {
    var now = new Date();
    month = now.getMonth() + 1;
    date = now.getDate();
    hour = now.getHours()

    if (hour < 5) date -= 1;
    return (month + '/' + date)
}

// function toupdate(auth) {

//     const sheets = google.sheets({ version: 'v4', auth });

//     let values = [
//         [
//             'wwwww'// Cell values ...''
//         ],
//         // Additional rows ...
//     ];
//     const resource = {
//         values,
//     };
//     sheets.spreadsheets.values.update({
//         spreadsheetId: '1R3JHsM4X5JjAbOXUZTMe7DW6J6XN9AmqAMi-qrVo-bs',
//         range: 'new!A2',
//         valueInputOption: 'RAW',
//         resource,
//     }, (err, result) => {
//         if (err) {
//             // Handle error
//             console.log(err);
//         } else {
//             console.log('%d cells updated.', result.updatedCells);
//         }
//     });
// }

/********************** QuickStart Example **********************/
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}
/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
// function listMajors(auth) {
//     const sheets = google.sheets({ version: 'v4', auth });
//     sheets.spreadsheets.values.get({
//         spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
//         range: 'Class Data!A2:E',
//     }, (err, res) => {
//         if (err) return console.log('The API returned an error: ' + err);
//         const rows = res.data.values;
//         if (rows.length) {
//             console.log('Name, Major:');
//             // Print columns A and E, which correspond to indices 0 and 4.
//             rows.map((row) => {
//                 console.log(`${row[0]}, ${row[4]}`);
//             });
//         } else {
//             console.log('No data found.');
//         }
//     });
// }

