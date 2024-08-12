import axios from 'axios'
import getOrCreateFolder from "./GetOrCreateFolder.js";

export default async function CreateTransactionCSV(googleAccessToken, CSVData) {
    try {
        const authHeaders = {
            Authorization: `Bearer ${googleAccessToken}`,
            "Content-Type": "application/json",
        };


        const folderId = await getOrCreateFolder(googleAccessToken, 'Transaction Exports')

        const driveResponse = await axios.post(
            "https://sheets.googleapis.com/v4/spreadsheets",
            {},
            {
                headers: authHeaders
            }
        );

        const spreadsheetId = driveResponse.data.spreadsheetId;

        let requests = []

        /**
         * An example of CSVData would be:
         * [
            {
                projectid: 2,
                projectdescription: 'House Account Landmark 2024 - June',
                transactionamount: '999',
                vendorname: 'Associated',
                invoicedate: '21-06-2024',
                transactiondate: '09-07-2024',
                splitamm: 528.75,
                invoiceamount: 528.75,
                invoiceid: 19
            },
            {
                projectid: 2,
                projectdescription: 'House Account Landmark 2024 - June',
                transactionamount: '999',
                vendorname: 'Associated',
                invoicedate: '03-06-2024',
                transactiondate: '09-07-2024',
                splitamm: 1418.75,
                invoiceamount: 1418.75,
                invoiceid: 38
            }
            ]

            i want the following colums in the csv file to math the values from the objects:

            Transaction Date : transactiondate
            Vendor : vendorname
            Transaction Amount: invoiceamount
            Project Tag : projectdescription
            Purchase Date : invoicedate
            Split Amount : splitamm
         */
        
        requests.push({
            updateCells: {
                rows: [
                    {
                    values: [
                        { userEnteredValue: { stringValue: 'Transaction Date'} },
                        { userEnteredValue: { stringValue: 'Vendor' } },
                        { userEnteredValue: { stringValue: 'Transaction Amount' } },
                        { userEnteredValue: { stringValue: 'Project Tag' } },
                        { userEnteredValue: { stringValue: 'Purchase Date' } },
                        { userEnteredValue: { stringValue: 'Split Amount' } }
                    ]
                    }
                ],
                fields: "userEnteredValue",
                start: {
                    sheetId: 0,
                    rowIndex: 0,
                    columnIndex: 0
                }
            }
        })

        // Add data rows
        CSVData.forEach((row, index) => {
            requests.push({
                updateCells: {
                    rows: [
                        {
                        values: [
                            { userEnteredValue: { stringValue: row.transactiondate } },
                            { userEnteredValue: { stringValue: row.vendorname } },
                            { userEnteredValue: { numberValue: parseFloat(row.invoiceamount) } },
                            { userEnteredValue: { stringValue: `${row.clientname}:${row.projectdescription}` } },
                            { userEnteredValue: { stringValue: row.invoicedate } },
                            { userEnteredValue: { numberValue: row.splitamm } }
                        ]
                        }
                    ],
                    fields: "userEnteredValue",
                    start: {
                        sheetId: 0,
                        rowIndex: index + 1,
                        columnIndex: 0
                    }
                }
            });
        });

        await axios.post(
            
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
            {
                requests,
            },
            {
                headers: authHeaders
            }
        )

        return spreadsheetId
    } catch (error) {
        console.log(error.response.data)
    }
}