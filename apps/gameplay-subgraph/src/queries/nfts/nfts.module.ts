import { Module } from "@nestjs/common"
import { NftsService } from "./nfts.service"
import { NftsResolver } from "./nfts.resolver"

@Module({
    providers: [ NftsService, NftsResolver ]
})
export class NftsModule {}
