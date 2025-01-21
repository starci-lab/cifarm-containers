import { Injectable } from "@nestjs/common"
import dayjs, { Dayjs } from "dayjs"
import utc from "dayjs/plugin/utc"
dayjs.extend(utc)

//dayjs-wrapper service to prcess utc date logic
@Injectable()
export class DateUtcService {
    // get utc date
    public getDayjs(date?: Date): Dayjs {
        return dayjs(date).utc()
    }
}
