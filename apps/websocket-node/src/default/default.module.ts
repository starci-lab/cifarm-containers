import { Module } from "@nestjs/common"
import { configForRoot } from "@src/dynamic-modules"
import { DefaultGateway } from "./default.gateway"
import { BcryptModule } from "@src/services/hash/bcrypt"

@Module({
    imports: [
        configForRoot(),
        BcryptModule,
    ],
    controllers: [],
    providers: [DefaultGateway]
})
export class DefaultModule { }
