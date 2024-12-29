import { Module } from "@nestjs/common"
import { SeedCommand } from "./seed.command"
import { CliSqliteModule } from "@src/databases"

@Module({
    imports: [
        CliSqliteModule.forRoot()
    ],
    providers: [ SeedCommand ],
    exports: [ SeedCommand ]
})
export class SeedModule {
}
