import { Injectable, NestMiddleware } from "@nestjs/common"
import { Request, Response, NextFunction } from "express"
import useragent from "useragent"

@Injectable()
export class DeviceInfoMiddleware implements NestMiddleware {
    use(req: Request, _: Response, next: NextFunction) {
        const userAgent = req.headers["user-agent"] // Get the user-agent from the request header
        if (userAgent) {
            const agent = useragent.parse(userAgent) // Parse the user-agent string
            const ipV4 = req.headers["x-forwarded-for"] || req.socket.remoteAddress // Get the IP address
            req["device_info"] = {
                device: agent.device,
                os: agent.os.toString(),
                browser: agent.toAgent(),
                ipV4
            }
        }
        next()
    }
}
