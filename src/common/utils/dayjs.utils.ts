import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
dayjs.extend(utc)

export const createUtcDayjs = (): dayjs.Dayjs => dayjs().utc()