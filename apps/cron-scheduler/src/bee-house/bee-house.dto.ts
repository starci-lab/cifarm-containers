import { WithPing } from "@src/bull"

export type BeeHouseJobData = WithPing<{
    skip?: number
    take?: number
    time: number
    utcTime: number
}>