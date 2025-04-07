import { Module } from "@nestjs/common"
import { PlaceNFTService } from "./place-nft.service"
import { PlaceNFTGateway } from "./place-nft.gateway"

@Module({
    providers: [PlaceNFTService, PlaceNFTGateway]
})
export class PlaceNFTModule {}
