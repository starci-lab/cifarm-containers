import { CommandRunner, SubCommand } from "nest-commander"
import { Logger } from "@nestjs/common"
import { InjectMongoose } from "@src/databases"
import { Connection } from "mongoose"
import { ExecService } from "@src/exec"
import path from "path"
import { GoogleDriverService } from "@src/google-cloud"
import fs from "fs/promises"
import { Readable } from "stream"
import { envConfig } from "@src/env"

@SubCommand({ name: "backup", description: "Backup the database" })
export class BackupCommand extends CommandRunner {
    private readonly logger = new Logger(BackupCommand.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly execService: ExecService,
        private readonly googleDriverService: GoogleDriverService
    ) {
        super()
    }

    async run(): Promise<void> {
        // get the url of the database
        const host = this.connection.host
        const port = this.connection.port
        const dbName = this.connection.name
        const uri = `mongodb://${envConfig().databases.mongo.gameplay.username}:${envConfig().databases.mongo.gameplay.password}@${host}:${port}/?authSource=admin&readPreference=primary`
        // get the backup folder name
        const backupFolderName = `cifarm-${new Date().toISOString().replace(/[:.]/g, "-")}`
        const backupDir = envConfig().backup.dir || path.join(process.cwd(), ".backups")
        const backupFolderPath = path.join(backupDir, backupFolderName) 
        await this.execService.exec("mongodump", [
            `--uri="${uri}"`,
            `--out="${backupFolderPath}"`,
            `--db="${dbName}"`,
            "--gzip",
            "--quiet"
        ])
        // read all files in the backup folder
        const dataBaseBackupFolderPath = path.join(backupFolderPath, dbName)
        const files = await fs.readdir(dataBaseBackupFolderPath)
        // map files to full paths
        const backupFilePaths = files.map((file) => path.join(dataBaseBackupFolderPath, file))
        // prepare files for upload in the expected format (like Multer files)
        const backupFiles = await Promise.all(
            backupFilePaths.map(async (filePath): Promise<Express.Multer.File> => {
                const fileBuffer = await fs.readFile(filePath)
                const fileName = path.basename(filePath)
                return {
                    buffer: fileBuffer,
                    originalname: fileName,
                    fieldname: fileName,
                    size: fileBuffer.length,
                    stream: Readable.from(fileBuffer),
                    destination: backupFolderPath,
                    filename: fileName,
                    path: filePath,
                    mimetype: "application/octet-stream",
                    encoding: "binary",
                }
            })
        )
        // upload folder with files
        await this.googleDriverService.uploadFolder({
            folderName: backupFolderName,
            files: backupFiles,
        })
        this.logger.log("Backup completed")
    }
}
