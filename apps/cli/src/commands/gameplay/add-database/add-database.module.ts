import { Module } from "@nestjs/common"
import { AddDatabaseCommand } from "./add-database.command"

@Module({
    imports: [],
    providers: [ AddDatabaseCommand ],
    exports: [ AddDatabaseCommand ]
})
export class AddDatabaseModule {}