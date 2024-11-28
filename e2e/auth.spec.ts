import { sleep } from "@aptos-labs/ts-sdk"
import { execSync } from "child_process"

describe("Authentication flow", () => {
    beforeAll(async () => {
        // Turn on all service
        execSync("nest start auth-service")
        console.log("Auth service started")
        //wait 10s for the service to start
        await sleep(10000)
    }, 30000)

    it("Should main flow work", async () => {
        console.log("Main flow test")
    }, 30000)

    // afterAll(async () => {
    //     // Turn off all service
    //     execSync("nest stop auth service")
    //     console.log("Auth service stopped")
    // })
})