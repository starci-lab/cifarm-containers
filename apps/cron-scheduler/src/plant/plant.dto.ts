import { WithPing } from "@src/bull"

export type CropJobData = WithPing<{
    skip?: number
    take?: number
    time: number
    utcTime: number
}>
