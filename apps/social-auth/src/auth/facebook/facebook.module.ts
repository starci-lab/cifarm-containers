import { Module } from "@nestjs/common"
import { FacebookController } from "./facebook.controller"
    
@Module({
    controllers: [FacebookController],
    providers: [],
})
export class FacebookModule {}
