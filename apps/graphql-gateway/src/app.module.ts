import { Module } from "@nestjs/common"
import { EnvModule } from "@src/env"
import { GraphQLModule } from "@src/graphql"

@Module({
    imports: [
        EnvModule.forRoot(),
        GraphQLModule.forGateway(),
    ],
    providers: []
})
export class AppModule {}
