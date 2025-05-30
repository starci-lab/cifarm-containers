import { WithPing } from "@src/bull"

export type FruitJobData = WithPing<{
    skip?: number
    take?: number
    time: number
    utcTime: number
}>
