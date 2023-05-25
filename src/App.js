import React from 'react';
import './App.css';


import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import config from './config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useState } from 'react';

const apiKey = config.API_KEY;
const projectId = config.PROJECT_ID;
const appId = config.APP_ID;
const messagingSenderId = config.MES_SEND_ID;
const authDomain = config.AUTH_DOMAIN;
const storageBucket = config.STORAGE_BUCKET;

firebase.initializeApp({
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
  measurementId: "G-7R8FLW3B5J"
});

console.log(config.API_KEY)
const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

function ChatRoom() {
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });
 
  const [formValue, setFormValue] = useState('');

  const sendMessage =async(e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');
  }

  return (
    <>
    <div>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
    </div>

    <form onSubmit={sendMessage}>
    <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
    <button type="submit"  disabled={!formValue}>send</button>
    </form>

    </>
  );
}

function ChatMessage(props) {
  const { text, uid , photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
    
  )

}

export default App;