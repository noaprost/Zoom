import express from "express"
// express -> 프레임워크
// express를 이용해서 백엔드 서버를 만들 수 있음

const app = express()

app.set("view engine", "pug")
app.set("views", __dirname + )

const handleListen = () => console.log(`Listening on http://localhost:3000`)

app.listen(3000, handleListen) // 3000은 포트번호를 의미, 3000번 포트로 들어오면 handleListen 콜백 함수를 실행하겠다는 의미