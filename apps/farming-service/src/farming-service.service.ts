import { Injectable } from "@nestjs/common"

@Injectable()
export class FarmingServiceService {
    getHello(): string {
        return "Hello World!"
    }
}
