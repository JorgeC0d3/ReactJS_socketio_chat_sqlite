import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

const server = "http://localhost:4000";
const socket = io(server);

function ChatRoom() {
    const { chatRoom } = useParams();

    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [savedMessages, setSavedMessages] = useState([]);

    // Crear una referencia para el div
    const divRef = useRef(null);

    //Obtenemos los mensajes del resto de clientes conectados:
    useEffect(() => {
        getMessages();
        socket.on("message", message => {
            //console.log(message);
            //Guardamos los mensajes recibidos. De este modo se resetea el array:
            //setMessages([...messages, message]);
            //De este modo se preservan los estados anteriores:
            receiveMessage(message);

        })
        console.log(messages);
        //Apagamps el evento para que no duplique los mensajes recibidos:
        return () => {
            socket.off("message");
        }

    }, [])

    async function getMessages() {
        const data = await fetch(server + '/api/messages');
        const messages = await data.json();
        setSavedMessages(messages);

    }

    function receiveMessage(message) {
        setMessages((state) => [...state, message]);
        scrollToBottom();
    }

    function handleSubmit(e) {
        e.preventDefault();
        //console.log(message);
        const newMessage = {
            room: chatRoom,
            body: message,
            from: name
        }
        //Guardamos nuestro mensaje para verlo en pantalla:
        setMessages([...messages, newMessage]);
        //Emitimos el mensaje al servidor:
        socket.emit("message", newMessage);
        setMessage("");
        scrollToBottom();

    }

    // Función para enfocar al final del div
    const scrollToBottom = () => {
        if (divRef.current) {
            const lastChild = divRef.current.lastElementChild;
            if (lastChild) {
                lastChild.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }
    };

    return (
        <div>
            <h3 className='text-center mt-3' id="title">{chatRoom}</h3>

            <Link to='/' className='link'>
                Volver
            </Link>

            <div id="card-name" className='d-flex justify-content-center mt-3'>
                <input type="text" className='form-control' placeholder="Escribe tu nombre..." onChange={(e) => setName(e.target.value)} />
            </div>

            <div className='card mt-3 card-container' id="card-message">
                <div className='card-body'>
                    <form onSubmit={handleSubmit}>
                        <div className='d-flex justify-content-center'>
                            <input type="text" className='form-control mx-1' placeholder="Escribe tu mensaje..." onChange={(e) => setMessage(e.target.value)} value={message} />
                            <button className='btn btn-secondary mx-1'>Enviar</button>
                        </div>
                    </form>
                </div>
            </div>


            <div className='card mt-3 card-container' id="card-chat">
                <div className='card-body'>
                    <div id="list-messages" ref={divRef}>

                        {

                            savedMessages.map((message, i) => {
                                return (

                                    message.room === chatRoom && (

                                        <div className='card mt-3 card-message-saved mx-1' key={i}>
                                            <div className='card-body'>
                                                <span className='text-muted'>{message.user}: {message.body}</span>
                                            </div>
                                        </div>

                                    )
                                )
                            })

                        }


                        {

                            messages.map((message, i) => {
                                return (

                                    message.room === chatRoom && (

                                        message.from === name ? (
                                            <div className='d-flex justify-content-end'>
                                                <div className='card mt-3 card-message mx-1' key={i}>
                                                    <div className='card-body card-body-message-user'>
                                                        {message.body}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className='card mt-3 card-message-other mx-1' key={i}>
                                                <div className='card-body'>
                                                    {message.from}: {message.body}
                                                </div>
                                            </div>
                                        )
                                    )
                                )
                            })

                        }
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ChatRoom;