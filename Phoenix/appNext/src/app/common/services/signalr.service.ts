import { Injectable } from '@angular/core';
import { EventService } from './event.service';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
declare var $;

@Injectable()
export class SignalrService {
  eventHubName = 'PhoenixEventHub';
  rawApiEndPoint = environment.apiUrl + 'signalr';
  publicChannelName = 'public';

  connection;
  proxy;
  isConnecting = false;
  forceDisconnect = false;

  eventMap = {};
  ownerDictionary = {};
  connectedGroups: { [groupName: string]: Subscription[] } = {};
  eventQueue = [];

  constructor(private eventSvc: EventService) {
    this.connection = $.hubConnection(this.rawApiEndPoint, { logging: true, useDefaultPath: false });
    this.proxy = this.connection.createHubProxy(this.eventHubName, { logging: true });

    this.connection.disconnected(() => {
      if (!this.forceDisconnect) {
        this.connection.log('Connection closed. Retrying...');
        setTimeout(() => {
          this.connect();
        }, 5000);
      }
    });

    this.registerEvent('privateEvent', (...args) => {
      this.eventSvc.trigger('event:phoenix-private-event', args);
    });

    this.registerEvent('publicEvent', (...args) => {
      this.eventSvc.trigger('event:phoenix-public-event', args);
    });

    this.registerEvent('entityEvent', (entityId, entityType, command) => {
      this.eventSvc.trigger('event:phoenix-entity-event', {
        entityId: entityId,
        entityType: entityType,
        command: command
      });
    });
  }

  onDisconnect(fn) {
    this.registerDisconnect(fn);
  }

  connectionPromise: Promise<any>;

  connect(): Promise<any> {
    if (!this.isConnected() && !this.isConnecting) {
      this.connectionPromise = new Promise((resolve, reject) => {
        this.forceDisconnect = false;
        this.isConnecting = true;
        this.connection
          .start()
          .done(e => {
            this.isConnecting = false;
            this.proxy.invoke('Subscribe', this.publicChannelName);
            Object.keys(this.connectedGroups).forEach(group => {
              if (this.connectedGroups[group] != null && this.connectedGroups[group].some(sub => !sub.closed)) {
                this.proxy.invoke('Subscribe', group);
              }
            });
            resolve(e);

            this.eventQueue.forEach((val, idx, arr) => {
              // val = {eventName:x, callback: x, registerFn: z}
              if (val && val.registerFn && typeof val.registerFn === 'function') {
                // registerPrivate or registerPublic
                val.registerFn(val.eventName, val.callback);
              }
            });
            this.eventQueue = [];
            this.setServerUnavailable(false);
          })
          .fail(e => {
            this.isConnecting = false;
            console.log('error connecting to websocket', e);
            reject(e);
            if (e && e.context && e.context.status === 0) {
              // this.serverUnavailable();    /* uncomment if we want to passively show the server unavailable page */
            }
          });
      });
    }
    return this.connectionPromise;
  }

  disconnect(): void {
    if (this.isConnected()) {
      this.forceDisconnect = true;
      Object.keys(this.connectedGroups).forEach(group => {
        this.proxy.invoke('Unsubscribe', group);
      });
      this.connection.stop();
    }
  }

  isConnected(): boolean {
    // console.log('connection status: ' + $.signalR.connectionState.connected);
    return this.proxy.connection.state === $.signalR.connectionState.connected;
  }

  addToOwnerDictionary(guidString: string): void {
    this.ownerDictionary[guidString] = true;
  }

  leave(room): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        this.connect().then(
          e => {
            this.proxy.invoke('Unsubscribe', room);
            resolve(e);
          },
          e => {
            reject(e);
          }
        );
      } else {
        this.proxy.invoke('Unsubscribe', room);
        resolve('unsubscribed');
      }
    });
  }

  // Join a specific room on the signalr hub to receive any messages sent to that room
  join(room): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        this.connect()
          .then(e => {
            return this.proxy.invoke('Subscribe', room);
          })
          .then(
            e => {
              resolve('subscribed');
            },
            e => {
              reject(e);
            }
          );
      } else {
        this.proxy.invoke('Subscribe', room).then(rsp => {
          resolve('subscribed');
        });
      }
    });
  }

  registerPrivate(e, callback) {
    const sub = this.eventSvc.subscribe('event:phoenix-private-event', data => {
      if (data && data[0] === e) {
        data[1].unregister = sub.unsubscribe;
        if (data[1].CommandId) {
          data[1].IsOwner = this.ownerDictionary[data[1].CommandId] || false;
        }
        callback.apply(callback, data);
      }
    });
    return sub;
  }

  onPrivate(eventName, callback, queueIfDisconnected?: boolean) {
    let unregister = {};

    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        if (queueIfDisconnected) {
          this.eventQueue.push({ eventName: eventName, callback: callback, registerFn: (e, c) => this.registerPrivate(e, c) });
          resolve(unregister);
        } else {
          this.connect().then(
            e => {
              unregister = this.registerPrivate(eventName, callback);
              resolve(unregister);
            },
            err => {
              // TODO: do something when failed
              console.error(`signalr.service onPrivate error calling ${eventName}`, err);
              this.eventQueue.push({ eventName: eventName, callback: callback, registerFn: (e, c) => this.registerPrivate(e, c) });
              reject(err);
            }
          );
        }
      } else {
        setTimeout(() => {
          unregister = this.registerPrivate(eventName, callback);
          resolve(unregister);
        });
      }
    });
  }

  registerPublic(e, callback, takeUntill?: Observable<any>) {
    const sub = this.eventSvc.subscribe('event:phoenix-public-event', data => {
      if (data && data[0] === e) {
        data[1].unregister = sub.unsubscribe;
        if (data[1].CommandId) {
          data[1].IsOwner = this.ownerDictionary[data[1].CommandId] || false;
        }
        callback.apply(callback, data);
      }
    }, takeUntill);
    return sub;
  }

  async onPublic(eventName, callback, queueIfDisconnected?: boolean, takeUntill?: Observable<any>) {
    let unregister = {};

      if (!this.isConnected()) {
        if (queueIfDisconnected) {
          this.eventQueue.push({ eventName: eventName, callback: callback, registerFn: (e, c) => this.registerPublic(e, c) });
          return Promise.resolve(unregister);
        } else {
          this.connect().then(
            e => {
              unregister = this.registerPublic(eventName, callback, takeUntill);
              return Promise.resolve(unregister);
            },
            err => {
              // TODO: do something when failed
              console.error(`signalr.service onPublic error calling ${eventName}`, err);
              this.eventQueue.push({ eventName: eventName, callback: callback, registerFn: (e, c) => this.registerPublic(e, c, takeUntill) });
              return Promise.reject(err);
            }
          );
        }
      } else {
        setTimeout(() => {
          unregister = this.registerPublic(eventName, callback, takeUntill);
          return Promise.resolve(unregister);
        });
      }
  }

  entitySubscribe(entityType, entityId, callback: (command: any) => void) {
    const groupName = entityId + '-' + entityType;
    if (!this.connectedGroups[groupName]) {
      this.connectedGroups[groupName] = [];
    }
    const subscription = this.eventSvc.subscribe('event:phoenix-entity-event', (payload: { entityId: number; entityType: number; command: any }) => {
      if (entityId === payload.entityId && entityType === payload.entityType) {
        payload.command.unregister = subscription.unsubscribe;
        payload.command.IsOwner = (payload.command.CommandId && this.ownerDictionary[payload.command.CommandId]) || false;
        callback(payload.command);
      }
    });
    this.connectedGroups[groupName].push(subscription);
    if (this.isConnected()) {
      this.proxy.invoke('Subscribe', groupName);
    }
    return subscription;
  }

  entityUnsubscribe(entityType, entityId) {
    const groupName = entityId + '-' + entityType;
    if (this.connectedGroups[groupName]) {
      // unsubscribe from all events
      this.connectedGroups[groupName].forEach(value => value.closed || value.unsubscribe());
      delete this.connectedGroups[groupName];
    }
    if (this.isConnected()) {
      this.proxy.invoke('Unsubscribe', groupName);
    }
  }

  serverUnavailable() {
    this.setServerUnavailable(true);
    // $rootScope.$state.go('unavailable', null, { location: false });
  }

  getServerUnavailablefunction() {
    return this.serverUnavailable; // window.serverUnailable
  }

  setServerUnavailable(unavailable) {
    this.serverUnavailable = unavailable; // window.serverUnailable
  }

  private registerEvent(eventType, callback) {
    if (this.eventMap[eventType]) {
      // proxy.off(eventName, callback) Removes the callback invocation request from the server hub for the given event name.
      this.proxy.off(eventType, this.eventMap[eventType]);
    }

    this.eventMap[eventType] = (...args) => {
      setTimeout(() => {
        if (callback) {
          callback.apply(callback, args);
        }
      }, 0);
    };

    this.proxy.on(eventType, this.eventMap[eventType]);
  }

  private registerDisconnect(fn, interval?: any) {
    this.connection.disconnected(() => {
      if (typeof fn === 'function') {
        setTimeout(fn, interval);
      }
    });
  }
}
