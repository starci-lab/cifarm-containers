import { Module } from "@nestjs/common"
import { SystemsService } from "./systems.service"
import { SystemsResolver } from "./systems.resolver"
import { GraphQLInterceptorsModule } from "@src/graphql"
 

@Module({
    imports: [ 
        GraphQLInterceptorsModule
    ],
    providers: [SystemsService, SystemsResolver]
})
export class SystemsModule {}
