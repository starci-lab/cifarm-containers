import { Module } from "@nestjs/common"
import { SeedModule } from "./seed"
import { DatabaseCommand } from "./database.command"
import { BackupModule } from "./backup"
import { SanitizeUsernamesModule } from "./sanitize-usernames"

@Module({
    imports: [ SeedModule, BackupModule, SanitizeUsernamesModule ],
    providers: [ DatabaseCommand ],
})
export class DatabaseModule {}