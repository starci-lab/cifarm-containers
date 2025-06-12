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

    // get today midnight utc
    public getTodayMidnightUtc(): Dayjs {
        return dayjs().utc().startOf("day")
    }

    public getNextCronRunUtc(minuteMarks: Array<number> = [0, 15, 30, 45], hourMarks?: Array<number>): Dayjs {
        const now = this.getDayjs()
    
        // Sort to ensure ascending order
        const sortedMinutes = [...minuteMarks].sort((a, b) => a - b)
        const sortedHours = hourMarks ? [...hourMarks].sort((a, b) => a - b) : undefined
    
        for (let addHour = 0; addHour <= 24; addHour++) {
            const currentHour = now.add(addHour, "hour").hour()
    
            if (!sortedHours || sortedHours.includes(currentHour)) {
                for (const min of sortedMinutes) {
                    const candidate = now
                        .add(addHour, "hour")
                        .set("minute", min)
                        .set("second", 0)
                        .set("millisecond", 0)

                    if (candidate.isAfter(now)) {
                        return candidate
                    }
                }
            }
        }
    
        // Fallback to the first available time the next day
        const fallback = now.add(1, "day")
            .set("hour", sortedHours?.[0] ?? 0)
            .set("minute", sortedMinutes[0])
            .set("second", 0)
            .set("millisecond", 0)
    
        return fallback
    }
}
