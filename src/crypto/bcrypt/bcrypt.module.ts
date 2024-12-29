import { Module } from "@nestjs/common"
import { BcryptService } from "./bcrypt.service"

@Module({
    imports: [],
    controllers: [],
    providers: [BcryptService],
    exports: [BcryptService],
})
export class BcryptModule {}