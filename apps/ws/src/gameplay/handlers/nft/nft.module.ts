import { Module } from "@nestjs/common"
import { PlaceNFTModule } from "./place-nft"

@Module({
    providers: [ PlaceNFTModule ]
})
export class NFTModule {}
