const express = require('express');
const app = express();


//crear un servidor a partir de una libreria de express
const http= require('http').Server(app);

//para generar una conexion vamos a usar socket.io

const io = require('socket.io')(http);


//rutas

app.use(require('./routes/final'));

//donde vamos a trabajar
app.use(express.static(__dirname+"/public"));


io.on('connection',(socket)=>{
    socket.on('stream',(image)=>{
        //emitir el evento a todos los socket conectados
        socket.broadcast.emit('stream',image);
    })
});



module.exports=http;