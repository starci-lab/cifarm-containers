import { Module } from "@nestjs/common"
import { AuthenticateGoogleService } from "./authenticate-google.service"
import { AuthenticateGoogleResolver } from "./authenticate-google.resolver"
 
@Module({
    providers: [AuthenticateGoogleService, AuthenticateGoogleResolver],
})
export class AuthenticateGoogleModule {
}
