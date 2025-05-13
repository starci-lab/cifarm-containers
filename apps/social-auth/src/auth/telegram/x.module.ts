import { Module } from "@nestjs/common"
import { XController } from "./x.controller"
    
@Module({
    controllers: [XController],
    providers: [],
})
export class XModule {}
