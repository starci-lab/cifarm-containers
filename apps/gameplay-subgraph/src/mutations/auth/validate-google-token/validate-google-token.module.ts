import { Module } from "@nestjs/common"
import { ValidateGoogleTokenService } from "./validate-google-token.service"
import { ValidateGoogleTokenResolver } from "./validate-google-token.resolver"
 
@Module({
    providers: [ValidateGoogleTokenService, ValidateGoogleTokenResolver],
})
export class ValidateGoogleTokenModule {
}
