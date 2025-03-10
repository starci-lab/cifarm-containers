import axios from "axios"

const getResponse = async (url: string, body: any) => {
    try {
        const response = await axios.post(url, body, {
            headers: {
                "Authorization": "Bearer " + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Y2UyM2I3M2JhYTBmZGI4YWM2MTkxNSIsImlhdCI6MTc0MTU2MjgwNywiZXhwIjoxNzQyMTY3NjA3fQ.PU0IOwswFuwNel-dnZM3H1fELBIU9HnvsJHXW-0Wus4"
            }
        })
        //add tokens to the header
        // response.headers["Authorization"] = "Bearer " + token
        console.log(response.status)
    } catch (error) {
        console.log(error.response?.data)
        return
    }
}

const t = async () => {
    await Promise.all([
        getResponse("http://localhost:3001/api/v1/gameplay/water", { 
            placedItemTileId: "67ce23b73baa0fdb8ac61928"      
        }),
        getResponse("http://localhost:3001/api/v1/gameplay/water", { 
            placedItemTileId: "67ce23b73baa0fdb8ac61928"      
        }),
        getResponse("http://localhost:3001/api/v1/gameplay/water", { 
            placedItemTileId: "67ce23b73baa0fdb8ac61928"      
        }),
        getResponse("http://localhost:3001/api/v1/gameplay/water", { 
            placedItemTileId: "67ce23b73baa0fdb8ac61928"      
        }),
    ])
}
t()
