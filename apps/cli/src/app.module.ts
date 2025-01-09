import { Module } from "@nestjs/common"
import { EnvModule } from "@src/env"
import { DatabaseModule } from "./database"

@Module({
    imports: [
        EnvModule.forRoot(),
        DatabaseModule,
    ]
})
export class AppModule {}