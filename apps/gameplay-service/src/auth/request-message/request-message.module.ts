import { Global, Module } from "@nestjs/common"
import { RequestMessageService } from "./request-message.service"
import { RequestMessageController } from "./request-message.controller"

@Global()
@Module({
    imports: [],
    controllers: [RequestMessageController],
    providers: [RequestMessageService],
    exports: [RequestMessageService]
})
export class RequestMessageModule {}
