import { InjectQueue as NestInjectQueue } from "@nestjs/bullmq"
import { BullQueueName } from "./bull.types"
import { bullData } from "./bull.constants"

export const InjectQueue = (name: BullQueueName = BullQueueName.Crop) =>
    NestInjectQueue(bullData[name].name)
