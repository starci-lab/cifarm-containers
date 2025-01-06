import { Module } from "@nestjs/common"
import { ChildProcessService } from "./base.service"

@Module({
    providers: [
        ChildProcessService
    ],
    exports: [
        ChildProcessService
    ]
})
export class ChildProcessModule {}
