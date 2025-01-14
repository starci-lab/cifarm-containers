import { Catch, ExceptionFilter } from "@nestjs/common"
import { BlockchainException } from "@src/blockchain"
import { GrpcInternalException } from "nestjs-grpc-exceptions"
import { Observable, throwError } from "rxjs"

@Catch(BlockchainException)
export class BlockchainExceptionFilter implements ExceptionFilter<BlockchainException> {
    catch(exception: BlockchainException): Observable<unknown> {
        return throwError(() => new GrpcInternalException(exception.message).getError())
    }
}
