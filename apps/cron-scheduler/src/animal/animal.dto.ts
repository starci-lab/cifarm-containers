import { WithPing } from "@src/bull"

export type AnimalJobData = WithPing<{
    skip?: number
    take?: number
    time: number
    utcTime: number
}>
