import { Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { SubService } from "./sub.service"
import { GraphQLGatewayModule } from "@src/graphql"

@Module({
    imports: [
        // GameplayModule.register({
        //     isGlobal: false
        // })

        GraphQLGatewayModule.forRoot({
            
        }),

    ],
    providers: [SubService],
})
export class SubModule {}