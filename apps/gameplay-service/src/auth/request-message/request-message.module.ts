import { Global, Module } from "@nestjs/common"
import { RequestMessageController } from "./request-message.controller"
import { RequestMessageService } from "./request-message.service"
import { CacheRedisModule } from "@src/cache"

@Global()
@Module({
    imports: [CacheRedisModule.forFeature()],
    controllers: [RequestMessageController],
    providers: [RequestMessageService],
    exports: [RequestMessageService]
})
export class RequestMessageModule {}
