import { Module } from "@nestjs/common"
import { SubService } from "./sub.service"

@Module({
    imports: [
        // GameplayModule.register({
        //     isGlobal: false
        // })

        // GraphQLGatewayModule.forRoot({
            
        // }),

    ],
    providers: [SubService],
})
export class SubModule {}