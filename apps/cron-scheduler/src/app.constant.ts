export const animalsTimeQueueConstants = {
    name: "animals",
    BATCH_SIZE: 10000
}

export const cropsTimeQueueConstants = {
    name: "crops",
    BATCH_SIZE: 10000
}

export const deliveryTimeQueueConstants = {
    name: "delivery",
    BATCH_SIZE: 1000 // 1 USER HAVE 9 DELIVERING PRODUCT * 1000 USERS = 9000
}
