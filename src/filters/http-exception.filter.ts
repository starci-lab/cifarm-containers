import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from "@nestjs/common"
import { Request, Response } from "express"
import { Logger } from "@nestjs/common"
  
  @Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name)
  
    catch(exception: {
        stack: string
        message: string
    }, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<Request>()
  
        const status =
        exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR
  
        const message =
        exception instanceof HttpException
            ? exception.getResponse()
            : exception.message || "Internal server error"
  
        // Logging the exception details
        this.logger.error(
            `HTTP Status: ${status} Error Message: ${message}`,
            exception.stack,
        )
  
        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
        })
    }
}
  