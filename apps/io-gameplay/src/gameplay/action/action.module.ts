import { Module } from "@nestjs/common"
import { AuthModule } from "../auth"
import { ActionGateway } from "./action-gateway"
import { ActionConsumer } from "./action.consumer"

@Module({
    imports: [AuthModule],
    providers: [ActionGateway, ActionConsumer]
})
export class ActionModule {}
