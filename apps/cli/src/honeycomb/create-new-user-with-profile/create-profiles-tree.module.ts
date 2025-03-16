import { Module } from "@nestjs/common"
import { CreateProfilesTreeCommand } from "./create-profiles-tree.command"


@Module({
    providers: [ CreateProfilesTreeCommand ],
})
export class CreateProfilesTreeModule {}