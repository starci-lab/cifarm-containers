import { join } from "path"

export const inventoryGrpcConstants = {
    NAME: "INVENTORY_PACKAGE",
    SERVICE: "InventoryService",
    PACKAGE: "inventory",
    PROTO_PATH: join(process.cwd(), "proto", "inventory/entry.proto")
}
