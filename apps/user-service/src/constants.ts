import { join } from "path"

export const userGrpcConstants = {
    NAME: "USER_PACKAGE",
    SERVICE: "UserService",
    PACKAGE: "user",
    PROTO_PATH: join(process.cwd(), "proto", "user/user.proto")
}
