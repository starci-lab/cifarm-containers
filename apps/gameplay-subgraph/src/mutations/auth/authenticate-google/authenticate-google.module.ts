import { Module } from "@nestjs/common"
import { AuthenticateGoogleService } from "./authenticate-google.service"
import { AuthenticateGoogleResolver } from "./authenticate-google.resolver"
import { AuthenticateGoogleController } from "./authenticate-google.controller"
    
@Module({
    controllers: [AuthenticateGoogleController],
    providers: [AuthenticateGoogleService, AuthenticateGoogleResolver],
})
export class AuthenticateGoogleModule {}
