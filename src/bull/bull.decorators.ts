import { InjectQueue as NestInjectQueue } from "@nestjs/bullmq"
import { BullQueueName } from "./types"
import { bullData } from "./constants"

export const InjectQueue = (name: BullQueueName = BullQueueName.Plant) =>
    NestInjectQueue(`${bullData[name].name}`)
