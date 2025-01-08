import { getQueueToken } from "@nestjs/bullmq"
import { Inject, Injectable } from "@nestjs/common"
import { ModuleRef } from "@nestjs/core"
import { Queue } from "bullmq"
import { BULL_REGISTER_OPTIONS, bullData } from "./bull.constants"
import { BullRegisterOptions } from "./bull.types"

@Injectable()
export class BullService {
    constructor(
        private readonly moduleRef: ModuleRef,
        @Inject(BULL_REGISTER_OPTIONS) private options: BullRegisterOptions,
    ) {
    }

    public getQueue() {
        return this.moduleRef.get<Queue>(getQueueToken(bullData[this.options.queueName]?.name), { strict: false })
    }
}