import { Module } from "@nestjs/common"
import { SeedModule } from "./seed"
import { DatabaseCommand } from "./database.command"
import { BackupModule } from "./backup"
import { SanitizeUsernamesModule } from "./sanitize-usernames"
import { RestoreModule } from "./restore"

@Module({
    imports: [
        SeedModule,
        BackupModule,
        SanitizeUsernamesModule,
        RestoreModule,
    ],
    providers: [ DatabaseCommand ],
})
export class DatabaseModule {}