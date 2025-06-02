import { Injectable, Logger } from "@nestjs/common"
import { envConfig } from "@src/env"
import { Auth, drive_v3 } from "googleapis"
import { Readable } from "stream"

@Injectable()
export class GoogleDriverService {
    private readonly auth: Auth.GoogleAuth
    private readonly drive: drive_v3.Drive
    private readonly logger = new Logger(GoogleDriverService.name)
    constructor() {
        this.auth = new Auth.GoogleAuth({
            credentials: {
                client_email: envConfig().googleCloud.credentials.clientEmail,
                private_key: envConfig().googleCloud.credentials.privateKey
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
}

export interface UploadFolderParams {
    folderName: string
    files: Array<Express.Multer.File>
}
