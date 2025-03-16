import { Module } from "@nestjs/common"
import { CreateProfilesTreeCommand } from "./create-user-and-profile.command"


@Module({
    providers: [ CreateProfilesTreeCommand ],
})
export class CreateProfilesTreeModule {}