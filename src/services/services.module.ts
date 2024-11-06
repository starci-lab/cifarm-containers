import { Module } from "@nestjs/common"
import { BlockchainModule } from "./blockchain"

@Module({
    imports: [
        BlockchainModule,
    ],
})
export class ServicesModule {}
 