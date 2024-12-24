import { Module } from "@nestjs/common"
import { ListDataSourcesCommand } from "./list-data-sources.command"

@Module({
    imports: [],
    providers: [ ListDataSourcesCommand ],
    exports: [ ListDataSourcesCommand ]
})
export class ListDataSourcesModule {}