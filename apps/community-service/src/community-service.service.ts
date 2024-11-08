import { Injectable } from "@nestjs/common"

@Injectable()
export class CommunityServiceService {
    getHello(): string {
        return "Hello World!"
    }
}
