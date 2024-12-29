import { Module } from "@nestjs/common"
import { CliSqliteService } from "./cli-sqlite.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { cliSqliteEnties } from "./entities"

@Module({})
export class CliSqliteModule {
    public static forRoot() {
        return {
            module: CliSqliteModule,
            imports: [
                TypeOrmModule.forRoot({
                    type: "sqlite",
                    entities: cliSqliteEnties(),
                    synchronize: true,
                    database: "cli.sqlite",
                    logging: false
                }),
                TypeOrmModule.forFeature(cliSqliteEnties())
            ],
            providers: [
                CliSqliteService
            ],
            exports: [CliSqliteService],
        }
    }
}
