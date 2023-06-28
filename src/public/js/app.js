// socket.io를 설치하면 개발자모드에서 io라는 함수를 볼 수 있음
// io는 자동적으로 백의 socket.io와 연결해주는 함수
// io 함수는 알아서 socket.io를 실행하고 있는 서버를 찾아줌
const socket = io()

const welcome = document.querySelector("#welcome")
const roomForm = welcome.querySelector("#roomname")
const nickForm = welcome.querySelector("#nickname")
const room = document.querySelector("#room")
const openRoomsTxt = welcome.querySelector("h4")
const openRoomList = welcome.querySelector("ul")

room.hidden = true
roomForm.hidden = true
openRoomsTxt.hidden = true
openRoomList.hidden = true

let roomName
let nickname

function showRoom(){
    welcome.hidden = true
    room.hidden = false
    const roomNameTxt = room.querySelector("h3")
    roomNameTxt.innerText = `Room ${roomName}`
    const form = room.querySelector("form")
    form.addEventListener("submit", onHandleSendMessage)
}

function onHandleSendMessage(event){
    event.preventDefault()
    const input = room.querySelector("input")
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`${nickname} : ${input.value}`)
        input.value = ""
    })
}

function onHandleRoomSubmit(event){
    event.preventDefault()
    const roomInput = welcome.querySelector("#roomname input")
    roomName = roomInput.value
    socket.emit("enter_room", roomInput.value, showRoom) // 첫번째는 이름, 마지막은 함수
    roomInput.value = ""
}

function onHandleNickSubmit(event){
    event.preventDefault()
    const nickInput = welcome.querySelector("#nickname input")
    nickname = nickInput.value
    socket.emit("nickname", nickname)
    nickInput.value = ""
    nickForm.hidden = true
    roomForm.hidden = false
    openRoomsTxt.hidden = false
    openRoomList.hidden = false
}

function addMessage(message){
    const ul = room.querySelector("ul")
    const li = document.createElement("li")
    li.innerText = message
    ul.appendChild(li)
}

function updateRoomTitle(roomName, newCount){
    const roomNameTxt = room.querySelector("h3")
    roomNameTxt.innerText = `Room ${roomName} (${newCount})`
}

roomForm.addEventListener("submit", onHandleRoomSubmit)
nickForm.addEventListener("submit", onHandleNickSubmit)

socket.on("welcome", (user, newCount) => {
    addMessage(`${user} joined this room!`)
    updateRoomTitle(roomName, newCount)
})

socket.on("bye", (user, newCount) => {
    addMessage(`${user} left this room T.T`)
    updateRoomTitle(roomName, newCount)
})

socket.on("new_message", (nickname, msg) => {
    addMessage(`${nickname} : ${msg}`)
})

socket.on("room_change", (rooms) => {
    openRoomList.innerHTML = ""
    rooms.forEach((room) => {
        const li = document.createElement("li")
        li.innerText = room
        openRoomList.appendChild(li)
    });
})