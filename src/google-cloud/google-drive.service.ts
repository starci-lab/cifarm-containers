import { Injectable, Logger } from "@nestjs/common"
import { envConfig } from "@src/env"
import { Auth, drive_v3 } from "googleapis"
import { Readable } from "stream"
import fs from "fs"

@Injectable()
export class GoogleDriveService {
    private readonly auth: Auth.GoogleAuth
    private readonly drive: drive_v3.Drive
    private readonly logger = new Logger(GoogleDriveService.name)
    constructor() {
        this.auth = new Auth.GoogleAuth({
            credentials: {
                client_email: envConfig().googleCloud.driver.clientEmail,
                private_key: envConfig().googleCloud.driver.privateKey
            },
            scopes: ["https://www.googleapis.com/auth/drive"]
        })
        this.drive = new drive_v3.Drive({ auth: this.auth })
    }

    public async uploadFolder(
        {
            folderName,
            files
        }: UploadFolderParams
    ): Promise<string> {
        try {
            // 1. Create a new folder on Google Drive
            const folderResponse = await this.drive.files.create({
                requestBody: {
                    name: folderName,
                    mimeType: "application/vnd.google-apps.folder",
                    parents: [envConfig().googleCloud.driver.folderId],
                },
                fields: "id",
            })
            this.logger.log(`Folder created: ${folderResponse.data.id}`)
            const folderId = folderResponse.data.id
      
            // 2. Upload each file to the new folder
            for (const file of files) {
                const media = {
                    mimeType: file.mimetype,
                    body: Readable.from(file.buffer),
                }
      
                const fileResponse = await this.drive.files.create({
                    requestBody: {
                        name: file.originalname,
                        mimeType: file.mimetype,
                        parents: [folderId],
                    },
                    media: media,
                    fields: "id",
                })
                this.logger.log(`File uploaded: ${fileResponse.data.id}`)
            }
      
            // 3. Return the folder URL
            return `https://drive.google.com/drive/folders/${folderId}`
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    public async downloadFile(
        id: string,
        outputPath: string
    ): Promise<void> {
        try {
            console.log(id)
            // get the zipped file  
            // Get the file content as a stream
            const response = await this.drive.files.get({
                fileId: id,
                alt: "media"
            }, { responseType: "stream" })
            // Create a write stream to save the file
            const dest = fs.createWriteStream(outputPath)
            // Return a promise that resolves when download completes
            return new Promise<void>((resolve, reject) => {
            // Pipe the download stream to the file
                (response.data as Readable)
                    .pipe(dest)
                    .on("finish", () => {
                        console.log(`Download completed: ${outputPath}`)
                        resolve()
                    })
                    .on("error", (error) => {
                        console.error("Download error:", error)
                        fs.unlink(outputPath, () => {}) // Clean up partial download
                        reject(error)
                    })
            })
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }
}

export interface UploadFolderParams {
    folderName: string
    files: Array<Express.Multer.File>
}
