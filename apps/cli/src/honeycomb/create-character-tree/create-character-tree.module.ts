import { Module } from "@nestjs/common"
import { CreateCharacterTreeCommand } from "./create-character-tree.command"


@Module({
    providers: [ CreateCharacterTreeCommand ],
})
export class CreateCharacterTreeModule {}