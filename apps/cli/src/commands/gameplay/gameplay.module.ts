import { Module } from "@nestjs/common"
import { GameplayCommand } from "./gameplay.command"
import { AddDatabaseModule } from "./add-database"
import { ListDatabasesModule } from "./list-databases"
import { SelectDatabaseModule } from "./select-database"

@Module({
    imports: [ AddDatabaseModule, ListDatabasesModule, SelectDatabaseModule ],
    providers: [ GameplayCommand ],
    exports: [ GameplayCommand ]
})
export class GameplayModule {}