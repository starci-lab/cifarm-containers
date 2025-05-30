import { WithPing } from "@src/bull"

export type EnergyJobData = WithPing<{
    skip?: number
    take?: number
    time: number
    utcTime: number
}>
