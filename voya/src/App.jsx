import './App.css'
import { useState } from 'react';
import axios from 'axios';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    const userMessage = {
      role: 'user',
      content: input
    };
    setMessages([...messages, userMessage]);
    setInput('');

    try {
      const res = await axios.post('http://localhost:8000/chat', {
        message: input});
      const botMessage = {
        role: 'assistant',
        content: res.data.response
      };
      setMessages(prev => [...prev, botMessage]);
    }
    catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <>
      <div className="header">
        <h1>Voya</h1>
      </div>
      <div className="container">
        <div className="chat-container">
          <div className="messages">
            {messages.map((message, index) => (
              <div key={index} class={`${message.role}` === 'user' ? 'chat chat-sender' : 'chat chat-receiver'}>
                <div class='chat-bubble'>{message.content}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(e)}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </>
  )
}

export default App
