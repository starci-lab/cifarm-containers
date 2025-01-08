import { DynamicModule, Module } from "@nestjs/common"
import { JwtService as NestJwtService } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"
import { GraphQLJwtAuthGuard, RestJwtAuthGuard, WsJwtAuthGuard } from "./guards"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./jwt.module-definition"
import { JwtService } from "./jwt.service"
import { JwtStrategy } from "./strategies"

@Module({
    imports: [PassportModule],
    providers: [
        JwtStrategy,
        NestJwtService, 
        JwtService, 
        WsJwtAuthGuard, 
        RestJwtAuthGuard, 
        GraphQLJwtAuthGuard
    ],
    exports: [ 
        JwtService, 
        WsJwtAuthGuard, 
        RestJwtAuthGuard, 
        GraphQLJwtAuthGuard 
    ]
})
export class JwtModule extends ConfigurableModuleClass {
    static forRoot(options: typeof OPTIONS_TYPE = {}) : DynamicModule{
        return super.forRoot(options)
    }
}