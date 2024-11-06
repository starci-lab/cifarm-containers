import { Global, Module } from "@nestjs/common"
import { JwtService } from "./jwt.service"
import { JwtService as NestJwtService } from "@nestjs/jwt"
@Global()
@Module({
    imports: [],
    providers: [NestJwtService, JwtService],
    exports: [JwtService],
})
export class JwtModule {}
