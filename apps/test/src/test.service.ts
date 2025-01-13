import { Injectable } from "@nestjs/common"
import { TestingService } from "@src/testing"

@Injectable()
export class TestService {
    //constructor
    constructor(
        private readonly testService: TestingService
    ){
        console.log(this.testService.generateMockUserForGameplay())
    }
}
