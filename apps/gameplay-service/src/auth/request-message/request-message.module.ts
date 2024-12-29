import { Global, Module } from "@nestjs/common"
import { RequestMessageService } from "./request-message.service"
import { RequestMessageController } from "./request-message.controller"
import { CacheRedisModule } from "@src/databases"

@Global()
@Module({
    imports: [
        CacheRedisModule.forRoot()
    ],
    controllers: [RequestMessageController],
    providers: [RequestMessageService],
    exports: [RequestMessageService]
})
export class RequestMessageModule {}
