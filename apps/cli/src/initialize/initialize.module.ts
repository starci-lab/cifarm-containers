import { Module } from "@nestjs/common"
import { GameplayPostgreSQLModule } from "./gameplay-postgresql"

@Module({
    imports: [ GameplayPostgreSQLModule ],
    controllers: [],
    providers: []
})
export class InitializeModule { }