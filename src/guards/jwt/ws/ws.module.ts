import { Module } from "@nestjs/common"
import { JwtModule } from "@src/jwt"
import { WsJwtAuthGuard } from "./ws.guard"

@Module(
    {
        imports: [JwtModule],
        controllers: [],
        providers: [WsJwtAuthGuard]
    }
)
export class WsJwtAuthModule {}