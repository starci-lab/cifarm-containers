import { Module } from "@nestjs/common"
import { SeedModule } from "./seed"
import { DatabaseCommand } from "./database.command"
import { BackupModule } from "./backup"

@Module({
    imports: [ SeedModule, BackupModule  ],
    providers: [ DatabaseCommand ],
})
export class DatabaseModule {}