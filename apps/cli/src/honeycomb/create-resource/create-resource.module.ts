import { Module } from "@nestjs/common"
import { CreateResourceCommand } from "./create-resource.command"

@Module({
    providers: [ CreateResourceCommand ],
})
export class CreateResourceModule {}