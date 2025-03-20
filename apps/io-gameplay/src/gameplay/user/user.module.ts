import { Module } from "@nestjs/common"
import { UserConsumer } from "./user.consumer"
import { UserGateway } from "./user.gateway"
import { AuthModule } from "../auth"
import { UserService } from "./user.service"
@Module({
    imports: [ AuthModule ],
    providers: [ UserGateway, UserConsumer, UserService ]
})
export class UserModule {}
