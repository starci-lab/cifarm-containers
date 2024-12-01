import { GrpcResourceExhaustedException } from "nestjs-grpc-exceptions"

export class DailyRewardAlreadyClaimedTodayException extends GrpcResourceExhaustedException {
    constructor(time: Date) {
        super(`The daily reward has already been claimed today at: ${time}`)
    }
}

export class DailyRewardNotEqual5Exception extends GrpcResourceExhaustedException {
    constructor(dailyReward: number) {
        super(`Daily reward not equal 5: ${dailyReward}`)
    }
}