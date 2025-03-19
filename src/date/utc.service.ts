import { Injectable } from "@nestjs/common"
import dayjs, { Dayjs, ConfigType } from "dayjs"
import utc from "dayjs/plugin/utc"
import duration from "dayjs/plugin/duration"
dayjs.extend(utc)
dayjs.extend(duration)

//dayjs-wrapper service to prcess utc date logic
@Injectable()
export class DateUtcService {
    // get utc date
    public getDayjs(date?: ConfigType): Dayjs {
        return dayjs(date).utc()
    }

    public formatTime(time: number) {
        if (time < 0) {
            return "00:00:00"
        }
        return dayjs.duration(time, "seconds").format("HH:mm:ss")
    }

    // Get next day's 00:00 for a specific timezone offset
    public getNextDayMidnightUtc(timeZoneOffset: number = 7): Dayjs {
    // Get the current UTC time and set the time to the start of the next day in the specified timezone
        return dayjs().utcOffset(timeZoneOffset).add(1, "day").startOf("day")
    }
}
