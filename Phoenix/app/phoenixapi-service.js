/***********************************************
* Phoenix API AngularJS Client Library
* Author: Jeffrey Ko
***********************************************/
(function (window, $) {
    'use strict';
    var UIActionExecutionLogs = [];

    var docCookies = {
        getItem: function (sKey) {
            if (!sKey) { return null; }
            return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
        },
        setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
            if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
            var sExpires = "";
            if (vEnd) {
                switch (vEnd.constructor) {
                    case Number:
                        sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                        break;
                    case String:
                        sExpires = "; expires=" + vEnd;
                        break;
                    case Date:
                        sExpires = "; expires=" + vEnd.toUTCString();
                        break;
                }
            }
            document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
            return true;
        },
        removeItem: function (sKey, sPath, sDomain) {
            if (!this.hasItem(sKey)) { return false; }
            document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
            return true;
        },
        hasItem: function (sKey) {
            if (!sKey) { return false; }
            return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
        },
        keys: function () {
            var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
            for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
            return aKeys;
        }
    };

    //var phoenixapiApp = angular.module('phoenixapi.service', ['ngCookies', 'dialogs.main']);
    var phoenixapiApp = angular.module('phoenixapi.service', ['ngCookies', 'common']);

    phoenixapiApp.value('apiConfig', {
        apiEndPoint: api2Url + 'api', //'/home/proxy/api',
        eventHubName: 'PhoenixEventHub',
        rawApiEndPoint: api2Url.replace(/\/$/, ''),
        publicChannelName: 'public',
        phoenixCookieStore: 'phoenixCookie',
        actionLogEnabled:true,
        nMaxActionLogsPerSend:30
    });

    phoenixapiApp
        .factory('phoenixsocket', ['$rootScope', '$q', '$timeout', 'apiConfig',
            function ($rootScope, $q, $timeout, apiConfig) {

                var connection = $.hubConnection(apiConfig.rawApiEndPoint);
                var proxy = connection.createHubProxy(apiConfig.eventHubName);
                var isConnecting = false;
                var forceDisconnect = false;
                var connectionPromise = $q.defer();
                var eventMap = {};
                var ownerDictionary = {};
                var eventQueue = [];
                var connectedGroups = {};

                function registerEvent(eventType, callback) {
                    if (eventMap[eventType])
                        proxy.off(eventType, eventMap[eventType]);

                    eventMap[eventType] = function () {
                        var args = arguments;

                        $timeout(function () {
                            if (callback) {
                                callback.apply(callback, args);
                            }
                        }, 0);
                    };

                    proxy.on(eventType, eventMap[eventType]);
                }

                function registerDisconnect(fn, interval) {
                    connection.disconnected(function () {
                        if (typeof fn == 'function') {
                            $timeout(fn, interval);
                        }
                    });
                }
                connection.disconnected(function () {
                    Object.keys(connectedGroups).forEach(function(group) {
                        proxy.invoke('Unsubscribe', group);
                    });
                    
                    if (!forceDisconnect) {
                        connection.log('Connection closed. Retrying...');
                        $timeout(function () { result.connect(); }, 5000);
                    }
                });

                var result = {
                    onDisconnect: function (fn) {
                        registerDisconnect(fn);
                    },
                    connect: function () {
                        var self = this;
                        if (!this.isConnected() && !isConnecting) {
                            connectionPromise = $q.defer();
                            forceDisconnect = false;
                            isConnecting = true;

                            registerEvent('privateEvent', function () {
                                $rootScope.$emit('event:phoenix-private-event', arguments);
                            });

                            registerEvent('publicEvent', function () {
                                $rootScope.$emit('event:phoenix-public-event', arguments);
                            });

                            registerEvent('entityEvent', function (entityId, entityType, command) {
                                $rootScope.$emit('event:phoenix-entity-event', {
                                    entityId: entityId,
                                    entityType: entityType,
                                    command: command
                                });
                                // console.log('entity driven!', arguments);
                            });

                            connection
                                .start()
                                .done(function (e) {
                                    isConnecting = false;
                                    proxy.invoke('Subscribe', apiConfig.publicChannelName);
                                    Object.keys(connectedGroups).forEach(function(group) {
                                        proxy.invoke('Subscribe', group);
                                    });
                                    connectionPromise.resolve(e);

                                    eventQueue.forEach(function (val, idx, arr) {
                                        if (val && val.registerFn && typeof val.registerFn === 'function') {
                                            val.registerFn(val.eventName, val.callback);
                                        }
                                    });
                                    eventQueue = [];
                                    self.setServerUnavailable(false);
                                })
                                .fail(function (e) {
                                    isConnecting = false;
                                    console.log('error connecting to websocket', e);
                                    connectionPromise.reject(e);
                                    if (e && e.context && e.context.status === 0) {
                                        // self.serverUnavailable();    /* uncomment if we want to passively show the server unavailable page */
                                    }
                                });
                        }

                        return connectionPromise.promise;
                    },
                    disconnect: function () {
                        if (this.isConnected()) {
                            forceDisconnect = true;
                            connection.stop();
                        }
                    },
                    isConnected: function () {
                        //console.log('connection status: ' + $.signalR.connectionState.connected);
                        return (proxy.connection.state == $.signalR.connectionState.connected);
                    },
                    join: function (room) {
                        var deferred = $q.defer();

                        if (!this.isConnected()) {
                            this.connect()
                                .then(function (e) {
                                    return proxy.invoke('Subscribe', room);
                                })
                                .then(function (e) {
                                    deferred.resolve('subscribed');
                                }, function (e) {
                                    deferred.reject(e);
                                });
                        }
                        else {
                            proxy.invoke('Subscribe', room)
                                .then(function (rsp) {
                                    deferred.resolve('subscribed');
                                });
                        }

                        return deferred.promise;
                    },
                    addToOwnerDictionary: function (guidString) {
                        ownerDictionary[guidString] = true;
                    },
                    leave: function (room) {
                        var deferred = $q.defer();

                        if (!this.isConnected()) {
                            this.connect()
                                .then(function (e) {
                                    proxy.invoke('Unsubscribe', room);
                                    deferred.resolve(e);
                                }, function (e) {
                                    deferred.reject(e);
                                });
                        }
                        else {
                            proxy.invoke('Unsubscribe', room);
                            deferred.resolve('unsubscribed');
                        }

                        return deferred.promise;
                    },
                    onPrivate: function (eventName, callback, queueIfDisconnected) {

                        var deferred = $q.defer();

                        var unregister = function () { };

                        function register(e, c) {
                            unregister = $rootScope.$on('event:phoenix-private-event', function (event, data) {
                                if (data && data[0] == e) {
                                    data[1].unregister = unregister;
                                    if (data[1].CommandId) {
                                        data[1].IsOwner = ownerDictionary[data[1].CommandId] || false;
                                    }
                                    callback.apply(callback, data);
                                }
                            });
                            return unregister;
                        }

                        if (!this.isConnected()) {
                            if (queueIfDisconnected) {
                                eventQueue.push({ eventName: eventName, callback: callback, registerFn: register });
                                deferred.resolve(unregister);
                            } else {
                                this.connect()
                                    .then(function (e) {
                                        unregister = register(eventName, callback);
                                        deferred.resolve(unregister);
                                    }, function (err) {
                                        // TODO: do something when failed
                                        eventQueue.push({ eventName: eventName, callback: callback, registerFn: register });
                                        deferred.reject(err);
                                    });
                            }

                        }
                        else {
                            $timeout(function () {
                                unregister = register(eventName, callback);
                                deferred.resolve(unregister);
                            });
                        }

                        return deferred.promise;
                    },
                    onPublic: function (eventName, callback, queueIfDisconnected) {

                        var deferred = $q.defer();

                        var unregister;

                        function register(e, c) {
                            unregister = $rootScope.$on('event:phoenix-public-event', function (event, data) {
                                if (data && data[0] == e) {
                                    data[1].unregister = unregister;
                                    if (data[1].CommandId) {
                                        data[1].IsOwner = ownerDictionary[data[1].CommandId] || false;
                                    }

                                    callback.apply(callback, data);
                                }
                            });
                            return unregister;
                        }

                        if (!this.isConnected()) {
                            if (queueIfDisconnected) {
                                eventQueue.push({ eventName: eventName, callback: callback, registerFn: register });
                                deferred.resolve(unregister);
                            } else {
                                this.connect()
                                    .then(function (e) {
                                        unregister = register(eventName, callback);
                                        deferred.resolve(unregister);
                                    }, function (err) {
                                        // TODO: do something when failed
                                        eventQueue.push({ eventName: eventName, callback: callback, registerFn: register });
                                        deferred.reject(err);
                                    });
                            }
                        }
                        else {
                            $timeout(function () {
                                unregister = register(eventName, callback);
                                deferred.resolve(unregister);
                            });

                        }
                        return deferred.promise;
                    },
                    entitySubscribe: function (entityType, entityId) {
                        var groupName = entityId + '-' + entityType;
                        if (!connectedGroups[groupName]) {
                            connectedGroups[groupName] = true;
                            if (this.isConnected()) {
                                proxy.invoke('Subscribe', groupName);
                            }
                        }
                    },
                    entityUnsubscribe: function (entityType, entityId) {
                        var groupName = entityId + '-' + entityType;
                        if (connectedGroups[groupName]) {
                            delete connectedGroups[groupName];
                        }
                        if (this.isConnected()){
                            proxy.invoke('Unsubscribe', groupName);
                        }
                    },

                    serverUnavailable: function () {
                        this.setServerUnavailable(true);
                        $rootScope.$state.go('unavailable', null, { location: false });
                    },
                    getServerUnavailable: function () {
                        return window.serverUnavailable;
                    },
                    setServerUnavailable: function (unavailable) {
                        window.serverUnavailable = unavailable;
                    }
                };

                return result;
            } // phoenixSignalr()
        ]);


    phoenixapiApp
        .factory('phoenixapi', ['$http', '$q', '$rootScope', '$cookies', 'phoenixsocket', 'apiConfig', 'common',
            function ($http, $q, $rootScope, $cookies, phoenixsocket, apiConfig, common) {
                var self = this;

                // returns object -> { profileId: number, dbId: number }
                function getProfileId() {
                    var defaultProfile = { profileId: -1, dbId: -1 };
                    return $cookies.getObject(apiConfig.phoenixCookieStore) || defaultProfile;
                }

                function getProfileIdString() {
                    var profileObject = getProfileId();
                    return "DB_" + profileObject.dbId + "_PROFILE_" + profileObject.profileId;
                }

                //     uuid.js
                //
                //     Copyright (c) 2010-2012 Robert Kieffer
                //     MIT License - http://opensource.org/licenses/mit-license.php
                (function () {
                    var _global = self;

                    // Unique ID creation requires a high quality random # generator.  We feature
                    // detect to determine the best RNG source, normalizing to a function that
                    // returns 128-bits of randomness, since that's what's usually required
                    var _rng;

                    // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
                    //
                    // Moderately fast, high quality
                    if (typeof (_global.require) == 'function') {
                        try {
                            var _rb = _global.require('crypto').randomBytes;
                            _rng = _rb && function () { return _rb(16); };
                        } catch (e) { }
                    }

                    if (!_rng && _global.crypto && crypto.getRandomValues) {
                        // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
                        //
                        // Moderately fast, high quality
                        var _rnds8 = new Uint8Array(16);
                        _rng = function whatwgRNG() {
                            crypto.getRandomValues(_rnds8);
                            return _rnds8;
                        };
                    }

                    if (!_rng) {
                        // Math.random()-based (RNG)
                        //
                        // If all else fails, use Math.random().  It's fast, but is of unspecified
                        // quality.
                        var _rnds = new Array(16);
                        _rng = function () {
                            for (var i = 0, r; i < 16; i++) {
                                if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
                                _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
                            }

                            return _rnds;
                        };
                    }

                    // Buffer class to use
                    var BufferClass = typeof (_global.Buffer) == 'function' ? _global.Buffer : Array;

                    // Maps for number <-> hex string conversion
                    var _byteToHex = [];
                    var _hexToByte = {};
                    for (var i = 0; i < 256; i++) {
                        _byteToHex[i] = (i + 0x100).toString(16).substr(1);
                        _hexToByte[_byteToHex[i]] = i;
                    }

                    // **`parse()` - Parse a UUID into it's component bytes**
                    function parse(s, buf, offset) {
                        var i = (buf && offset) || 0, ii = 0;

                        buf = buf || [];
                        s.toLowerCase().replace(/[0-9a-f]{2}/g, function (oct) {
                            if (ii < 16) { // Don't overflow!
                                buf[i + ii++] = _hexToByte[oct];
                            }
                        });

                        // Zero out remaining bytes if string was short
                        while (ii < 16) {
                            buf[i + ii++] = 0;
                        }

                        return buf;
                    }

                    // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
                    function unparse(buf, offset) {
                        var i = offset || 0, bth = _byteToHex;
                        return bth[buf[i++]] + bth[buf[i++]] +
                            bth[buf[i++]] + bth[buf[i++]] + '-' +
                            bth[buf[i++]] + bth[buf[i++]] + '-' +
                            bth[buf[i++]] + bth[buf[i++]] + '-' +
                            bth[buf[i++]] + bth[buf[i++]] + '-' +
                            bth[buf[i++]] + bth[buf[i++]] +
                            bth[buf[i++]] + bth[buf[i++]] +
                            bth[buf[i++]] + bth[buf[i++]];
                    }

                    // **`v1()` - Generate time-based UUID**
                    //
                    // Inspired by https://github.com/LiosK/UUID.js
                    // and http://docs.python.org/library/uuid.html

                    // random #'s we need to init node and clockseq
                    var _seedBytes = _rng();

                    // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
                    var _nodeId = [
                        _seedBytes[0] | 0x01,
                        _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
                    ];

                    // Per 4.2.2, randomize (14 bit) clockseq
                    var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

                    // Previous uuid creation time
                    var _lastMSecs = 0, _lastNSecs = 0;

                    // See https://github.com/broofa/node-uuid for API details
                    function v1(options, buf, offset) {
                        var i = buf && offset || 0;
                        var b = buf || [];

                        options = options || {};

                        var clockseq = options.clockseq !== null ? options.clockseq : _clockseq;

                        // UUID timestamps are 100 nano-second units since the Gregorian epoch,
                        // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
                        // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
                        // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
                        var msecs = options.msecs !== null ? options.msecs : new Date().getTime();

                        // Per 4.2.1.2, use count of uuid's generated during the current clock
                        // cycle to simulate higher resolution clock
                        var nsecs = options.nsecs !== null ? options.nsecs : _lastNSecs + 1;

                        // Time since last uuid creation (in msecs)
                        var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs) / 10000;

                        // Per 4.2.1.2, Bump clockseq on clock regression
                        if (dt < 0 && options.clockseq === null) {
                            clockseq = clockseq + 1 & 0x3fff;
                        }

                        // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
                        // time interval
                        if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === null) {
                            nsecs = 0;
                        }

                        // Per 4.2.1.2 Throw error if too many uuids are requested
                        if (nsecs >= 10000) {
                            throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
                        }

                        _lastMSecs = msecs;
                        _lastNSecs = nsecs;
                        _clockseq = clockseq;

                        // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
                        msecs += 12219292800000;

                        // `time_low`
                        var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
                        b[i++] = tl >>> 24 & 0xff;
                        b[i++] = tl >>> 16 & 0xff;
                        b[i++] = tl >>> 8 & 0xff;
                        b[i++] = tl & 0xff;

                        // `time_mid`
                        var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
                        b[i++] = tmh >>> 8 & 0xff;
                        b[i++] = tmh & 0xff;

                        // `time_high_and_version`
                        b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
                        b[i++] = tmh >>> 16 & 0xff;

                        // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
                        b[i++] = clockseq >>> 8 | 0x80;

                        // `clock_seq_low`
                        b[i++] = clockseq & 0xff;

                        // `node`
                        var node = options.node || _nodeId;
                        for (var n = 0; n < 6; n++) {
                            b[i + n] = node[n];
                        }

                        return buf ? buf : unparse(b);
                    }

                    // **`v4()` - Generate random UUID**

                    // See https://github.com/broofa/node-uuid for API details
                    function v4(options, buf, offset) {
                        // Deprecated - 'format' argument, as supported in v1.2
                        var i = buf && offset || 0;

                        if (typeof (options) == 'string') {
                            buf = options == 'binary' ? new BufferClass(16) : null;
                            options = null;
                        }
                        options = options || {};

                        var rnds = options.random || (options.rng || _rng)();

                        // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
                        rnds[6] = (rnds[6] & 0x0f) | 0x40;
                        rnds[8] = (rnds[8] & 0x3f) | 0x80;

                        // Copy bytes to buffer, if provided
                        if (buf) {
                            for (var ii = 0; ii < 16; ii++) {
                                buf[i + ii] = rnds[ii];
                            }
                        }

                        return buf || unparse(rnds);
                    }

                    // Export public API
                    var uuid = v4;
                    uuid.v1 = v1;
                    uuid.v4 = v4;
                    uuid.parse = parse;
                    uuid.unparse = unparse;
                    uuid.BufferClass = BufferClass;

                    if (typeof define === 'function' && define.amd) {
                        // Publish as AMD module
                        define('uuid', function () { return uuid; });
                    } else if (typeof (module) != 'undefined' && module.exports) {
                        // Publish as node.js module
                        module.exports = uuid;
                    } else {
                        // Publish as global (in browsers)
                        var _previousRoot = _global.uuid;

                        // **`noConflict()` - (browser only) to reset global 'uuid' var**
                        uuid.noConflict = function () {
                            _global.uuid = _previousRoot;
                            return uuid;
                        };

                        _global.uuid = uuid;
                    }
                }());

                function isEmptyObject(obj) {
                    for (var prop in obj) {
                        if (obj.hasOwnProperty(prop))
                            return false;
                    }
                    return true;
                }

                function ConcurrencyNotifyEvent(responseError) {
                    var isWorkflowPositionRefreshEvent = false;
                    function dataWorkflowPositionRefreshEvent(data) {
                        if (!isEmptyObject(data) && data.Message !== null && data.Message.length > 0) {

                            if (typeof $rootScope.globalTableState !== 'undefined' && $rootScope.globalTableState !== null) {
                                var locationPath = $rootScope.$state.$current.name;
                                angular.forEach($rootScope.globalTableState, function (pageSelection) {
                                    if (pageSelection.routeName == locationPath) {
                                        pageSelection.dontSaveCheckboxSelection = true;
                                    }
                                });
                            }

                            var logErrorMessage = data.Message;
                            var logErrorSubject = 'The Object was changed by another user.';
                            if (data && data.GroupingEntityTypeId == ApplicationConstants.EntityType.Organization) {
                                if (data.TargetEntityTypeId == ApplicationConstants.EntityType.Organization && data.TargetEntityId > 0) {
                                    $rootScope.$state.transitionTo('org.edit.details', { organizationId: data.TargetEntityId }, { reload: true, inherit: true, notify: true });
                                }
                                else if (data.TriggerEntityTypeId == ApplicationConstants.EntityType.Organization && data.TriggerEntityId > 0) {
                                    $rootScope.$state.transitionTo('org.edit.details', { organizationId: data.TriggerEntityId }, { reload: true, inherit: true, notify: true });
                                }
                                else if (data.GroupingEntityTypeId == ApplicationConstants.EntityType.Organization && data.GroupingEntityId > 0) {
                                    $rootScope.$state.transitionTo('org.edit.details', { organizationId: data.GroupingEntityId }, { reload: true, inherit: true, notify: true });
                                }
                                else {
                                    logErrorSubject = 'Organization was deleted';
                                    $rootScope.$state.transitionTo('org.search', {}, { reload: true, inherit: true, notify: true });
                                }
                            }
                            else if (data && data.GroupingEntityTypeId == ApplicationConstants.EntityType.Assignment) {
                                //  It is importand to have assignmentId: 0, because it will initiate "AssignmentDataService.setAssignment({})" inside of "app.resolve.AssignmentEntryController"
                                if (data.TargetEntityTypeId == ApplicationConstants.EntityType.WorkOrderVersion && data.TargetEntityId > 0) {
                                    $rootScope.$state.transitionTo('workorder.edit.core', { assignmentId: 0, workOrderId: 0, workOrderVersionId: data.TargetEntityId }, { reload: true, inherit: true, notify: true });
                                }
                                else if (data.TriggerEntityTypeId == ApplicationConstants.EntityType.WorkOrderVersion && data.TriggerEntityId > 0) {
                                    $rootScope.$state.transitionTo('workorder.edit.core', { assignmentId: 0, workOrderId: 0, workOrderVersionId: data.TriggerEntityId }, { reload: true, inherit: true, notify: true });
                                }
                                else {
                                    logErrorSubject = 'Work Order was deleted';
                                    $rootScope.$state.transitionTo('workorder.search', {}, { reload: true, inherit: true, notify: true });
                                }
                            }
                            else if (data && data.GroupingEntityTypeId == ApplicationConstants.EntityType.AccessSubscription) {
                                if (data.TargetEntityTypeId == ApplicationConstants.EntityType.AccessSubscription && data.TargetEntityId > 0) {
                                    $rootScope.$state.transitionTo('access.subscription.edit', { accessSubscriptionId: data.TargetEntityId }, { reload: true, inherit: true, notify: true });
                                }
                                else if (data.TriggerEntityTypeId == ApplicationConstants.EntityType.AccessSubscription && data.TriggerEntityId > 0) {
                                    $rootScope.$state.transitionTo('access.subscription.edit', { accessSubscriptionId: data.TriggerEntityId }, { reload: true, inherit: true, notify: true });
                                }
                                else if (data.GroupingEntityTypeId == ApplicationConstants.EntityType.AccessSubscription && data.GroupingEntityId > 0) {
                                    $rootScope.$state.transitionTo('access.subscription.edit', { accessSubscriptionId: data.GroupingEntityId }, { reload: true, inherit: true, notify: true });
                                }
                                else {
                                    logErrorSubject = 'Access Subscription was deleted';
                                    $rootScope.$state.transitionTo('access.subscription.search', {}, { reload: true, inherit: true, notify: true });
                                }
                            }
                            else if (data && data.GroupingEntityTypeId == ApplicationConstants.EntityType.UserProfile) {
                                if (data.TargetEntityTypeId == ApplicationConstants.EntityType.UserProfile && data.TargetEntityId > 0) {
                                    $rootScope.$state.transitionTo($rootScope.$state.current.name, $rootScope.$state.params, { reload: true, inherit: true, notify: true });
                                }
                                else if (data.TriggerEntityTypeId == ApplicationConstants.EntityType.UserProfile && data.TriggerEntityId > 0) {
                                    $rootScope.$state.transitionTo($rootScope.$state.current.name, $rootScope.$state.params, { reload: true, inherit: true, notify: true });
                                }
                                else if (data.GroupingEntityTypeId == ApplicationConstants.EntityType.UserProfile && data.GroupingEntityId > 0) {
                                    if (data.TargetEntityId) {
                                        $rootScope.$state.transitionTo($rootScope.$state.current.name, $rootScope.$state.params, { reload: true, inherit: true, notify: true });
                                    }
                                    else {
                                        $rootScope.$state.transitionTo($rootScope.$state.current.name, { contactId: 0, profileId: data.GroupingEntityId }, { reload: true, inherit: true, notify: true });
                                    }
                                }
                                else {
                                    var message = 'User Profile was deleted';
                                    $rootScope.$state.transitionTo('ContactCreate.Search', {}, { reload: true, inherit: true, notify: true });
                                }
                            }
                            else if (data && data.GroupingEntityTypeId == ApplicationConstants.EntityType.ComplianceDocumentRule) {
                                if (data.TargetEntityTypeId == ApplicationConstants.EntityType.ComplianceDocumentRule && data.TargetEntityId > 0) {
                                    $rootScope.$state.transitionTo('compliancedocument.documentrule.edit.details', { complianceDocumentRuleId: data.TargetEntityId }, { reload: true, inherit: true, notify: true });
                                }
                                else if (data.TriggerEntityTypeId == ApplicationConstants.EntityType.ComplianceDocumentRule && data.TriggerEntityId > 0) {
                                    $rootScope.$state.transitionTo('compliancedocument.documentrule.edit.details', { complianceDocumentRuleId: data.TriggerEntityId }, { reload: true, inherit: true, notify: true });
                                }
                                else if (data.GroupingEntityTypeId == ApplicationConstants.EntityType.ComplianceDocumentRule && data.GroupingEntityId > 0) {
                                    $rootScope.$state.transitionTo('compliancedocument.documentrule.edit.details', { complianceDocumentRuleId: data.GroupingEntityId }, { reload: true, inherit: true, notify: true });
                                }
                                else {
                                    logErrorSubject = 'Compliance Document Rule was deleted';
                                    $rootScope.$state.transitionTo('compliancedocument.ruleareatype.search', {}, { reload: true, inherit: true, notify: true });
                                }
                            }
                            else if (data && data.GroupingEntityTypeId == ApplicationConstants.EntityType.TransactionHeader) {
                                if (data.TargetEntityTypeId == ApplicationConstants.EntityType.TransactionHeader) {
                                    if (data.TargetEntityId > 0) {
                                        // try to refresh edit
                                        var workOrderId = $rootScope.$state.current.WorkOrderId;
                                        $rootScope.$state.go('transaction.manual.detail', { transactionHeaderId: data.TargetEntityId }, { reload: true, inherit: true, notify: true })
                                            .then(function () { /* ok */ })
                                            .catch(function () {

                                                // the transaction could not be loaded:
                                                //  * return to workorder if there is a work order id
                                                //  * or send to generic transaction search
                                                if (workOrderId) {
                                                    $rootScope.$state.go('workorder.edit.core', { assignmentId: 0, workOrderId: workOrderId, workOrderVersionId: 0 }, { reload: true, inherit: true, notify: true });
                                                } else {
                                                    $rootScope.$state.go('transaction.search', {}, { reload: true, inherit: true, notify: true });
                                                }

                                            });                                
                                    }
                                    else {
                                        logErrorSubject = 'Transaction was deleted';
                                        $rootScope.$state.transitionTo('transaction.search', {}, { reload: true, inherit: true, notify: true });
                                    }

                                } else if (data.TargetEntityTypeId == ApplicationConstants.EntityType.PaymentTransaction) {
                                    // it will be handled by penidng-payment component in angular 2
                                }
                            }
                            else if (data && data.GroupingEntityTypeId == ApplicationConstants.EntityType.ExpenseClaim) {
                                //it will be handled by expense claim service in angular 2 
                            }
                            else if (data && data.GroupingEntityTypeId == ApplicationConstants.EntityType.TimeSheet) {
                                //it will be handled by timesheet service in angular 2 
                            }
                            else if (data && data.GroupingEntityTypeId == ApplicationConstants.EntityType.TimeSheetCapsuleConfiguration) {
                                //it will be handled by timesheet service in angular 2 
                            }
                            else if (data && data.EntityIsDeleted) {
                                if (data.TargetEntityTypeId == ApplicationConstants.EntityType.VmsImportedRecord && data.ReferenceCommandName === 'VmsTimesheetImportRecordTypeUpdate') {
                                    $rootScope.$state.transitionTo('vms.management', {}, { reload: true, inherit: true, notify: true });
                                }
                                else if (data.TargetEntityTypeId == ApplicationConstants.EntityType.Document && data.ReferenceCommandName === 'VmsTimesheetProcessImportRecords') {
                                    $rootScope.$state.transitionTo('vms.management', {}, { reload: true, inherit: true, notify: true });
                                }
                                else if (data.TargetEntityTypeId == ApplicationConstants.EntityType.Document && data.ReferenceCommandName === 'VmsTimesheetMarkImportRecordsDeleted') {
                                    $rootScope.$state.transitionTo('vms.management', {}, { reload: true, inherit: true, notify: true });
                                }
                                else if (data.TargetEntityTypeId == ApplicationConstants.EntityType.CommissionSalesPattern && data.ReferenceCommandName === 'CommissionSaveSalesPattern') {
                                    $rootScope.$state.transitionTo('commission.patternsales', {}, { reload: true, inherit: true, notify: true });
                                }
                                else if (data.TargetEntityTypeId == ApplicationConstants.EntityType.CommissionSalesPattern && data.ReferenceCommandName === 'CommissionDiscardSalesPattern') {
                                    $rootScope.$state.transitionTo('commission.patternsales', {}, { reload: true, inherit: true, notify: true });
                                }
                                else if (data.TargetEntityTypeId == ApplicationConstants.EntityType.PurchaseOrder) {
                                    //switch(data.ReferenceCommandName) //"PurchaseOrderSave"
                                    $rootScope.$state.transitionTo('purchaseorder.search', {}, { reload: true, inherit: true, notify: true });
                                }
                                else if (data.TargetEntityTypeId == ApplicationConstants.EntityType.ComplianceDocumentRule && data.ReferenceCommandName === 'ComplianceDocumentRuleUserActionDiscard') {
                                    $rootScope.$state.transitionTo('compliancedocument.ruleareatypesearch', {}, { reload: true, inherit: true, notify: true });
                                }
                            }
                            else {
                                $rootScope.$state.transitionTo($rootScope.$state.current, $rootScope.$state.params, { reload: true, inherit: true, notify: true });
                            }
                            $rootScope.$broadcast('ConcurrencyNotifyEvent', data);
                            //dialogs.notify(logErrorSubject, logErrorMessage, { keyboard: false, backdrop: 'static', windowClass: 'sales-pattern-dlg-errors' }).result.then(function () { });
                            common.logError(logErrorMessage);
                        }
                    }

                    if (responseError && responseError !== undefined && responseError !== null) {
                        if (!isEmptyObject(responseError.ModelState)) {
                            _.each(responseError.ModelState, function (responseErrorValue, responseErrorKey) {
                                if (Object.prototype.toString.call(responseErrorValue) === '[object Array]' && responseErrorKey.indexOf('ConcurrencyNotifyEvent') >= 0) {
                                    isWorkflowPositionRefreshEvent = true;
                                    _.each(responseErrorValue, function (errorValue, errorKey) {
                                        var data = angular.fromJson(errorValue);
                                        dataWorkflowPositionRefreshEvent(data);
                                    });
                                }
                            });
                        }
                        else if (!isEmptyObject(responseError.CommandName) && responseError.CommandName === 'ConcurrencyNotifyEvent') {
                            isWorkflowPositionRefreshEvent = true;
                            dataWorkflowPositionRefreshEvent(responseError);
                        }
                    }
                    return isWorkflowPositionRefreshEvent;
                }

                function sendUIActionExecutionLog(data){
                    if(apiConfig.actionLogEnabled){
                        UIActionExecutionLogs.push(data);
                        if(UIActionExecutionLogs.length >= apiConfig.nMaxActionLogsPerSend){
                            $http({
                                method: 'POST',
                                url: apiConfig.apiEndPoint + '/UIActionExecutionLog',
                                data: UIActionExecutionLogs,
                                headers: {
                                    'PhoenixValues': getProfileIdString(),
                                    'Authorization': 'Bearer ' + docCookies.getItem("BearerToken"),
                                }
                            });
                            UIActionExecutionLogs = [];
                        }
                    }
                }

                phoenixsocket.onPrivate('ConcurrencyNotifyEvent', function (event, responseError) {
                    if (responseError.IsOwner) {
                        ConcurrencyNotifyEvent(responseError);
                    }
                }, true);

                var result = {
                    command: function (command, data) {
                        var deferred = $q.defer();

                        function submitCommand() {
                            var headers = {
                                'PhoenixValues': getProfileIdString(),
                                'Authorization': 'Bearer ' + docCookies.getItem("BearerToken"),
                                'Cache-Control': 'no-cache, no-store, must-revalidate',
                                'Pragma': 'no-cache',
                                'Expires': '0'
                            };

                            sendUIActionExecutionLog({
                                'ClientDateTime': new Date(),
                                'ActionType': 'command',
                                'EventType': 'request',
                                'UserAction': '',
                                'RequestHeaders': JSON.stringify(headers),
                                'PageTitle': document.title,
                                'PageUrl': window.location.href,
                                'Url': apiConfig.apiEndPoint + '/command',
                                'Verb': 'POST',
                                'CommandName': cmd.CommandName,
                                'CommandId': cmd.CommandId,
                                'CommandBody': JSON.stringify(cmd)
                            });

                            $http({
                                method: 'POST',
                                url: apiConfig.apiEndPoint + '/command',
                                data: cmd,
                                headers: headers
                            })
                                .success(function (data, status, headers, config) {
                                    if (status == 200) {
                                        // do something?
                                    }
                                    else if (status == 401) { // Unauthorized
                                        var msg = data ? data.Message : "Unauthorized Access";
                                        deferred.reject({ msg: msg, status: status, response: undefined });
                                        // redirect to login page?
                                    }
                                })
                                .error(function (data, status, headers, config) {
                                    if (ConcurrencyNotifyEvent(data)) {

                                    }
                                    else {
                                        if (status == 400) {
                                            deferred.reject({ status: status, response: data, ModelState: data && data.ModelState ? data.ModelState : null });
                                        }
                                        else {
                                            var isConcurrencyException = status === 500 && data.ExceptionMessage == "Concurrency exception";
                                            deferred.reject({ status: status, response: undefined, isConcurrencyException: isConcurrencyException });
                                        }
                                    }
                                });
                        }

                        var cmd = {};

                        if (typeof command == 'string' || command instanceof String) {
                            jQuery.extend(cmd, data);
                            cmd.CommandName = command;
                        }
                        else {
                            jQuery.extend(cmd, command);
                        }

                        var uuid = require('uuid').v4();
                        cmd.CommandId = uuid;
                        if (typeof data === 'object' && typeof data.CommandId === 'undefined') {
                            data.CommandId = uuid;
                        }

                        phoenixsocket.addToOwnerDictionary(uuid);

                        phoenixsocket.onDisconnect(deferred.reject);

                        phoenixsocket.onPrivate(cmd.CommandName + '.complete.' + uuid, function (commandName, data) {
                            if (data.CommandId == uuid) {
                                if (data.IsValid === false) {
                                    deferred.reject(data);
                                    phoenixsocket.leave(uuid);
                                    if (typeof data.unregister === 'function') {
                                        data.unregister();
                                    }
                                }
                                else {
                                    deferred.resolve(data);
                                    phoenixsocket.leave(uuid);
                                    if (typeof data.unregister === 'function') {
                                        data.unregister();
                                    }
                                }

                                sendUIActionExecutionLog({
                                    'ClientDateTime': new Date(),
                                    'ActionType': 'command',
                                    'EventType': 'respond',
                                    'UserAction': '',
                                    'PageTitle': document.title,
                                    'PageUrl': window.location.href,
                                    'Url': apiConfig.apiEndPoint + '/command',
                                    'Verb': 'POST',
                                    'CommandName': cmd.CommandName,
                                    'CommandId': cmd.CommandId,
                                });
                            }
                        });

                        phoenixsocket.onPrivate(cmd.CommandName + '.error.' + uuid, function (commandName, data, unreg) {
                            if (data.CommandId == uuid) {
                                deferred.reject(data);
                                phoenixsocket.leave(uuid);
                                if (typeof data.unregister === 'function') {
                                    data.unregister();
                                }

                                sendUIActionExecutionLog({
                                    'ClientDateTime': new Date(),
                                    'ActionType': 'command',
                                    'EventType': 'respond',
                                    'UserAction': '',
                                    'PageTitle': document.title,
                                    'PageUrl': window.location.href,
                                    'Url': apiConfig.apiEndPoint + '/command',
                                    'Verb': 'POST',
                                    'CommandName': cmd.CommandName,
                                    'CommandId': cmd.CommandId,
                                    'Exception': JSON.stringify(data)
                                });
                            }
                        });

                        phoenixsocket
                            .join(uuid)
                            .then(function (e) {
                                submitCommand();
                            }, function (err) {
                                // TODO: what to do if we fail to join channel?!
                            });
                        return deferred.promise;
                    },

                    /**
                     * @param string path
                     * @param object interceptorOptions
                     *          - skipErrorIntercept
                     */
                    query: function (path, interceptorOptions) {
                        var queryId = require('uuid').v4();
                        var headers = {
                            'PhoenixValues': getProfileIdString(),
                            'Authorization': 'Bearer ' + docCookies.getItem("BearerToken"),
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            'Pragma': 'no-cache',
                            'Expires': '0'
                        };
                        sendUIActionExecutionLog({
                            'ClientDateTime': new Date(),
                            'ActionType': 'query',
                            'EventType': 'request',
                            'UserAction': '',
                            'RequestHeaders': JSON.stringify(headers),
                            'PageTitle': document.title,
                            'PageUrl': window.location.href,
                            'Url': apiConfig.apiEndPoint + '/' + path,
                            'Verb': 'GET',
                            'CommandId': queryId,
                        });
                        
                        var deferred = $q.defer();

                        $http({
                            method: 'GET',
                            url: apiConfig.apiEndPoint + '/' + path,
                            headers: headers,
                            interceptorOptions: interceptorOptions
                        })
                            .success(function (data, status, headers, config) {
                                if (status == 200) { // Ok
                                    // do something?
                                }
                                else if (status == 401) { // Unauthorized
                                    var msg = data ? data.Message : "Unauthorized Access";
                                    deferred.reject({ msg: msg, status: status });
                                    // redirect to login page?
                                }

                                deferred.resolve(data);

                                sendUIActionExecutionLog({
                                    'ClientDateTime': new Date(),
                                    'ActionType': 'query',
                                    'EventType': 'respond',
                                    'UserAction': '',
                                    'PageTitle': document.title,
                                    'PageUrl': window.location.href,
                                    'Url': apiConfig.apiEndPoint + '/' + path,
                                    'Verb': 'GET',
                                    'CommandId': queryId,
                                    'HttpStatusCode': status
                                });
                            })
                            .error(function (data, status, headers, config) {
                                var msg = data ? data.Message : "Error querying data";

                                if (!data || data === '') {
                                    data = { Status: status, Message: msg }
                                }
                                //deferred.reject({ msg: msg, status: status });
                                deferred.reject(data);
                                // log it?

                                sendUIActionExecutionLog({
                                    'ClientDateTime': new Date(),
                                    'ActionType': 'query',
                                    'EventType': 'respond',
                                    'UserAction': '',
                                    'PageTitle': document.title,
                                    'PageUrl': window.location.href,
                                    'Url': apiConfig.apiEndPoint + '/' + path,
                                    'Verb': 'GET',
                                    'CommandId': queryId,
                                    'HttpStatusCode': status,
                                    'Exception': JSON.stringify(data)
                                });
                            });

                        return deferred.promise;
                    },
                    PhoenixNavigationCache: function () {
                        var defer = $q.defer();
                        this.query('Navigation').then(function (rsp) {
                            defer.resolve({ 'Navigation': rsp.NavigationItems });
                        });
                        return defer.promise;
                    },

                    url: function (path) {
                        if (!path) return;

                        var mainRoot = apiConfig.rawApiEndPoint.replace(/\/$/, '') + '/api/';
                        var result = path.replace(/^\/|\/$/g, '');

                        if (result.indexOf(mainRoot) == -1)
                            result = mainRoot + result;

                        return result + '?PhoenixValues=' + getProfileIdString() + '&access_token=' + docCookies.getItem("BearerToken");
                    },

                    urlwithroom: function (path, commandId) {
                        if (!path) {
                            return;
                        }

                        //var deferred = $q.defer();

                        if (typeof (commandId) === 'undefined' || commandId === null) {
                            commandId = self.uuid.v4();
                        }
                        phoenixsocket.addToOwnerDictionary(commandId);

                        var mainRoot = apiConfig.rawApiEndPoint.replace(/\/$/, '') + '/api/';
                        var result = path.replace(/^\/|\/$/g, '');

                        if (result.indexOf(mainRoot) == -1) {
                            result = mainRoot + result;
                        }

                        var toResolve = result + '?PhoenixValues=' + getProfileIdString() + '&commandId=' + commandId + '&access_token=' + docCookies.getItem("BearerToken");

                        phoenixsocket
                            .join(commandId)
                            .then(function (e) {
                                //deferred.resolve(toResolve);
                            }, function (err) {
                            });
                        //return deferred.promise;
                        return toResolve;
                    },

                    serverUnavailable: function () {
                        phoenixsocket.serverUnavailable();
                    },
                    getServerUnavailable: function () {
                        return phoenixsocket.getServerUnavailable();
                    },
                    setServerUnavailable: function (unavailable) {
                        phoenixsocket.setServerUnavailable(unavailable);
                    }
                };

                return result;
            } // phoneixapi()

        ]);

    phoenixapiApp
        .factory('phoenixauth', ['$http', '$q', '$rootScope', '$cookies', 'apiConfig', 'phoenixapi', 'phoenixsocket',
            function ($http, $q, $rootScope, $cookies, apiConfig, phoenixapi, phoenixsocket) {
                var self = this;
                $rootScope.UserContext = {};
                $rootScope.CurrentUserLoggedIn = {};
                $rootScope.CurrentProfile = {};

                $rootScope.$on('broadcastEvent:logout', function () {
                    result.currentUser = null;
                });

                // returns object -> { profileId: number, dbId: number }
                function getProfileId() {
                    var defaultProfile = { profileId: -1, dbId: -1 };
                    return $cookies.getObject(apiConfig.phoenixCookieStore) || defaultProfile;
                }

                function getProfileIdString() {
                    var profileObject = getProfileId();
                    return "DB_" + profileObject.dbId + "_PROFILE_" + profileObject.profileId;
                }

                function setProfileId(dbId, profileId) {
                    var deferred = $q.defer();

                    $cookies.putObject(apiConfig.phoenixCookieStore, { profileId: profileId, dbId: dbId });

                    $http({
                        method: 'POST',
                        url: apiConfig.apiEndPoint + '/account/SwitchProfile/' + dbId + '/' + profileId,
                        headers: {
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            'Authorization': 'Bearer ' + docCookies.getItem("BearerToken"),
                            'Pragma': 'no-cache',
                            'Expires': '0'
                        }
                    })
                        .success(function (data, status, headers, config) {
                            //TODO: fix this
                            var access_token = data && data.token;
                            if (!access_token) {
                                throw "Invalid token!";
                            }

                            document.cookie = docCookies.setItem("BearerToken", access_token, null, "/");
                            document.cookie = docCookies.setItem("BearerIdentity", data ? JSON.stringify({
                                userName: data.userName,
                                profileId: data.profileId,
                                databaseId: data.databaseId,
                                email: data.email
                            }) : '', null, "/");

                            $rootScope.CurrentProfile = pickProfile({ User: $rootScope.CurrentUserLoggedIn });
                            deferred.resolve(true);
                        })
                        .error(function (data, status, headers, config) {
                            deferred.reject(data);
                        });

                    return deferred.promise;
                }

                function getRequestHeaderValues() {
                    return {
                        headers: {
                            'PhoenixValues': $rootScope.CurrentProfile.Id,
                            'Authorization': 'Bearer ' + docCookies.getItem("BearerToken")
                        }
                    };
                }

                function pickProfile(context) {
                    var user = context ? context.User : null;
                    var userProfiles = user ? user.UserProfiles || user.Profiles : null;
                    var len = userProfiles ? userProfiles.length : 0

                    if (len) {
                        var result;
                        var profileIdObject = getProfileId();

                        for (var i = len - 1; i >= 0; i--) {
                            if ((userProfiles[i].Id === profileIdObject.profileId || userProfiles[i].ProfileId === profileIdObject.profileId) && 
                                (!userProfiles[i].DatabaseId || userProfiles[i].DatabaseId === profileIdObject.dbId)) {
                                result = userProfiles[i];
                                break;
                            }

                            if (userProfiles[i].IsPrimary) {
                                result = userProfiles[i];
                            }
                            else if (!result || result.Id <= 0) {
                                result = userProfiles[i];
                            }
                        }

                        //setProfileId(result.Id || -1);
                        return Object.assign(result, { DatabaseId: profileIdObject.dbId }) || {};
                    }

                    return {};
                }

                var result = {
                    hasInit: function () {
                        return !!docCookies.hasItem("BearerToken");
                        // // Reset local storage
                        // // TODO: fix this
                        // window.access_token = localStorage.getItem('phoenixtoken');
                        // window.PhoenixCodeValues = JSON.parse(localStorage.getItem('PhoenixCodeValues'));
                    },

                    currentUser: null,

                    // Function to check if the token is valid
                    getCurrentUser: function () {
                        if (!result.hasInit()) {
                            return $q.reject();
                        }

                        if (result.currentUser) {
                            return $q.resolve(result.currentUser);
                        }

                        var deferred = $q.defer();

                        $http({
                            method: 'GET',
                            url: apiConfig.apiEndPoint + '/account/UserInfo',
                            headers: {
                                'Cache-Control': 'no-cache, no-store, must-revalidate',
                                'Pragma': 'no-cache',
                                'Expires': '0',
                                'Authorization': 'Bearer ' + docCookies.getItem("BearerToken")
                            }
                        }).then(function (response) {
                            result.currentUser = response && response.data;
                            $rootScope.CurrentUserLoggedIn = result.currentUser || {};
                            if (!result.currentUser) {
                                deferred.reject("User not valid!");
                            }
                            else {
                                deferred.resolve(result.currentUser);
                            }
                        }, function (err) {
                            result.currentUser = null;
                            deferred.reject(err);
                        })
                        return deferred.promise;
                    },

                    getRequestHeaderValues: getRequestHeaderValues,

                    validateRegistrationToken: function (et) {
                        var deferred = $q.defer();
                        $http.post(apiConfig.apiEndPoint + '/account/ValidateExternalToken', "'" + et + "'")
                            .then(function (response) {
                                deferred.resolve(response);
                            }, function (err) {
                                deferred.reject(err);
                            });
                        return deferred.promise;
                    },
                    register: function (username, password, confirmPassword, cultureId, et) {
                        var deferred = $q.defer();
                        $http.post(apiConfig.apiEndPoint + '/Account/Register', {
                            UserName: username,
                            Password: password,
                            ConfirmPassword: confirmPassword,
                            CultureId: cultureId,
                            RegistrationToken: et,
                        },
                            {
                                headers: {
                                    'PhoenixCultureId': cultureId
                                }
                            }
                        ).then(function (response) {
                            deferred.resolve(response);
                        }, function (err) {
                            deferred.reject(err);
                        });
                        return deferred.promise;
                    },

                    login: function (username, password) {
                        var data = "grant_type=password&username=" + username + "&password=" + encodeURIComponent(password);

                        return $http.post(apiConfig.rawApiEndPoint + '/token', data,
                            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
                            .then(function (response) {
                                //TODO: fix this
                                var access_token = response && response.data && response.data.access_token;
                                if (!access_token) {
                                    throw "Invalid token!";
                                }
                                document.cookie = docCookies.setItem("BearerToken", access_token, null, "/");

                                // connect to signalR
                                phoenixsocket.connect();
                                //jQuery.ajaxSetup(getRequestHeaderValues());
                                return response;
                            });
                    },

                    setCurrentProfile: function (databaseId, profileId) {
                        return setProfileId(databaseId, profileId).then(function (result) {
                            jQuery.ajaxSetup(getRequestHeaderValues());
                            return result;
                        });
                    },
                    loadContext: function () {
                        var deferred = $q.defer();

                        phoenixapi
                            .query('security/context')
                            .then(function (rsp) {
                                $rootScope.UserContext = rsp.Items[0];
                                $rootScope.CurrentProfile = pickProfile($rootScope.UserContext);
                                jQuery.ajaxSetup(getRequestHeaderValues());
                                phoenixsocket.connect();
                                deferred.resolve($rootScope.UserContext);
                            }, function (err) {
                                deferred.reject();
                            });

                        return deferred.promise;
                    },

                    getCurrentProfile: function () {
                        // TODO: do we need this?
                        var deferred = $q.defer();

                        if (!$rootScope.CurrentProfile.Id || $rootScope.CurrentProfile.Id <= 0) {
                            this.loadContext()
                                .then(function (rsp) {
                                    deferred.resolve($rootScope.CurrentProfile);
                                }, function (err) {
                                    deferred.reject();
                                });
                        }
                        else {
                            deferred.resolve($rootScope.CurrentProfile);
                        }

                        return deferred.promise;
                    },

                    logout: function () {
                        phoenixsocket.disconnect();

                        document.cookie = "BearerToken=; path=/; expires=" + new Date(0).toUTCString();
                        document.cookie = "BearerIdentity=; path=/; expires=" + new Date(0).toUTCString();
                        localStorage.removeItem('phoenixtoken');

                        result.currentUser = null;
                        $rootScope.CurrentUserLoggedIn = {};
                        $rootScope.$broadcast('broadcastEvent:logout');
                    },
                    changePassword: function (model) {
                        return $http({
                            method: 'POST',
                            url: apiConfig.apiEndPoint + '/account/ChangePassword',
                            headers: {
                                'Cache-Control': 'no-cache, no-store, must-revalidate',
                                'Pragma': 'no-cache',
                                'Expires': '0',
                                'Authorization': 'Bearer ' + docCookies.getItem("BearerToken")
                            },
                            data: model
                        });
                    },
                    forgotPassword: function (email) {
                        return $http({
                            method: 'POST',
                            url: apiConfig.apiEndPoint + '/account/ForgotPassword',
                            headers: {
                                'Cache-Control': 'no-cache, no-store, must-revalidate',
                                'Pragma': 'no-cache',
                                'Expires': '0'
                            },
                            data: { Email: email }
                        })
                    },
                    resetPassword: function (model) {
                        return $http({
                            method: 'POST',
                            url: apiConfig.apiEndPoint + '/account/ResetPassword',
                            headers: {
                                'Cache-Control': 'no-cache, no-store, must-revalidate',
                                'Pragma': 'no-cache',
                                'Expires': '0'
                            },
                            data: model
                        });
                    }
                };

                return result;
            }
        ]);


}(window, jQuery));