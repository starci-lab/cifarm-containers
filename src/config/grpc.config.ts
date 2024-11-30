import { join } from "path"

export const grpcConfig = {
    gameplay : {
        name: "GAMEPLAY_PACKAGE",
        service: "GameplayService",
        package: "gameplay",
        protoPath: join(process.cwd(), "proto", "gameplay_service", "entry.proto")
    }
}