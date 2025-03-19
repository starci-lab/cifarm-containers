import { Module, Provider } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./pubsub.module-definition"
import { PubSub } from "graphql-subscriptions"
import { PUB_SUB } from "@apps/gameplay-subgraph/src/constants"

@Module({})
export class GraphQLPubSubModule extends ConfigurableModuleClass { 
    public static register(options: typeof OPTIONS_TYPE) {
        const dynamicModule = super.register(options)
        const pubSubProvider : Provider = {
            provide: PUB_SUB,
            useValue: new PubSub()
        }
        return {
            ...dynamicModule,
            providers: [
                ...dynamicModule.providers      ,
                pubSubProvider
            ],
            exports: [
                pubSubProvider
            ]
        }
    }
}