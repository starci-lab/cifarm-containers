import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UserEntity } from "@src/database"
import { VerifySignatureService } from "./verify-signature.service"

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    controllers: [],
    providers: [VerifySignatureService],
    exports: [VerifySignatureService],
})
export class VerifySignatureModule {}
