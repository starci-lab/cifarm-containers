import { Module } from "@nestjs/common"
import { EnvModule, PostgreSQLContext, PostgreSQLDatabase } from "src/env"
import { CiFarmService } from "./cifarm.service"
import { PostgreSQLModule } from "@src/databases"

@Module({})
export class CiFarmModule {
    public static forRoot() {
        return {
            module: CiFarmModule,
            imports: [
                EnvModule.forRoot(),
                PostgreSQLModule.forRoot({
                    context:  PostgreSQLContext.Main,
                    database: PostgreSQLDatabase.Telegram
                }),
            ],
            providers: [
                CiFarmService
            ],
            exports: []
        }
    }
}