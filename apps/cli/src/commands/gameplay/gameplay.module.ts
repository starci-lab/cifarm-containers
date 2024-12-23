import { Module } from "@nestjs/common"
import { GameplayCommand } from "./gameplay.command"
import { AddDatabaseModule } from "./add-database"
import { ListDatabasesModule } from "./list-databases"

@Module({
    imports: [ AddDatabaseModule, ListDatabasesModule ],
    providers: [ GameplayCommand ],
    exports: [ GameplayCommand ]
})
export class GameplayModule {}