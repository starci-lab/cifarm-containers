import { Module } from "@nestjs/common"
import { MintResourceCommand } from "./mint-resource.command"


@Module({
    providers: [ MintResourceCommand ],
})
export class MintResourceModule {}