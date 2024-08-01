import axios from "axios";
import getOrCreateFolder from "./GetFolderID";

export default async function CreateFlowerOrder(googleAccessToken, text) {
  try {
    const authHeaders = {
      Authorization: `Bearer ${googleAccessToken}`,
      "Content-Type": "application/json",
    };

    const folderId = await getOrCreateFolder(googleAccessToken, 'temp')
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
            insertText: {
              text: text,
              location: {index: 2}
            }
          }          
        ],
      },
      {
        headers: authHeaders,
      }
    );    

    return documentId
  } catch (error) {
    console.error("Error al crear el documento:", error);
    throw error
  }
}
