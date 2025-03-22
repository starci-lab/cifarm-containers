import { Catch, ExceptionFilter } from "@nestjs/common"
import { BlockchainException } from "@src/blockchain"
import { GraphQLError } from "graphql"
import { Observable } from "rxjs"

@Catch(BlockchainException)
export class BlockchainExceptionFilter implements ExceptionFilter<BlockchainException> {
    catch(exception: BlockchainException): Observable<unknown> {
        throw new GraphQLError(exception.message, {
            extensions: {
                code: exception.errorCode
            }
        })
    }
}
