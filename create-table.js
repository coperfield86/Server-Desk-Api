const fs = require('fs');
// Build paths
const { buildPathHtml } = require('./build-paths');
var request = require('request');

/**
 * Take an object which has the following model
 * @param {Object} item
 * @model
 * {
 *   "invoiceId": `Number`,
 *   "createdDate": `String`,
 *   "dueDate": `String`,
 *   "address": `String`,
 *   "companyName": `String`,
 *   "invoiceName": `String`,
 *   "price": `Number`,
 * }
 *
 * @returns {String}
 */
const createRow = (item) => `
  <tr>
    <td>${item.id}</td>
    <td>${item.display_id}</td>
    <td>${item.name}</td>
    <td>${item.impact}</td>
    <td>${item.author_type}</td>
    <td>${item.created_at}</td>
  </tr>
`;

/**
 * @description Generates an `html` table with all the table rows
 * @param {String} rows
 * @returns {String}
 */
const createTable = (rows) => `
  <table>
    <tr>
        <th>Id</td>
        <th>Display Id</td>
        <th>Name</td>
        <th>Impact</td>
        <th>Author Type</td>
        <th>Created At</td>
    </tr>
    ${rows}
  </table>
`;

/**
 * @description Generate an `html` page with a populated table
 * @param {String} table
 * @returns {String}
 */
const createHtml = (table) => `
  <html>
    <head>
      <style>
        table {
          width: 100%;
        }
        tr {
          text-align: left;
          border: 1px solid black;
        }
        th, td {
          padding: 15px;
        }
        tr:nth-child(odd) {
          background: #CCC
        }
        tr:nth-child(even) {
          background: #FFF
        }
        .no-content {
          background-color: red;
        }
      </style>
    </head>
    <body>
      ${table}
    </body>
  </html>
`;

/**
 * @description this method takes in a path as a string & returns true/false
 * as to if the specified file path exists in the system or not.
 * @param {String} filePath
 * @returns {Boolean}
 */
const doesFileExist = (filePath) => {
    try {
        fs.statSync(filePath); // get information of the specified file path.
        return true;
    } catch (error) {
        return false;
    }
};

try {
    /* Check if the file for `html` build exists in system or not */
    if (doesFileExist(buildPathHtml)) {
        console.log('Deleting old build file');
        /* If the file exists delete the file from system */
        fs.unlinkSync(buildPathHtml);
    }

    const options = {
        url: 'https://vaughnconstruction.freshservice.com/api/v2/assets?per_page=100&page=1',
        auth: {
            user: 'user',
            pass: 'pass'
        }
    };
    request.get(options, (error, response, body) => {
        if(error){
            console.log(error)
            console.log("failed to get vhosts");
            res.status(500).send('health check failed');
        }
        else{
            const jsonBody = JSON.parse(body.toString());
            if (jsonBody.assets) {
                const rows = jsonBody.assets.map(createRow).join('');
                /* generate table */
                const table = createTable(rows);
                /* generate html */
                const html = createHtml(table);
                /* write the generated html to file */
                fs.writeFileSync(buildPathHtml, html);
                console.log('Succesfully created an HTML table');
            } else {
                console.log(jsonBody.message);
            }

        }
    });
} catch (error) {
    console.log('Error generating table', error);
}
