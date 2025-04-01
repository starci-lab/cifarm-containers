import { Module } from "@nestjs/common"
import { UserConsumer } from "./user.consumer"
import { UserGateway } from "./user.gateway"
@Module({
    exports: [UserGateway],
    providers: [ UserGateway, UserConsumer ]
})
export class UserModule {}
