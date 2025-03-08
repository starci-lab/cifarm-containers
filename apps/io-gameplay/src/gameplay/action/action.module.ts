import { Module } from "@nestjs/common"
import { AuthModule } from "../auth"
import { ActionGateway } from "./action-gateway"
import { ActionController } from "./action.controller"

@Module({
    imports: [AuthModule],
    controllers: [ActionController],
    providers: [ActionGateway]
})
export class ActionModule {}
