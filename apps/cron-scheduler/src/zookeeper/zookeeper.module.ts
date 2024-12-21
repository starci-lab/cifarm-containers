import { Global, Module } from "@nestjs/common"
import { ZooKeeperService } from "./zookeeper.service"

@Global()
@Module({
    imports: [],
    controllers: [],
    providers: [ZooKeeperService],
    exports: [ZooKeeperService]
})
export class ZooKeeperModule {}