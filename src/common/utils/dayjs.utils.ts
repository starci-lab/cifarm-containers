import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
dayjs.extend(utc)

export const createUtcDayjs = (date?: Date): dayjs.Dayjs => dayjs(date).utc()

export const isSameDay = (day: dayjs.Dayjs, other: dayjs.Dayjs): boolean => {
    return day.isSame(other, "day")
}

