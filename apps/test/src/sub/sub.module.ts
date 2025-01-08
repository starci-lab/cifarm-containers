import { Module } from "@nestjs/common"
import { SubService } from "./sub.service"

@Module({
    imports: [],
    providers: [SubService],
})
export class SubModule {}