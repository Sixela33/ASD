import axios from "axios";
import getOrCreateFolder from "./GetFolderID";

export default async function CreateFlowerOrder(googleAccessToken, text) {
  try {
    const authHeaders = {
      Authorization: `Bearer ${googleAccessToken}`,
      "Content-Type": "application/json",
    };

    const folderId = await getOrCreateFolder(googleAccessToken, 'temp')
    console.log("folderId", folderId)
    const driveResponse = await axios.post(
      "https://www.googleapis.com/drive/v3/files",
      {
        name: "FlowerOrder",
        mimeType: "application/vnd.google-apps.document",
        parents: [folderId]
      },
      {
        headers: authHeaders,
      }
    );

    const documentId = driveResponse.data.id;

    await axios.post(
      `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`,
      {
        requests: [
          {
            insertInlineImage: {
              location: {index: 1},
              uri: "https://ramelax.com.ar/asd-2.png", // logo de la compañía
              objectSize: {
                width:  {magnitude: 200, unit: "PT"},
                height: {magnitude: 150, unit: "PT"},
              },
            },
          },
          {
            insertText: {
              text: "\n\n",
              location: {index: 2},
            },
          },
          {
            insertText: {
              text: text,
              location: {index: 3}
            }
          }          
        ],
      },
      {
        headers: authHeaders,
      }
    );    

    const url = 'https://docs.google.com/document/d/' + documentId

    window.open(url, '_blank').focus();

    return
  } catch (error) {
    console.error("Error al crear el documento:", error);
    return { success: false, error: error };
  }
}
