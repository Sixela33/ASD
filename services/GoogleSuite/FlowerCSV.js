import axios from 'axios'
import getOrCreateFolder from "./GetOrCreateFolder.js";

export default async function CreateFlowerListCSV(googleAccessToken, CSVData) {
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
        
        requests.push({
            updateCells: {
                rows: [
                    {
                    values: [
                        { userEnteredValue: { stringValue: 'Flower ID'} },
                        { userEnteredValue: { stringValue: 'Flower Name'} },
                        { userEnteredValue: { stringValue: 'Color' } },
                        { userEnteredValue: { stringValue: 'Stem Price' } },
                        { userEnteredValue: { stringValue: 'Image File' } }
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
            let flowerColors = '';
            row.flowercolors.forEach((color, index) => {
                if (index === 0) {
                    flowerColors = color;
                } else {
                    flowerColors = `${flowerColors}-${color}`;
                }
            });
            
            requests.push({
                updateCells: {
                    rows: [
                        {
                        values: [
                            { userEnteredValue: { numberValue: row.flowerid } },
                            { userEnteredValue: { stringValue: row.flowername } },
                            { userEnteredValue: { stringValue: flowerColors } },
                            { userEnteredValue: { numberValue: row.initialprice } },
                            { userEnteredValue: { stringValue: row.flowerimage } },
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