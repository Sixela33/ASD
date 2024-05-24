import axios from 'axios'
import getOrCreateFolder from "./GetOrCreateFolder.js";
import crypto from 'crypto'

/*
presentationData = {
    slideTitle: [
        { itemImageURL, itemText }, { itemImageURL, itemText }...
    ],
    slide2Title: [
        { itemImageURL, itemText }, { itemImageURL, itemText }...
    ], ...
}
*/

export default async function createPresentation(googleAccessToken, presentationData) {
    try {

        const authHeaders = {
            Authorization: `Bearer ${googleAccessToken}`,
            "Content-Type": "application/json",
        };

        const folderId = await getOrCreateFolder(googleAccessToken, 'temp')

        // Step 1: Create a new presentation
        const driveResponse = await axios.post(
            "https://slides.googleapis.com/v1/presentations",
            {
                title: 'Flower Catalog'
            },
            {
                headers: authHeaders
            }
        );

        const presentationId = driveResponse.data.presentationId;
        
        await axios.patch(
            `https://www.googleapis.com/drive/v3/files/${presentationId}`,
            {
                addParents: folderId,
                removeParents: "root",
            },
            {
                headers: authHeaders,
            }
        );
        
        
        let requests = [];
        
        const maxItemsPerSlide = 8

        for (const slideTitle in presentationData) {
            const slideContent = presentationData[slideTitle];
            if (slideContent.length > maxItemsPerSlide) {
                let actualCount = 0
                while (actualCount < slideContent.length) {
                    requests.push(...addSlide(slideTitle, slideContent.slice(actualCount, actualCount+maxItemsPerSlide)))
                    actualCount += maxItemsPerSlide
                }
            } else {
                requests.push(...addSlide(slideTitle, slideContent))
            }
        }

        // Execute requests to insert slide and content
        await axios.post(
            `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
            {
                requests,
            },
            {
                headers: authHeaders
            }
        )

        return presentationId; // Return the ID of the created presentation
    } catch (error) {
        console.error("Error creating presentation:", error.message);
        throw error;
    }
}

function addSlide (title, items) {
    const requests = []

    const slideID = crypto.randomBytes(16).toString('hex')
    const titleTextBoxID = crypto.randomBytes(16).toString('hex')

    requests.push({
        createSlide: {
            objectId: slideID,
            slideLayoutReference: {
                predefinedLayout: "BLANK"
            }
        },
    },
    {
        createImage: {
            url: 'https://ramelax.com.ar/asd-black.png',
            elementProperties: {
                pageObjectId: slideID,
                size: {
                    height: {magnitude: 75, unit: 'PT'},
                    width: {magnitude: 150, unit: 'PT'}, 
                },
                transform: {
                    scaleX: 1,
                    scaleY: 1,
                    translateY: 20,
                    unit: 'PT',
                },
            },
        }
    },
    {
        createShape: {
            objectId: titleTextBoxID,
            shapeType: 'TEXT_BOX',
            elementProperties: {
                pageObjectId: slideID,
                size: {
                  height: {magnitude: 20,unit: 'PT'},
                  width: {magnitude: 200,unit: 'PT'},
                },
                transform: {
                  scaleX: 1,
                  scaleY: 1,
                  translateX: 300,
                  translateY: 20,
                  unit: 'PT',
                },
            }
        }
    }, 
    {
        insertText: {
            objectId: titleTextBoxID,
            insertionIndex: 0,
            text: title,
        }
    },
    {
        updateTextStyle: {
            objectId: titleTextBoxID,
            style: {
                bold: true
            },
            textRange: { type: "ALL" },
            fields: 'bold'
        }
    },
    {
        updateTextStyle: {
            objectId: titleTextBoxID,
            style: {
                foregroundColor: {
                    opaqueColor: {
                        rgbColor: {
                            red: 0,
                            green: 0,
                            blue: 0
                          }
                    }
                }
            },
            textRange: { type: "ALL" },
            fields: 'foregroundColor'
        }
    });

    const x_separationBetweenCards = 150
    const y_separationBetweenCards = 150
    let colcount = 0
    let rowcount = 0
    let maxItemsXRow = 4
    for (let flower of items) {
        requests.push(...addCard(
            colcount * x_separationBetweenCards, 
            (rowcount * y_separationBetweenCards) +30, 
            slideID , 
            flower.flowerimage, 
            flower.flowername
        ))
        colcount++
        if (colcount == maxItemsXRow) {
            colcount = 0
            rowcount += 1
        }

    }
    

    return requests
}


function addCard(baseX, baseY, slideID, imageURL, imageText) {
    const textBoxID = crypto.randomBytes(16).toString('hex')
    const requests = []

    
    if (imageURL) {
        requests.push({
            createImage: {
                url: imageURL,
                elementProperties: {
                    pageObjectId: slideID,
                    size: {
                        height: {
                            magnitude: 100,
                            unit: "PT",
                        },
                        width: {
                            magnitude: 100,
                            unit: "PT",
                        },
                    },
                    transform: {
                        scaleX: 1,
                        scaleY: 1,
                        translateX: baseX + 50,
                        translateY: baseY + 70,
                        unit: "PT",
                    },
                },
            }
        })
    }
    
    
    requests.push({
        createShape: {
            objectId: textBoxID,
            shapeType: 'TEXT_BOX',
            elementProperties: {
                pageObjectId: slideID,
                size: {
                  height: {magnitude: 25,unit: 'PT'},
                  width: {magnitude: 200,unit: 'PT'},
                },
                transform: {
                  scaleX: 1,
                  scaleY: 1,
                  translateX: baseX + 50,
                  translateY: baseY + 170,
                  unit: 'PT',
                },
            }
        }
    }, 
    {
        insertText: {
            objectId: textBoxID,
            insertionIndex: 0,
            text: imageText || 'Not found',
        }
    },
    {
        updateTextStyle: {
            objectId: textBoxID,
            style: {
                fontSize: { magnitude: 12, unit: "PT"}
            },
            textRange: { type: "ALL" },
            fields: 'fontSize'
        }
    },
    {
        updateTextStyle: {
            objectId: textBoxID,
            style: {
                foregroundColor: {
                    opaqueColor: {
                        rgbColor: {
                            red: 0,
                            green: 0,
                            blue: 0
                          }
                    }
                }
            },
            textRange: { type: "ALL" },
            fields: 'foregroundColor'
        }
    })

    return requests
}