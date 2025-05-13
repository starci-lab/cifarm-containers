import { Module } from "@nestjs/common"
import { FacebookController } from "./facebook.controller"
import { FacebookService } from "./facebook.service"
@Module({
    controllers: [FacebookController],
    providers: [FacebookService],
})
export class FacebookModule {}
