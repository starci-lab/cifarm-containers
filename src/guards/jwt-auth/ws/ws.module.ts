import { Module } from "@nestjs/common"
import { JwtModule } from "@src/services"
import { WsJwtAuthGuard } from "./ws.guard"

@Module(
    {
        imports: [JwtModule],
        controllers: [],
        providers: [WsJwtAuthGuard]
    }
)
export class WsJwtAuthModule {}