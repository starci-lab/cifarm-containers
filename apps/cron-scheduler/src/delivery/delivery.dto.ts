import { WithPing } from "@src/bull"

export type DeliveryJobData = WithPing<{
    utcTime?: number
    skip?: number
    take?: number
}>
