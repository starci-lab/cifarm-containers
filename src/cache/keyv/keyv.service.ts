import KeyvRedis, { Keyv } from "@keyv/redis"
import { KeyvAdapter } from "@apollo/utils.keyvadapter"
import { Injectable } from "@nestjs/common"
import { InjectRedis, RedisClientOrCluster } from "@src/native"
import { RedisType } from "@src/env"

@Injectable()
export class KeyvService {
    constructor(
        @InjectRedis(RedisType.Cache)
        private readonly redisClientOrCluster: RedisClientOrCluster
    ) { }

    // Method to create a KeyvRedis instance
    private createKeyvRedis(): KeyvRedis<string> {
        return new KeyvRedis(
            this.redisClientOrCluster
        )
    }

    // Method to create a Keyv instance (wrapping around KeyvRedis)
    public createKeyv(): Keyv<string> {
        return new Keyv(this.createKeyvRedis())
    }

    // Method to create KeyvAdater
    public createKeyvAdapter(): KeyvAdapter<string> {
        return new KeyvAdapter(this.createKeyv())
    }
}
