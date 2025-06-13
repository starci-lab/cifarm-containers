import { Module } from "@nestjs/common"
import { SanitizeUsernamesCommand } from "./sanitize-usernames.command"
@Module({
    providers: [SanitizeUsernamesCommand]
})
export class SanitizeUsernamesModule {}
