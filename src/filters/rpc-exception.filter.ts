import { Catch, RpcExceptionFilter, ArgumentsHost, Logger, HttpException, HttpStatus } from "@nestjs/common"
import { Observable, throwError } from "rxjs"
import { RpcException } from "@nestjs/microservices"

@Catch(RpcException)
export class ExceptionFilter implements RpcExceptionFilter<RpcException> {
    private readonly logger = new Logger(ExceptionFilter.name)

    catch(exception: RpcException | Error, host: ArgumentsHost): Observable<{
    message: string;
    statusCode: number;
    service: string;
  }> {
        const context = host.switchToRpc().getContext()
        const serviceName = context?.constructor?.name || "Unknown Service"

        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
        const message = exception instanceof HttpException ? exception.message : "Internal Server Error"

        this.logger.error(`Exception in service ${serviceName}: status=${status}, message=${message}`)

        return throwError(() => ({
            statusCode: status,
            message,
            service: serviceName,
        }))
    }
}
