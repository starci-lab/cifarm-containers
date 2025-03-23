import { Module } from "@nestjs/common"
import { UserConsumer } from "./user.consumer"
import { UserGateway } from "./user.gateway"
import { AuthModule } from "../../auth"
@Module({
    imports: [ AuthModule ],
    exports: [UserGateway],
    providers: [ UserGateway, UserConsumer ]
})
export class UserModule {}
