import {
    GrpcInvalidArgumentException,
    GrpcNotFoundException,
    GrpcResourceExhaustedException
} from "nestjs-grpc-exceptions"

export class UserNotFoundException extends GrpcNotFoundException {
    constructor(id: string) {
        super(`User not found: ${id}`)
    }
}

export class EnergyExceedsMaximumException extends GrpcResourceExhaustedException {
    constructor(current: number, max: number) {
        super(`Energy exceeds maximum: ${current} (current), ${max} (max)`)
    }
}

export class EnergyBelowZeroException extends GrpcResourceExhaustedException {
    constructor(current: number) {
        super(`Energy below zero: ${current}`)
    }
}

export class EnergyNotEnoughException extends GrpcResourceExhaustedException {
    constructor(current: number, required: number) {
        super(`Energy not enough: ${current} (current), ${required} (required)`)
    }
}

export class UserInsufficientGoldException extends GrpcResourceExhaustedException {
    constructor(current: number, required: number) {
        super(`User has insufficient gold: ${current} (current), ${required} (required)`)
    }
}

export class UserInsufficientTokenException extends GrpcResourceExhaustedException {
    constructor(current: number, need: number) {
        super(`User has insufficient token: ${current} (current), ${need} (need)`)
    }
}

export class ExperienceCannotBeZeroOrNegativeException extends GrpcResourceExhaustedException {
    constructor(experiences: number) {
        super(`Experience cannot be zero or negative: ${experiences}`)
    }
}

export class GoldCannotBeZeroOrNegativeException extends GrpcResourceExhaustedException {
    constructor(message: string) {
        super(`Gold cannot be zero or negative: ${message}`)
    }
}

export class TokenCannotBeZeroOrNegativeException extends GrpcResourceExhaustedException {
    constructor(message: string) {
        super(`Token cannot be zero or negative: ${message}`)
    }
}

export class SelfFollowException extends GrpcInvalidArgumentException {
    constructor(id: string) {
        super(`Cannot self follow: ${id}`)
    }
}

export class SelfVisitException extends GrpcInvalidArgumentException {
    constructor(id: string) {
        super(`Cannot self visit: ${id}`)
    }
}
