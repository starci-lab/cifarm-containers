import { Module } from "@nestjs/common"
import { AddDataSourceCommand } from "./add-data-source.command"

@Module({
    imports: [],
    providers: [ AddDataSourceCommand ],
    exports: [ AddDataSourceCommand ]
})
export class AddDataSourceModule {}