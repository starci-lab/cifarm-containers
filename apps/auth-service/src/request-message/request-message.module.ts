import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { HealthcheckEntity } from "@src/database"
import { RequestMessageService } from "./request-message.service"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([HealthcheckEntity])
    ],
    controllers: [],
    providers: [RequestMessageService],
    exports: [RequestMessageService],
})
export class RequestMessageModule {}