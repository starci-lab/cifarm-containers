import { Module } from "@nestjs/common"
import { WsUserLinkedGuard } from "./ws-user-linked.guard"

@Module(
    {
        imports: [],
        controllers: [],
        providers: [WsUserLinkedGuard]
    }
)
export class WsUserLinkedModule {}