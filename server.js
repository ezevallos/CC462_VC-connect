const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server) //se crea server socket
const { v4: uuidV4 } = require('uuid')  //uuid que se usara para las salas

app.set('view engine', 'ejs')   //modulo para renderizar plantillas
app.use(express.static('public'))

app.get('/',(req,res)=>{    //Ruta raiz '/'
    res.redirect(`/${uuidV4()}`)    //redirige a sala aleatoria
})

app.get('/:room',(req, res)=>{  //Ruta /'room-id'
    res.render('room',{roomId: req.params.room})    //renderiza la plantilla room.ejs
})

//Eventos de sockets
io.on('connection', socket => { //Nueva conexion
    socket.on('join-room', (roomId, userId) => {    //Cuando usuario entra a la sala
        //console.log(roomId, userId);
        socket.join(roomId) //Subscribe socket a canal de la sala

        //Notifica a todosque se conecta un nuevo usuario a la sala
        socket.to(roomId).broadcast.emit('user-connected',userId)   
        
        socket.on('disconnect', () => { //Cuando se desconecta un usuario
            //Se notifica a todos que salió un usuario
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})

server.listen(3000) //Abre puerto en el 3000