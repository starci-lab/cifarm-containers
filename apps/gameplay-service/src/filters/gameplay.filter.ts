import { Catch, ExceptionFilter } from "@nestjs/common"
import { GrpcFailedPreconditionException } from "@src/common"
import { GameplayErrorCode, GameplayException } from "@src/gameplay"
import { GrpcInvalidArgumentException } from "nestjs-grpc-exceptions"
import { Observable, throwError } from "rxjs"

@Catch(GameplayException)
export class GameplayExceptionFilter implements ExceptionFilter<GameplayException> {
    catch(exception: GameplayException): Observable<unknown> {
        switch (exception.errorCode) {
        case GameplayErrorCode.GoldCannotBeZeroOrNegative: {
            return throwError(() => new GrpcInvalidArgumentException(exception.message).getError())
        }
        case GameplayErrorCode.TokenCannotBeZeroOrNegative: {
            return throwError(() => new GrpcInvalidArgumentException(exception.message).getError())
        }
        case GameplayErrorCode.UserInsufficientGold: {
            return throwError(() => new GrpcFailedPreconditionException(exception.message).getError())
        }
        case GameplayErrorCode.UserInsufficientToken: {
            return throwError(() => new GrpcFailedPreconditionException(exception.message).getError())
        }
        case GameplayErrorCode.ExperienceCannotBeZeroOrNegative: {
            return throwError(() => new GrpcInvalidArgumentException(exception.message).getError())
        }
        case GameplayErrorCode.InventoryQuantityNotSufficient: {
            return throwError(() => new GrpcFailedPreconditionException(exception.message).getError())
        }
        case GameplayErrorCode.EnergyNotEnough: {
            return throwError(() => new GrpcFailedPreconditionException(exception.message).getError())
        }
        }
    }
}
