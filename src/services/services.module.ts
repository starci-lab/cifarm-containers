import { Module } from "@nestjs/common"
import { BlockchainModule } from "../blockchain"
import { JwtModule } from "@src/jwt"

@Module({
    imports: [
        BlockchainModule,
        JwtModule
    ],
})

export class ServicesModule {}
 