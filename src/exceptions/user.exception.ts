import { GrpcNotFoundException, GrpcResourceExhaustedException } from "nestjs-grpc-exceptions"

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
    constructor(current: number, need: number) {
        super(`Energy not enough: ${current} (current), ${need} (need)`)
    }
}
