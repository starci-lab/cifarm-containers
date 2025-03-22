import { Module } from "@nestjs/common"
import { UserConsumer } from "./user.consumer"
import { UserGateway } from "./user.gateway"
import { AuthModule } from "../auth"
@Module({
    imports: [ AuthModule ],
    providers: [ UserGateway, UserConsumer ]
})
export class UserModule {}
