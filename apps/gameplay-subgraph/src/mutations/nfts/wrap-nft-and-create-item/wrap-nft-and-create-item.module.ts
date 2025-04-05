import { Module } from "@nestjs/common"
import { UpdateFollowXService } from "./wrap-nft-and-create-item.service"
import { UpdateFollowXResolver } from "./wrap-nft-and-create-item.resolver"

@Module({
    providers: [UpdateFollowXService, UpdateFollowXResolver]
})
export class UpdateFollowXModule {}
