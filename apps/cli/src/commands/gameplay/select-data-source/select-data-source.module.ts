import { Module } from "@nestjs/common"
import { SelectDataSourceCommand } from "./select-data-source.command"

@Module({
    imports: [],
    providers: [ SelectDataSourceCommand ],
    exports: [ SelectDataSourceCommand ]
})
export class SelectDataSourcesModule {}