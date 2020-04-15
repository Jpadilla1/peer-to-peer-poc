import React, { useRef, useEffect, useState } from 'react';
import get from 'lodash/get';
import { useMachine } from '@xstate/react';
import logo from './logo.svg';
import './App.css';

import { networkMachine } from './network/machine';

function App() {
  const [current, send] = useMachine(networkMachine);

  console.log('Current: ', current.value);
  console.log('Context: ', current.context);

  const peerRef = React.useRef<any>();

  const connectFormSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();

    send('join', { hostId: peerRef?.current?.value });
  }

  const connectionsRef = useRef<any[]>([]);

  const onDataListenerRef = useRef<any>();
  const onHostConnectionListenerRef = useRef<any>();

  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    if (current.matches('hosting_success') && !onHostConnectionListenerRef.current) {
      const host = get(current, 'context.host', null);

      if (host) {
        onHostConnectionListenerRef.current = true
        host.on('connection', (c: any) => {
          // Will print 'hi!'
          setMessages((msgs) => [...msgs, 'Connected!']);
          connectionsRef.current = [...connectionsRef.current, c];
          connectionsRef.current[0].on('open', () => {
            c.send('Welcome!');
          });

          connectionsRef.current[0].on('data', (data: any) => {
            // Will print 'hi!'
            setMessages((msgs) => [...msgs, data]);
          });
        });
      }
    }

    if (current.matches('joining_success') && !onDataListenerRef.current) {
      const conn = get(current, 'context.connection', null)

      console.log(conn);
      if (conn) {
        onDataListenerRef.current = true
        // console.log(conn);
        conn.on('data', (data: any) => {
          // Will print 'hi!'
          setMessages((msgs) => [...msgs, data]);
        });
      }
    }
  })

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>

        <button onClick={() => send('host')}>Host a Game</button>

        <form onSubmit={connectFormSubmit}>
          <input placeholder="peer id" ref={peerRef} />
          <button type="submit">Connect</button>
        </form>

        {current.matches('hosting_success') ? (
          <>
            <h4>Host Id: {get(current, 'context.host.id')}</h4>
          </>
        ): null}

        {current.matches('hosting_success') ? (
          <>
            <h4>Connections: {Object.keys(get(current, 'context.host.connections', {})).length}</h4>
          </>
        ): null}


        <button onClick={() => {
          if (current.matches('joining_success')) {
            const conn = get(current, 'context.connection', null)
            conn.send('hi from peer');
          } else if (current.matches('hosting_success')) {
            const conn = connectionsRef.current[0];
            conn.send('hi from host');
          }

        }}>send Message</button>

        <h4>Messages</h4>
        <ul>
          {messages.map((m, idx) => <li key={idx}>{m}</li>)}
        </ul>
      </header>
    </div>
  );
}

export default App;
