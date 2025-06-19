import { Module } from "@nestjs/common"
import { CreateSignedUrlService } from "./create-signed-url.service"
import { CreateSignedUrlResolver } from "./create-signed-url.resolver"

@Module({
    providers: [CreateSignedUrlService, CreateSignedUrlResolver]
})
export class CreateSignedUrlModule {}
