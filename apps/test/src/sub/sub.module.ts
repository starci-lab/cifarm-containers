import { Module } from "@nestjs/common";
import { SubService } from "./sub.service";

@Module({
    providers: [SubService],
})
export class SubModule {}