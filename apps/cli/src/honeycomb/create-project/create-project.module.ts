import { Module } from "@nestjs/common"
import { CreateProjectCommand } from "./create-project.command"

@Module({
    providers: [ CreateProjectCommand ],
})
export class CreateProjectModule {}