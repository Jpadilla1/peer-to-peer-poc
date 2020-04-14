import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

import Peer from 'peerjs';

function App() {
  const [instance, setInstance] = useState(null);
  const [conn, setConn] = useState(null);
  const [peerId, setPeerId] = useState(null);
  const [opponentId, setOpponentId] = useState(null);
  const [messages, setMessages] = useState([]);

  const initialize = () => {
    const peer = new Peer();

    setInstance(peer);

    peer.on('open', id => {
      setPeerId(id);
    });

    peer.on('error', function(err) {
			alert(''+err)
    });

    return peer;
  };

  const handleStart = () => {
    const instance = initialize();

		instance.on('connection', function(c) {
			if(conn) {
				c.close()
				return
			}
			setConn(c)
		});
  }

  const handleConnect = (destId) => {
    const instance = initialize();

    instance.on('open', () => {
			const c = instance.connect(destId, {
				reliable: true
      });

			c.on('open', function() {
				setOpponentId(destId);
      })

      setConn(c);
		})
  }

  const peerRef = React.useRef();

  const connectFormSubmit = (evt) => {
    evt.preventDefault();

    handleConnect(peerRef.current.value);
  }

  useEffect(() => {
    if (conn) {
      conn.on('data', (data) => {
        // Will print 'hi!'
        setMessages((msgs) => [...msgs, data]);
      });
    }
  }, [conn])

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

        <button onClick={handleStart}>Start</button>

        <form onSubmit={connectFormSubmit}>
          <input placeholder="peer id" ref={peerRef} />
          <button type="submit">Connect</button>
        </form>

        <h4>Peer Id: {peerId}</h4>
        <h4>Opponent Id: {opponentId}</h4>


        <button onClick={() => {
          conn.send('hi');
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
