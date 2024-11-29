export const animalsTimeQueueConstants = {
    NAME: "animals",
    BATCH_SIZE: 10000
}

export const cropsTimeQueueConstants = {
    NAME: "crops",
    BATCH_SIZE: 10000
}

export const deliveryTimeQueueConstants = {
    NAME: "delivery",
    BATCH_SIZE: 1000 // 1 USER HAVE 9 DELIVERING PRODUCT * 1000 USERS = 9000
}
