import { Module } from "@nestjs/common"
import { AuthModule } from "../../auth"
import { ActionGateway } from "./actions.gateway"
import { ActionConsumer } from "./action.consumer"

@Module({
    imports: [AuthModule],
    exports: [ActionGateway],
    providers: [ActionGateway, ActionConsumer]
})
export class ActionModule {}
