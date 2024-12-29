import { Module } from "@nestjs/common"
import { JwtService } from "./jwt.service"
import { JwtService as NestJwtService } from "@nestjs/jwt"
import { GraphQLJwtAuthGuard, WsJwtAuthGuard, RestJwtAuthGuard } from "./guards"

@Module({
    imports: [],
    providers: [ 
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
export class JwtModule {}
