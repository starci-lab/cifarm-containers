import { Module } from "@nestjs/common"
import { RestoreCommand } from "./restore.command"
@Module({
    providers: [RestoreCommand]
})
export class RestoreModule {}
