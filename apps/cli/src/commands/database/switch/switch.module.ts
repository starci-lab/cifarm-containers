import { Module } from "@nestjs/common"
import { SwitchCommand } from "./switch.command"
import { CliSqliteModule } from "@src/databases"

@Module({
    imports: [ CliSqliteModule.forRoot() ],
    providers: [ 
        SwitchCommand 
    ],
    exports: [ SwitchCommand ]
})
export class SwitchModule {
}
