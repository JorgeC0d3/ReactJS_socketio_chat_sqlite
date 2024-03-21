import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import sqlite3 from 'sqlite3';
import cors from 'cors';

//Creamos un servidor http para vincularlo a socket.io y poder establecer una comunicación a tiempo real.
const port = 4000;
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Abrir la conexión a la base de datos
const db = new sqlite3.Database('chat.db');

// Crear una tabla para almacenar las salas si no existe
db.run(`CREATE TABLE IF NOT EXISTS chatrooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT, date TEXT
)`);

// Crear una tabla para almacenar los mensajes si no existe
db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room TEXT, body TEXT, user TEXT
)`);

//Indicamos la dirección del servidor donde se ejecuta el cliente
//Con * vale cualquier dirección

const io = new SocketServer(server, {
    cors: {
        origin: "*",
    }
});

//Establecemos una escucha para comprobar cuando se conecta un cliente:
io.on('connection', socket => {
    console.log('client connected');
    //Escucha de los clientes:
    socket.on('message', (data) => {
        console.log(data);
        //Enviamos el mensaje al resto de clientes menos al que lo ha enviado:
        socket.broadcast.emit('message', {
            room: data.room,
            body: data.body,
            from: data.from
        });

        db.run('INSERT INTO messages (room, body, user) VALUES (?, ?, ?)', [data.room, data.body, data.from], function (err) {
            if (err) {
                return res.status(500).json({ error: 'Error al guardar el mensaje' });
            }
        });
    })

    //Escucha de los clientes:
    socket.on('chatroom', (data) => {
        console.log(data);
        //Enviamos el mensaje al resto de clientes menos al que lo ha enviado:
        socket.broadcast.emit('chatroom', {
            name: data.name,
            date: data.date
        });

        db.run('INSERT INTO chatrooms (name, date) VALUES (?, ?)', [data.name, data.date], function (err) {
            if (err) {
                return res.status(500).json({ error: 'Error al guardar la sala de chat' });
            }
        });
    })
})

app.get('/api/messages', (req, res) => {
    db.all('SELECT * FROM messages', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener los mensajes' });
        }
        res.json(rows);
    });
});

app.get('/api/chatrooms', (req, res) => {
    db.all('SELECT * FROM chatrooms', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener las salas de chat' });
        }
        res.json(rows);
    });
});


server.listen(port);
console.log('Server listening on port: ' + port);