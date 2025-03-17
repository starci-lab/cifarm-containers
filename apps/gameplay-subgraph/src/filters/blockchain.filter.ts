import { Catch, ExceptionFilter } from "@nestjs/common"
import { BlockchainException } from "@src/blockchain"
import { GraphQLError } from "graphql"
import { Observable, throwError } from "rxjs"

@Catch(BlockchainException)
export class BlockchainExceptionFilter implements ExceptionFilter<BlockchainException> {
    catch(exception: BlockchainException): Observable<unknown> {
        return throwError(() => new GraphQLError(exception.message, {
            extensions: {
                code: exception.errorCode
            }
        }))
    }
}
