"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const default_time_to_live_ms = 1000 * 60 * 60; // 1 hour
class CSessionStore {
    constructor() {
        this.sessions = {};
    }
    createNewSession(token) {
        if (this.sessions.token) {
            throw new Error(`Should create new session for token ${token} but there is already an entry in the session store.`);
        }
        else {
            this.sessions[token] = {
                data: {
                    is_identified: false,
                    is_authenticated: false,
                    seed: Math.random()
                },
                creation_date: new Date(),
                last_access_date: new Date(),
                timeout_date: new Date(Date.now() + default_time_to_live_ms),
                time_to_live_ms: default_time_to_live_ms
            };
            return this.sessions[token].data;
        }
    }
    isSessionDefined(token) {
        return !!this.sessions[token];
    }
    getSessionData(token) {
        const session = this.sessions[token];
        session.last_access_date = new Date();
        session.timeout_date = new Date(Date.now() + default_time_to_live_ms);
        return session.data;
    }
}
exports.CSessionStore = CSessionStore;
exports.SessionStore = new CSessionStore();
//# sourceMappingURL=sessionStore.js.map