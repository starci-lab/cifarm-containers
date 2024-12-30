import { Module } from "@nestjs/common"
import { AuthModule } from "./auth"
import { EnvModule } from "@src/env"

@Module({
    imports: [EnvModule.forRoot(), AuthModule],
    exports: [AuthModule]
})
export class AppModuleV2 {}