import express from "express"
// express -> 프레임워크
// express를 이용해서 백엔드 서버를 만들 수 있음

const app = express()

app.set("view engine", "pug") // pug로 view engine 설정
app.set("views", __dirname + "/views") // express에 pug templet이 어디있는지 지정

app.use("/public", express.static(__dirname + "/public")) // public url을 생성해서 유저가 주소의 /public으로 들어왔을 때 파일을 공유

// "/"은 아무것도 하지 않은 home 주소를 의미
// .get은 GET 방식으로 무언가를 한다는 것을 의미
// render("home")의 home은 home.pug를 의미
// home.pug를 render해주는 route handler
app.get("/", (req, res) => res.render("home"))

const handleListen = () => console.log(`Listening on http://localhost:3000`)

app.listen(3000, handleListen) // 3000은 포트번호를 의미, 3000번 포트로 들어오면 handleListen 콜백 함수를 실행하겠다는 의미