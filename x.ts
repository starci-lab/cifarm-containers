import cluster from "cluster"

if (cluster.isPrimary) {
    console.log("I am primary")
    cluster.fork()
    cluster.fork()
    cluster.on("message", (worker, message) => {
        console.log(`Message from worker ${worker.process.pid}: ${message}`)
    })
} else {
    console.log("I am worker")
    process.send({
        "type": 9,
        "data": {
            "requestId": "c95774b57d5ab33e",
            "workerId": 2,
            "sockets": [
                {
                    "id": "6DR5pdnga0kENqJSAAAB",
                    "handshake": {
                        "headers": {
                            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YjkxNGM4LWM3MjgtNGFhMi05ZmJlLTAwYjc4YTRhNmU5YyIsImlhdCI6MTczNjg3NTY0MywiZXhwIjoxNzM3NDgwNDQzfQ.EsVa0H-tnK8Ybf0YHEmCnbhEF4VmL8epToX96QDvUJ0",
                            "sec-websocket-version": "13",
                            "sec-websocket-key": "MLAB6QhVJ34DpHWGv5QTDA==",
                            "connection": "Upgrade",
                            "upgrade": "websocket",
                            "sec-websocket-extensions": "permessage-deflate; client_max_window_bits",
                            "host": "localhost:3003"
                        },
                        "time": "Wed Jan 15 2025 04:39:11 GMT+0700 (Indochina Time)",
                        "address": "::ffff:127.0.0.1",
                        "xdomain": false,
                        "secure": false,
                        "issued": 1736890751156,
                        "url": "/socket.io/?EIO=4&transport=websocket",
                        "query": {
                            "EIO": "4",
                            "transport": "websocket"
                        },
                        "auth": {}
                    },
                    "rooms": [
                        "6DR5pdnga0kENqJSAAAB",
                        "67b914c8-c728-4aa2-9fbe-00b78a4a6e9c"
                    ],
                    "data": {
                        "_admin": {
                            "clientId": "2GufBkiKQLPr",
                            "transport": "websocket"
                        },
                        "userId": "67b914c8-c728-4aa2-9fbe-00b78a4a6e9c",
                        "observerUserId": "67b914c8-c728-4aa2-9fbe-00b78a4a6e9c"
                    }
                }
            ]
        },
        "source": "_sio_adapter",
        "nsp": "/core"
    })
}