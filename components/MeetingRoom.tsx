/* eslint-disable tailwindcss/no-custom-classname */
'use client';

import React, { useState, useRef } from 'react';
import './App.css';

import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, LayoutList, MessageSquare } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import { cn } from '@/lib/utils';

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  orderBy,
  query,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

type Message = {
  text: string;
  uid: string;
  photoURL: string | null;
};

function ChatRoom() {
  const dummy = useRef<HTMLDivElement>(null);
  const messagesRef = collection(firestore, 'messages');
  const messagesQuery = query(messagesRef, orderBy('createdAt'));

  const [messages] = useCollectionData(messagesQuery, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  // If the user is not signed in, show a login message
  if (!auth.currentUser) {
    return <p>Please sign in to view and send messages.</p>;
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser) return;

    const { uid, photoURL, displayName } = auth.currentUser;

    await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
      displayName, // Add the display name
    });

    setFormValue('');
    // dummy.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div className='main-div overflow-auto'>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </div>

      <form onSubmit={sendMessage}>
        <input className='send-input'
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Type your message..."
        />
        <button className='send-btn' type="submit">Send</button>
      </form>
    </>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const { text, uid, photoURL, displayName } = message;

  const messageClass =
    auth.currentUser && uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass} flex items-start gap-3 p-2`}>
      <img className='chat-img'
        src={photoURL || 'https://api.adorable.io/avatars/23/default.png'}
        alt="User Avatar"
        
      />
      <div>
        <p className="text-sm font-semibold text-white">
          {displayName || 'Unknown User'}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
      </div>
    </div>
  );
}

function LoginButton() {
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return <button onClick={handleSignIn}>Sign in with Google</button>;
}

function LogoutButton() {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return <button onClick={handleSignOut}>Sign out</button>;
}

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [user] = useAuthState(auth);

  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      {!user ? (
        <div className="flex justify-center items-center h-full">
          <LoginButton />
        </div>
      ) : (
        <>
          <div className="relative flex size-full items-center justify-center">
            <div className="flex size-full max-w-[1000px] items-center">
              <CallLayout />
            </div>
            <div
              className={cn('h-[calc(100vh-86px)] hidden ml-2', {
                'show-block': showParticipants,
              })}
            >
              <CallParticipantsList
                onClose={() => setShowParticipants(false)}
              />
            </div>
            <div
              className={cn(
                'absolute right-0 top-0 h-full w-[300px] bg-[#19232d] p-4 text-white transition-transform',
                {
                  'translate-x-0': showChat,
                  'translate-x-full': !showChat,
                },
              )}
            >
              <div className="App">
                <header>
                  <h1>Chat Sign-Bridge</h1>
                </header>
                <ChatRoom />
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 flex w-full items-center justify-center gap-5">
            <CallControls onLeave={() => router.push(`/`)} />
            <DropdownMenu>
              <div className="flex items-center">
                <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
                  <LayoutList size={20} className="text-white" />
                </DropdownMenuTrigger>
              </div>
              <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
                {['Grid', 'Speaker-Left', 'Speaker-Right'].map(
                  (item, index) => (
                    <div key={index}>
                      <DropdownMenuItem
                        onClick={() =>
                          setLayout(item.toLowerCase() as CallLayoutType)
                        }
                      >
                        {item}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="border-dark-1" />
                    </div>
                  ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <CallStatsButton />
            <button onClick={() => setShowParticipants((prev) => !prev)}>
              <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
                <Users size={20} className="text-white" />
              </div>
            </button>
            <button onClick={() => setShowChat((prev) => !prev)}>
              <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
                <MessageSquare size={20} className="text-white" />
              </div>
            </button>
            {!isPersonalRoom && <EndCallButton />}
            <LogoutButton />
          </div>
        </>
      )}
    </section>
  );
};

export default MeetingRoom;
