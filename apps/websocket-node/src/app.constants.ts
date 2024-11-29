export enum Namespace {
    Default = "default",
    Broadcast = "broadcast"
}

export const namespaceConstants = {
    [Namespace.Default]: {
        NAMESPACE: "",
        events: {
            LINK_SESSION: "link_session"
        }
    },
    [Namespace.Broadcast]: {
        NAMESPACE: "broadcast",
        events: {
            PLACED_ITEMS: "placed_items"
        }
    }
}
