import { Module } from "@nestjs/common"
import { PlaceNFTModule } from "./place-nft"

@Module({
    imports: [ PlaceNFTModule ]
})
export class NFTModule {}
