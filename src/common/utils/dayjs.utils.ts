import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { ObjectId } from "mongodb"

dayjs.extend(utc)

export const createUtcDayjs = (date?: Date): dayjs.Dayjs => dayjs(date).utc()

export const isSameDay = (day: dayjs.Dayjs, other: dayjs.Dayjs): boolean => {
    return day.isSame(other, "day")
}

export const createObjectId = (id: string): string => {
    let hex = Buffer.from(id, "utf-8").toString("hex")
    if (hex.length < 24) {
        hex = hex.padStart(24, "0")
    } else if (hex.length > 24) {
        hex = hex.slice(0, 24)
    }
    return ObjectId.createFromHexString(hex).toHexString()
}