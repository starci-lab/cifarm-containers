import { join } from "path"

export const shopGrpcConstants = {
    NAME: "SHOP_PACKAGE",
    SERVICE: "ShopService",
    PACKAGE: "shop",
    PROTO_PATH: join(process.cwd(), "proto", "shop.proto"),
}
