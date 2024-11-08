import { Injectable } from "@nestjs/common"

@Injectable()
export class ShopServiceService {
    getHello(): string {
        return "Hello World!"
    }
}
