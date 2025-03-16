import { Module } from "@nestjs/common"
import { RequestMessageResolver } from "./request-message.resolver"
import { RequestMessageService } from "./request-message.service"

 
@Module({
    providers: [RequestMessageService, RequestMessageResolver],
    exports: [RequestMessageService]
})
export class RequestMessageModule {}
