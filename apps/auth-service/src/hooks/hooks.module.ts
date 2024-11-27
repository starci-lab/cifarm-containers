import { Module } from "@nestjs/common"
import { AfterAuthenticatedModule } from "./after-authenticated"

@Module({
    imports: [AfterAuthenticatedModule]
})
export class HooksModule {}
