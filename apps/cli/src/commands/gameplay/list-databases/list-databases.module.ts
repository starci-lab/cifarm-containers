import { Module } from "@nestjs/common"
import { ListDatabasesCommand } from "./list-databases.command"

@Module({
    imports: [],
    providers: [ ListDatabasesCommand ],
    exports: [ ListDatabasesCommand ]
})
export class ListDatabasesModule {}