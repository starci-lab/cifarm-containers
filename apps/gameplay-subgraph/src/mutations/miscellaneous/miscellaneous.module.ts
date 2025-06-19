import { Module } from "@nestjs/common"
import { CreateSignedUrlModule } from "./create-signed-url"

@Module({   
    imports: [CreateSignedUrlModule]
})
export class MiscellaneousModule {}
