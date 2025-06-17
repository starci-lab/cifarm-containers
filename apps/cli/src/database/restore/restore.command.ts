import { CommandRunner, Option, SubCommand } from "nest-commander"
import { Logger } from "@nestjs/common"
import { InjectMongoose } from "@src/databases"
import { Connection } from "mongoose"
import { ExecService } from "@src/exec"
import path from "path"
import { GoogleDriveService } from "@src/google-cloud"
import fsPromises from "fs/promises"
import { envConfig, isProduction } from "@src/env"
import { v4 as uuidv4 } from "uuid" 

interface RestoreCommandOptions {
    id?: string
}

@SubCommand({ name: "restore", description: "Restore the database" })
export class RestoreCommand extends CommandRunner {
    private readonly logger = new Logger(RestoreCommand.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly execService: ExecService,
        private readonly googleDriveService: GoogleDriveService
    ) {
        super()
    }

    async run(_: Array<string>, options?: RestoreCommandOptions): Promise<void> {
        if (!options?.id) {
            this.logger.error("ID (--id) is required to restore the database.")
            return
        }
        const dbName = this.connection.name
        const host = this.connection.host
        const port = this.connection.port
        // create the uri
        const uri = `"mongodb://${envConfig().databases.mongo.gameplay.username}:${envConfig().databases.mongo.gameplay.password}@${host}:${port}/?authSource=admin&readPreference=primary"`
        const restoreDir = envConfig().restore.dir || path.join(process.cwd(), ".restores")
        // create the restore dir if it doesn't exist
        await fsPromises.mkdir(restoreDir, { recursive: true })
        const restoreFolder = path.join(restoreDir, `cifarm-restore-${uuidv4()}`)
        // create the restore folder if it doesn't exist
        await fsPromises.mkdir(restoreFolder, { recursive: true })
        // create the zip file path
        const zipFilePath = path.join(restoreFolder, "data.zip")
        this.logger.log(`Downloading backup from Google Drive folder: ${options.id}`)
        await this.googleDriveService.downloadFile(options.id, zipFilePath)
        // run command to 7z the file
        await this.execService.exec("7z", ["x", zipFilePath, `-o${restoreFolder}`])
        // log the restore dir
        this.logger.log(`Restore directory: ${restoreFolder}`)
        // get the folder name
        const foldersNames = await fsPromises.readdir(restoreFolder)
        const folderName = foldersNames.at(0)
        if (!folderName) {
            this.logger.error("No folder name found in the restore directory.")
            return
        }
        this.logger.log(`Restoring database from folder: ${folderName}`)
        // run command to restore the database
        await this.execService.exec("mongorestore", [`--uri=${uri}`, 
            `--dir=${restoreFolder}/${folderName}`,
            "--gzip",
            "--drop",
            "--quiet",
            `--db="${isProduction() ? dbName : "test"}"`
        ])
        // delete everything in the restore folder
        await fsPromises.rm(restoreFolder, { recursive: true })
        // log the folder name
        this.logger.log("Database restore completed successfully.")
    }

    @Option({
        flags: "--id",
        description: "The id of the folder to restore from",
        defaultValue: "1pBjakD2Zc57a_tosDqKsegHgokKQCPlT"
    })
    parseId(id: string): string {
        return id
    }
}
