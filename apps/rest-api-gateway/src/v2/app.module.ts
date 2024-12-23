import { Module } from "@nestjs/common"
import { AuthModule } from "./auth"

@Module({
    imports: [AuthModule],
    exports: [AuthModule]
})
export class AppModuleV2 {}