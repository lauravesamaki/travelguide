import './App.css'
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);

  const sendMessage = async () => {
    const userMessage = {
      role: 'user',
      content: input
    };

    const newHistory = [...history, userMessage];

    setMessages([...messages, userMessage]);
    setInput('');

    try {
      const res = await axios.post('http://localhost:8000/chat', {
        message: input,
        history: newHistory
      });
      const botMessage = {
        role: 'assistant',
        content: res.data.response
      };
      
      setMessages(prev => [...prev, botMessage]);
      setHistory([...newHistory, botMessage]);
    }
    catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // when app loads, it should trigger a chat with the bot
  const loadChat = async () => {
      try {
      const usrMsg = {
        role: 'user',
        content: 'Hello!'
      }
      const initialHistory = [...history, usrMsg];
      
      const res = await axios.post('http://localhost:8000/chat', {
        message: usrMsg.content,
        history: initialHistory
      });
      const botMessage = {
        role: 'assistant',
        content: res.data.response
      };
      setMessages(prev => [...prev, botMessage]);
      setHistory([...initialHistory, botMessage]);
    }
    catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  // Load chat when the component mounts
  const initialLoad = useRef(true);
  useEffect(() => {
    if (initialLoad.current) {
      loadChat();
      initialLoad.current = false;
    }
    // Scroll to the bottom of the chat container
    const chatContainer = document.querySelector('.messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);


  // Scroll to the bottom of the chat container when messages change
  useEffect(() => {
    const chatContainer = document.querySelector('.messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  // Check if input is empty or contains only spaces
  useEffect(() => {
    if (input.trim() === '') {
      document.querySelector('button').disabled = true;
    } else {
      document.querySelector('button').disabled = false;
    }
  }, [input]);

  return (
    <>
      <div className="header">
        <h1>Voya</h1>
      </div>
      <div className="container">
        <div class="chat" className="messages">
          {messages.map((message, index) => (
            <div key={index} class={`${message.role}` === 'user' ? 'chat chat-sender max-w-4/5 w-fit justify-self-end' : 'chat chat-receiver max-w-4/5 w-fit'}>
              <div class="chat-header text-base-content">{message.role === 'user' ? 'You' : 'Voya'}</div>
              <div class={message.role === 'user' ? 'chat-bubble' : 'chat-bubble !bg-secondary'}>{message.content}</div>
            </div>
          ))}
          {messages.length > 0 && messages[messages.length - 1].role === 'user' && (
            <div class="chat chat-receiver">
              <div class="chat-header text-base-content">Voya</div>
              <div class="chat-bubble">
                <span class="loading loading-dots loading-xs"></span>
              </div>
            </div>
          ) || messages.length === 0 && (
            <div class="chat chat-receiver">
              <div class="chat-header text-base-content">Voya</div>
              <div class="chat-bubble">
                <span class="loading loading-dots loading-xs"></span>
              </div>
            </div>
          )}
        </div>
        <div class="input-container mt-6">
          <input
            class="input input-bordered w-full"
            placeholder="Type your message here..."
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(e)}
          />
          <button onClick={sendMessage} class="btn">Send</button>
        </div>
      </div>
    </>
  )
}

export default App
