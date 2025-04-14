import { Module } from "@nestjs/common"
import { PublishCastModule } from "./publish-cast"
import { FarcasterCommand } from "./farcaster.command"

@Module({
    providers: [
        FarcasterCommand
    ],
    imports: [
        PublishCastModule
    ],
})
export class FarcasterModule {}