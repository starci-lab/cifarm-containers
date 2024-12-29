import { Global, Module } from "@nestjs/common"
import { CacheRedisModule } from "@src/databases"
import { RequestMessageController } from "./request-message.controller"
import { RequestMessageService } from "./request-message.service"

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
