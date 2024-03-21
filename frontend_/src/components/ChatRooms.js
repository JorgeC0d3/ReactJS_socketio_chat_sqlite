import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
const server = "http://localhost:4000";
const socket = io(server);

function ChatRooms() {

    const [chatRooms, setChatRooms] = useState([]);
    const [chatRoom, setChatRoom] = useState('');

    useEffect(() => {
        getChatrooms();

        socket.on("chatroom", message => {
            //console.log(message);
            //Guardamos los mensajes recibidos. De este modo se resetea el array:
            //setMessages([...messages, message]);
            //De este modo se preservan los estados anteriores:
            receiveChatRoom(message);

        })
        console.log(chatRooms);
        //Apagamps el evento para que no duplique los mensajes recibidos:
        return () => {
            socket.off("chatroom");
        }

    }, [])

    async function getChatrooms() {
        const data = await fetch(server + '/api/chatrooms');
        const chatrooms = await data.json();
        setChatRooms(chatrooms);

    }



    function receiveChatRoom(message) {
        setChatRooms((state) => [...state, message])
    }

    function handleInputChange(e) {
        setChatRoom(e.target.value);
    }

    function handleSubmit(e) {
        e.preventDefault();
        setChatRooms([
            ...chatRooms,
            {
                name: chatRoom,
                date: new Date().toDateString()
            }
        ]);
        //Emitimos el mensaje al servidor:
        socket.emit("chatroom", { name: chatRoom, date: new Date().toDateString() });
        setChatRoom('');
    }

    return (
        <div className="mt-5">
            <form onSubmit={handleSubmit}>
                <div id="card-new-room" className='d-flex justify-content-center mt-3'>
                    <input type="text" className="form-control mx-2" placeholder="Nueva sala de chat..." name="chatRoom" value={chatRoom} onChange={handleInputChange} />
                    <button className='btn btn-secondary mx-2' type="submit">Crear</button>
                </div>
            </form>

            {
                chatRooms.map((room, i) => {
                    return (
                        <Link to={`/ChatRoom/${room.name}`} key={i} className='link'>
                            <div className='card mt-3 mx-2 card-chatroom'>
                                <div className='card-body'>
                                    <div className='d-flex justify-content-between'>
                                        <span className='fw-bold'>{room.name}</span>
                                        <small className='text-muted'>{room.date}</small>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                })
            }

        </div>
    )
}

export default ChatRooms;