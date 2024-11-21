import { join } from "path"

export const placedItemGrpcConstants = {
    NAME: "PLACED_ITEM_PACKAGE",
    SERVICE: "PlacedItemService",
    PACKAGE: "placed_item",
    PROTO_PATH: join(process.cwd(), "proto", "placed_item/entry.proto")
}
