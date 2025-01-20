import { Catch, ExceptionFilter } from "@nestjs/common"
import { BlockchainErrorCode, BlockchainException } from "@src/blockchain"
import { GrpcInvalidArgumentException } from "nestjs-grpc-exceptions"
import { Observable, throwError } from "rxjs"

@Catch(BlockchainException)
export class BlockchainExceptionFilter implements ExceptionFilter<BlockchainException> {
    catch(exception: BlockchainException): Observable<unknown> {
        switch (exception.errorCode) {
        case BlockchainErrorCode.ChainKeyNotFound: {
            return throwError(() => new GrpcInvalidArgumentException(exception.message).getError())
        }
        case BlockchainErrorCode.PlatformNotFound: {
            return throwError(() => new GrpcInvalidArgumentException(exception.message).getError())
        }
        }
    }
}
