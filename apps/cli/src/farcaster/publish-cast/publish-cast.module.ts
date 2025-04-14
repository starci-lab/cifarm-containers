import { Module } from "@nestjs/common"
import { PublishCastCommand } from "./publish-cast.command"

@Module({
    providers: [ PublishCastCommand ],
})
export class PublishCastModule {}