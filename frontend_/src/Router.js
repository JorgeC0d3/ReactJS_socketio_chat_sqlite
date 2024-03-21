import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ChatRooms from './components/ChatRooms';
import ChatRoom from './components/ChatRoom';

const Router = () => {

    return (

        <BrowserRouter>  
            <Routes>
                <Route exact path="/" element={<ChatRooms />} />
                <Route exact path="/chatroom/:chatRoom" element={<ChatRoom />} />
            </Routes>
        </BrowserRouter>

    )
}

export default Router