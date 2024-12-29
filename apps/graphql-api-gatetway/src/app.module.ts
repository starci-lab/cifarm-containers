import { Module } from "@nestjs/common"
import { configForRoot, graphqlMaingraphForRoot } from "@src/dynamic-modules"

@Module({
    imports: [
        configForRoot(),
        graphqlMaingraphForRoot(),
    ],
    providers: []
})
export class AppModule {}
