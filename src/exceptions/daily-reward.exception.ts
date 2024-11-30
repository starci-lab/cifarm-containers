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

export class DailyRewardTransactionFailedException extends GrpcResourceExhaustedException {
    constructor(error: Error) {
        super(`Daily reward transaction failed: ${error.message}`)
    }
}

export class UpdateTutorialTransactionFailedException extends GrpcResourceExhaustedException {
    constructor(error: Error) {
        super(`Update tutorial transaction failed: ${error.message}`)
    }
}