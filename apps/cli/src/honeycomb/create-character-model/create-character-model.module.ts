import { Module } from "@nestjs/common"
import { CreateCharacterModelCommand } from "./create-character-model.command"


@Module({
    providers: [ CreateCharacterModelCommand ],
})
export class CreateCharacterModelModule {}