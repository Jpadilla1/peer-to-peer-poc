import { Machine, assign, AnyEventObject } from "xstate";
import Peer from 'peerjs';

export const networkMachine = Machine({
  id: "network",
  initial: "idle",
  context: {
    host: null,
    peer: null,
  },
  on: {
    closeConnection: "close",
  },
  states: {
    idle: {
      on: {
        host: "hosting",
        join: {
          target: "joining",
          cond: "hasHostId",
        },
      },
    },
    hosting: {
      invoke: {
        src: 'setupHost',
        onDone: {
          target: 'hosting_success',
          actions: 'saveHostInstance'
        },
        onError: 'error',
      }
    },
    hosting_success: {

    },
    joining: {
      invoke: {
        src: 'setupPeerAndJoin',
        onDone: {
          target: 'joining_success',
          actions: 'savePeerInstance'
        },
        onError: 'error',
      }
    },
    joining_success: {

    },
    error: {
      type: 'final'
    },
    close: {
      entry: "closeConnections",
      type: "final",
    },
  },
}, {
  guards: {
    hasHostId: (_, { hostId }: AnyEventObject) => hostId !== null && hostId !== undefined,
  },
  actions: {
    savePeerInstance: assign((_, { data }: AnyEventObject) => ({ peer: data.instance, connection: data.connection })),
    saveHostInstance: assign((_, { data }: AnyEventObject) => ({ host: data.instance }))
  },
  services: {
    setupHost: () => new Promise((resolve, reject) => {
      const peer = new Peer('', {
        host: 'e08c9bbb.ngrok.io',
        path: '/myapp'
      });

      peer.on('open', () => {
        resolve({ instance: peer });
      });

      peer.on('error', () => {
        reject();
      })
    }),
    setupPeerAndJoin: (_, { hostId }) => new Promise((resolve, reject) => {
      const peer = new Peer('', {
        host: 'e08c9bbb.ngrok.io',
        path: '/myapp'
      });

      peer.on('open', () => {
        const c = peer.connect(hostId, {
          reliable: true
        });

        console.log('hi');

        c.on('error', (e) => {
          console.error(e);
        })

        c.on('open', () => {
          console.log('open');
          resolve({ instance: peer, connection: c });
      });

      peer.on('error', () => {
        reject();
      })
    })}),
  }
});
