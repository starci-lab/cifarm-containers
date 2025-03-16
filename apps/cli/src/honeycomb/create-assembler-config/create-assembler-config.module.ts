import { Module } from "@nestjs/common"
import { CreateAssemblerConfigCommand } from "./create-assembler-config.command"


@Module({
    providers: [ CreateAssemblerConfigCommand ],
})
export class CreateAssemblerConfigModule {}