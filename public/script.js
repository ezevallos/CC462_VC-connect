const socket = io('/')
const videoGrid = document.getElementById('video-grid')
/*const myPeer = new Peer(undefined, {
    host: '/',
    path: '/myapp',
    port: '3000'
})*/
const myPeer = new Peer()
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

//Se abre la camara y microfono
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream) //Se muestra video del usuario actual

    myPeer.on('call', call => { //Configura evento call
        call.answer(stream) //Responde con stream de video
        const video = document.createElement('video') //nueva vista de video
        call.on('stream', userVideoStream => { //Cuando se emite video
            addVideoStream(video, userVideoStream) //Muestra en la casilla del usuario actual
        })
    })

    socket.on('user-connected', userId => { //Cuando un usuario nuevo entra
        connectToNewUser(userId, stream) //Conecta usuario actual con el nuevo
    })
})

socket.on('user-disconnected', userId => {  //Cuando un usuario se desconecto
    if (peers[userId]) peers[userId].close()    //Cierra recepcion de su video
})

myPeer.on('open', id =>{    //Cuando se conecta a PeerServer
    socket.emit('join-room', ROOM_ID, id)   //Se avisa al server que se une a la sala
})

//Funcion que conecta el usuario actual con otro
function connectToNewUser(userId, stream){
    const call = myPeer.call(userId, stream) //Conecta para stream de video
    const video = document.createElement('video') //una nueva casilla para ese usuario
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })

    //Cuando un usuario se desconecta
    call.on('close', () => {
        video.remove() //Se remueve el video
    })

    peers[userId] = call  //Se agrega a la lista de usuarios
}

//Funcion para mostrar video en el navegador
function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}