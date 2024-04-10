import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const nodeBackendPort = 3001;
const pyBackendPort = 5000;
const nodeServer = "http://127.0.0.1:" + nodeBackendPort + "/";
const pyServer = "http://127.0.0.1:" + pyBackendPort + "/";

function Header({ isDarkMode, toggleDarkMode, activeChatName }) {
  return (
    <div className="header">
      <h2>ChatGPT</h2>
      <h3>{activeChatName}</h3>
      <div className="mode-toggle">
        <label>
          <input type="checkbox" checked={isDarkMode} onChange={toggleDarkMode} />
          <span className="slider round"></span>
        </label>
      </div>
    </div>
  );
}

function Chat({ messages, activeChat, setActiveChatMessages}) {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const sendMessage = async (content, author="You") => {
    try {
      const newMessage = { content: content, author: author };
      const response = await axios.post(nodeServer + `sendMessage/${activeChat}`, newMessage);
      setActiveChatMessages(prevMessages => [...prevMessages, newMessage]);
      setMessage('');
      return response.data;
    } catch (error) {
      console.error('Error sending message: ', error);
      throw error;
    }
  };

  const generateResponse = async (content) => {
    try {
      const response = await axios.post(pyServer + 'generate', { text: content });
      sendMessage(response.data.response, "Chat Bot");
    } catch (error) {
      console.error('Error generating response: ', error);
    }
  };
  
  const handleReply = (replyMessage) => {
    setMessage(`@${replyMessage.author}: ${replyMessage.content}`);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('Message copied to clipboard: ', text);
      })
      .catch((err) => {
        console.error('Failed to copy message to clipboard: ', err);
      });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && message.trim() !== '') {
      Promise.all([sendMessage(message), generateResponse(message)])
        .then(([sendMessageResponse, otherFunctionResponse]) => {
          // Handle responses if needed
        })
        .catch(error => {
          console.error('Error sending message or calling other function: ', error);
        });
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {response && <div className="response">{response}</div>}
        {messages.map((message, index) => (
          <div key={message.id} className="message">
          <div className="message-author">
            <div className="name">{message.author}</div>
              <div className="links">
                <a href="#" className="copy-button" onClick={(e) => { e.preventDefault(); copyToClipboard(message.content);}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 4C16.93 4 17.395 4 17.7765 4.10222C18.8117 4.37962 19.6204 5.18827 19.8978 6.22354C20 6.60504 20 7.07003 20 8V17.2C20 18.8802 20 19.7202 19.673 20.362C19.3854 20.9265 18.9265 21.3854 18.362 21.673C17.7202 22 16.8802 22 15.2 22H8.8C7.11984 22 6.27976 22 5.63803 21.673C5.07354 21.3854 4.6146 20.9265 4.32698 20.362C4 19.7202 4 18.8802 4 17.2V8C4 7.07003 4 6.60504 4.10222 6.22354C4.37962 5.18827 5.18827 4.37962 6.22354 4.10222C6.60504 4 7.07003 4 8 4M9.6 6H14.4C14.9601 6 15.2401 6 15.454 5.89101C15.6422 5.79513 15.7951 5.64215 15.891 5.45399C16 5.24008 16 4.96005 16 4.4V3.6C16 3.03995 16 2.75992 15.891 2.54601C15.7951 2.35785 15.6422 2.20487 15.454 2.10899C15.2401 2 14.9601 2 14.4 2H9.6C9.03995 2 8.75992 2 8.54601 2.10899C8.35785 2.20487 8.20487 2.35785 8.10899 2.54601C8 2.75992 8 3.03995 8 3.6V4.4C8 4.96005 8 5.24008 8.10899 5.45399C8.20487 5.64215 8.35785 5.79513 8.54601 5.89101C8.75992 6 9.03995 6 9.6 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <a href="#" className="copy-button" onClick={(e) => {e.preventDefault(); handleReply(message)}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
            <div className="message-content">{message.content}</div>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        className="message-input"
      />
      <button onClick={() => {
          Promise.all([sendMessage(message), generateResponse(message)])
            .then(([sendMessageResponse, otherFunctionResponse]) => {
              // Handle responses if needed
            })
            .catch(error => {
              console.error('Error sending message or calling other function: ', error);
            });
        }} className="send-button">Send</button>
    </div>
  );
}

function ChatList({ chats, setActiveChat, handleCreateChat }) {
  const [menuOpen, setMenuOpen] = useState(null); // Track which menu is open

  const handleClick = (chatId) => {
    setActiveChat(chatId);
  };

  const handleMenuToggle = (chatId) => {
    setMenuOpen(menuOpen === chatId ? null : chatId);
  };

  const handleRename = async (chatId) => {
    const newName = prompt('Enter new name:');
    if (newName) {
      try {
        await axios.put(nodeServer + `chats/${chatId}`, { newName });
        alert('Chat name updated successfully');
      } catch (error) {
        console.error('Error updating chat name: ', error);
        alert('Failed to update chat name');
      }
    }
  };

  const handleDelete = async (chatId) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await axios.delete(nodeServer + `chats/${chatId}`);
        alert('Chat deleted successfully');
      } catch (error) {
        console.error('Error deleting chat: ', error);
        alert('Failed to delete chat');
      }
    }
  };

  return (
    <div className="sidebar">
      <div className="create-chat">
        <button onClick={handleCreateChat}>Create New Chat</button>
      </div>
      <h2>Chats</h2>
      <ul>
        {chats.map((chat) => (
          <li key={chat.id} onClick={() => handleClick(chat.id)} className="chat-item">
            <div className="chat-info">
              <span style={{ width: '80%' }}>{chat.name}</span>
              <a href="#" className="menu-toggle" onClick={(e) => {e.preventDefault(); handleMenuToggle(chat.id);}}>
                <svg class="icon icon-tabler icon-tabler-dots-vertical" fill="none" height="24" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none" stroke="none"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/><circle cx="12" cy="5" r="1"/></svg>
              </a>
              {menuOpen === chat.id && (
                <ul className="menu">
                  <li onClick={() => handleRename(chat.id)}>Rename</li>
                  <li onClick={() => handleDelete(chat.id)}>Delete</li>
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const [activeChat, setActiveChat] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false); 


  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
  };

  const [activeChatMessages, setActiveChatMessages] = useState([]);

  useEffect(() => {
    const fetchActiveChatMessages = async () => {
      try {
        const response = await axios.get(nodeServer + `chats/${activeChat}/messages`);
        setActiveChatMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages: ', error);
      }
    };

    fetchActiveChatMessages();
  }, [activeChat]);

  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(nodeServer + 'chats');
        // Update the state using a callback function
        setChats(prevChats => response.data);
      } catch (error) {
        console.error('Error fetching chats: ', error);
      }
    };
  
    fetchChats();
  }, []);  

  async function handleCreateChat() {
    const chatName = prompt('Enter chat name:');
    if (chatName) {
      try {
        const response = await axios.post(nodeServer + 'createChat', { name: chatName });
        const { chatId } = response.data;
        setChats([...chats, { id: chatId, name: chatName, messages: [] }]);
        setActiveChat(chatId);
      } catch (error) {
        console.error('Error creating chat room: ', error);
      }
    }
  }

  const getActiveChatName = () => {
    const activeChatObj = chats.find(chat => chat.id === activeChat);
    return activeChatObj ? activeChatObj.name : '';
  };

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} activeChatName={getActiveChatName()} />
      <ChatList chats={chats} setActiveChat={setActiveChat} handleCreateChat={handleCreateChat} />
      <div className="content">
        {activeChat && (
          <Chat messages={activeChatMessages} activeChat={activeChat} setActiveChatMessages={setActiveChatMessages} />
        )}
      </div>
    </div>
  );
}

export default App;
