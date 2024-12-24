import { Module } from "@nestjs/common"
import { GameplayCommand } from "./gameplay.command"
import { AddDataSourceModule } from "./add-data-source"
import { ListDataSourcesModule } from "./list-data-sources"
import { SelectDataSourcesModule } from "./select-data-source"
import { SeedModule } from "./seed"

@Module({
    imports: [AddDataSourceModule, ListDataSourcesModule, SelectDataSourcesModule, SeedModule],
    providers: [GameplayCommand],
    exports: [GameplayCommand]
})
export class GameplayModule { }