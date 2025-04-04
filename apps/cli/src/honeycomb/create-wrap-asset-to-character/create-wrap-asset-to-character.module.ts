import { Module } from "@nestjs/common"
import { CreateWrapAssetToCharacterCommand } from "./create-wrap-asset-to-character.command"

@Module({
    providers: [ CreateWrapAssetToCharacterCommand ],
})
export class CreateWrapAssetToCharacterModule {}