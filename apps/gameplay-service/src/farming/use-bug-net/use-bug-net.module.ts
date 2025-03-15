import { Module } from "@nestjs/common"
import { UseBugNetController } from "./use-bug-net.controller"
import { UseBugNetService } from "./use-bug-net.service"

@Module({
    controllers: [UseBugNetController],
    providers: [UseBugNetService]
})
export class UseBugNetModule {}
