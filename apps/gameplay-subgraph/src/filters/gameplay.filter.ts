import { Catch, ExceptionFilter } from "@nestjs/common"
import { GameplayException } from "@src/gameplay"
import { GraphQLError } from "graphql"
import { Observable, throwError } from "rxjs"

@Catch(GameplayException)
export class GameplayExceptionFilter implements ExceptionFilter<GameplayException> {
    catch(exception: GameplayException): Observable<unknown> {
        return throwError(() => new GraphQLError(exception.message, {
            extensions: {
                code: exception.errorCode
            }
        }))
    }
}
