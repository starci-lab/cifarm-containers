import { Module } from "@nestjs/common"
import { GameplayPostgreSQLInitModule } from "./gameplay-postgresql"

@Module({
    imports: [ GameplayPostgreSQLInitModule ],
    controllers: [],
    providers: []
})
export class InitModule { }