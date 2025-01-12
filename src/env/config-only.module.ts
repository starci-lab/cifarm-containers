import { Module } from "@nestjs/common"
import { EnvModule } from "./env.module"

@Module({
    imports: [
        EnvModule.forRoot(),
    ],
})
export class ConfigOnlyModule {}