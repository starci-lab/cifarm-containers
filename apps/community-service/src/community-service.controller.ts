import { Controller, Get } from "@nestjs/common"
import { CommunityServiceService } from "./community-service.service"

@Controller()
export class CommunityServiceController {
    constructor(private readonly communityServiceService: CommunityServiceService) {}

  @Get()
    getHello(): string {
        return this.communityServiceService.getHello()
    }
}
