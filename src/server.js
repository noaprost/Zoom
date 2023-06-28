// nodemon은 우리 프로젝트를 살펴보고 변경 사항이 있을 시 서버를 재시작 해주는 프로그램
// 서버를 재시작 하는 대신에 babel-node를 실행
// babel-node를 실행시키면 babel.config.json으로 이동하고 거기서 코드에 적용해야 하는 preset을 실행
// babel은 우리가 작성한 코드를 일반 NodeJS 코드로 컴파일 해줌
// 그 작업을 우리가 설정한 src/server.js에 해줌

//import WebSocket from "ws"
import http from "http"
import { Server } from "socket.io"
import { instrument } from "@socket.io/admin-ui"
import express from "express"
// express -> 프레임워크
// express를 이용해서 백엔드 서버를 만들 수 있음

const app = express() // express application 생성

app.set("view engine", "pug") // pug로 view engine 설정
app.set("views", __dirname + "/views") // express에 pug templet이 어디있는지 지정

app.use("/public", express.static(__dirname + "/public")) // public url을 생성해서 유저가 주소의 /public으로 들어왔을 때 파일을 공유해줌
// public 폴더 안에 있는 것들은 프론트에서 사용되는 파일들
// 나중에 js 파일을 많이 다루다보면 어떤게 프론트껀지 헷갈리므로 public 폴더를 만들어서 관리하는 것은 중요 

// "/"은 아무것도 하지 않은 home 주소를 의미
// .get은 GET 방식으로 무언가를 한다는 것을 의미
// render("home")의 home은 home.pug를 의미
// home.pug를 render해주는 route handler
app.get("/", (_, res) => res.render("home"))
app.get("/*", (_, res) => res.redirect("/")) // user가 어느페이지에 가더라도 home page로 돌려줌

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    corS : {
        origin : ["https://admin.socket.io"],
        credentials : true,
    },
});

instrument(wsServer, {
    auth : false,
})

//{sids, rooms}안의 이름은 실제 이름과 같아야 함
function publicRooms(){
    const {sockets : {
        adapter : {sids, rooms},
        },
    } = wsServer
    let publicRooms = []
    rooms.forEach((_, key) => {
        if(sids.get(key) === undefined){
            publicRooms.push(key)
        }
    })
    console.log(publicRooms)
    return publicRooms
}

function countRooms(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size
}

wsServer.on("connection", (socket) => {
    wsServer.sockets.emit("room_change", publicRooms())
    socket.onAny((event) => {
        console.log(event)
    })
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName)
        done()
        socket.to(roomName).emit("welcome", socket.nickname, countRooms(roomName))
        wsServer.sockets.emit("room_change", publicRooms())
    })
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname, countRooms(room)))
    })
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms())
    })
    socket.on("new_message", (msg, name, send) => {
        socket.to(name).emit("new_message", socket.nickname, msg)
        send()
    })
    socket.on("nickname", nickname => socket["nickname"] = nickname)
})


// <WebSocket으로 만든 실시간 채팅 기능>
// WebSocket은 브라우저에서 제공하기 때문에 따로 설치가 필요 없음
/*
const wss = new WebSocket.Server({server})

function onSocketClose(){
    console.log("Disconnected from the Browser")
}

const sockets = []
wss.on("connection", (socket) => {
    sockets.push(socket)
    socket["nickname"] = "Anno"
    console.log("Connected to Browser")
    socket.on("close", onSocketClose)
    socket.on("message", (msg) => {
        const message = JSON.parse(msg)
        switch(message.type){
            case "new_message" :
                sockets.forEach((aSocket) => aSocket.send(`${socket.nickname} : ${message.payload}`))
            case "nickname" :
                socket["nickname"] = message.payload                
        }
    })
})
*/

httpServer.listen(3000, () => console.log(`Listening on http://localhost:3000`)) // 3000은 포트번호를 의미, 3000번 포트로 들어오면 handleListen 콜백 함수를 실행하겠다는 의미
