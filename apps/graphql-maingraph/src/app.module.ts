import { HealthCheckModule } from "./health-check"
import { Module } from "@nestjs/common"
import { configForRoot, graphqlMaingraphForRoot } from "@src/dynamic-modules"

@Module({
    imports: [
        configForRoot(),
        graphqlMaingraphForRoot(),
        HealthCheckModule
    ],
    providers: []
})
export class AppModule {}
