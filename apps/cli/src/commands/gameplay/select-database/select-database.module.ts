import { Module } from "@nestjs/common"
import { SelectDatabaseCommand } from "./select-database.command"

@Module({
    imports: [],
    providers: [ SelectDatabaseCommand ],
    exports: [ SelectDatabaseCommand ]
})
export class SelectDatabaseModule {}