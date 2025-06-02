import { Module } from "@nestjs/common"
import { BackupCommand } from "./backup.command"
@Module({
    providers: [BackupCommand]
})
export class BackupModule {}
