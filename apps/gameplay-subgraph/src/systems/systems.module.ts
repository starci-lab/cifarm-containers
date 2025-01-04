import { Module } from "@nestjs/common"
import { SystemsService } from "./systems.service"
import { SystemsResolver } from "./systems.resolver"
import { GameplayPostgreSQLModule } from "@src/databases"
 

@Module({
    imports: [ 
        GameplayPostgreSQLModule.forRoot(),
    ],
    providers: [SystemsService, SystemsResolver]
})
export class SystemsModule {}
