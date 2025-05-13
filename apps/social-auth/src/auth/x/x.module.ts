import { Module } from "@nestjs/common"
import { XController } from "./x.controller"
import { XService } from "./x.service"
    
@Module({
    controllers: [XController],
    providers: [XService],
})
export class XModule {}
