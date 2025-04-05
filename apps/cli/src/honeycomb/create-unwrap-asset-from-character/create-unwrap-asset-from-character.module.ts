import { Module } from "@nestjs/common"
import { CreateUnwrapAssetFromCharacterCommand } from "./create-unwrap-asset-from-character.command"

@Module({
    providers: [ CreateUnwrapAssetFromCharacterCommand ],
})
export class CreateUnwrapAssetFromCharacterModule {}