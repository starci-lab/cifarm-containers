import { Module } from "@nestjs/common"
import { GoogleModule } from "./google"
import { XModule } from "./x"
import{ FacebookModule } from "./facebook"

@Module({
    imports: [
        FacebookModule,
        GoogleModule,
        XModule
    ],
})
export class AuthModule {}
