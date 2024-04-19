import axios from "axios"

export default async function getOrCreateFolder(googleAccessToken, folderName) {
    try {
        const authHeaders = {
            Authorization: `Bearer ${googleAccessToken}`,
            "Content-Type": "application/json",
        }
        
        const driveResponse = await axios.get(
        "https://www.googleapis.com/drive/v3/files",
        {
            params: {q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`},
            headers: authHeaders,
        })

        let folderId
        if (driveResponse.data.files.length > 0) {
            folderId = driveResponse.data.files[0].id

        } else {
            // La carpeta 'temp' no existe, crearla
            const createFolderResponse = await axios.post(
                "https://www.googleapis.com/drive/v3/files",
                {
                    name: "temp",
                    mimeType: "application/vnd.google-apps.folder",
                },
                {
                    headers: authHeaders,
                }
            )
            folderId = createFolderResponse.data.id
        }

        return folderId
    } catch (error) {
        console.log('Error while getting folder', error)
    }
}