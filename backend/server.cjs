// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp, getDocs, orderBy, query } = require('firebase/firestore');

// Initialize Firebase app with your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQdGAuE6MYzYrSFyx3Dw4_zlgkQhh2Wjg",
  authDomain: "chatgpt-c4125.firebaseapp.com",
  projectId: "chatgpt-c4125",
  storageBucket: "chatgpt-c4125.appspot.com",
  messagingSenderId: "770316491976",
  appId: "1:770316491976:web:c77305ca7519a4ed7119fd",
  measurementId: "G-WLEHNZ2CLY"
};

const appFirebase = initializeApp(firebaseConfig); // Rename the variable to avoid redeclaration
const firestore = getFirestore(appFirebase); // Use the initialized app

// Initialize Express app
const appExpress = express(); // Rename the variable to avoid redeclaration
const port = 3001;

// Middleware
appExpress.use(bodyParser.json());
appExpress.use(cors());

// Define routes

// Route to create a new chat room
appExpress.post('/createChat', async (req, res) => {
  try {
    const { name } = req.body;
    const chatRef = await addDoc(collection(firestore, 'chats'), {
      name: name,
      created_at: serverTimestamp()
    });
    res.status(201).json({ message: 'Chat room created successfully', chatId: chatRef.id });
  } catch (error) {
    console.error('Error creating chat room: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to send a message in a chat room
appExpress.post('/sendMessage/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, author } = req.body;
    const messageRef = await addDoc(collection(firestore, `chats/${chatId}/messages`), {
      content: content,
      author: author,
      timestamp: serverTimestamp()
    });
    res.status(201).json({ message: 'Message sent successfully', messageId: messageRef.id });
  } catch (error) {
    console.error('Error sending message: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

appExpress.get('/chats', async (req, res) => {
  try {
    const chats = [];
    const querySnapshot = await getDocs(collection(firestore, 'chats'), orderBy('created_at', 'asc'));
    querySnapshot.forEach(doc => {
      chats.push({ id: doc.id, name: doc.data().name });
    });
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chat rooms: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

appExpress.get('/chats/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;

    const subCollectionRef = collection(firestore, 'chats', chatId, 'messages');
    const querySnapshot = await getDocs(query(subCollectionRef, orderBy('timestamp', 'asc')));
    const messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

appExpress.put('/chats/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { newName } = req.body;

    // Rename Chat

    res.status(200).json({ message: 'Chat name updated successfully' });
  } catch (error) {
    console.error('Error updating chat name: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete chat
appExpress.delete('/chats/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;

    // Delete chat from Firestore

    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
appExpress.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
