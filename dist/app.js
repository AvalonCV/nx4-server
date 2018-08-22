"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// lib/app.ts
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const handleJWT_1 = require("./security/handleJWT");
const sessionStore_1 = require("./sessions/sessionStore");
class App {
    constructor() {
        this.app = express();
        this.config();
        this.handleRoutes();
    }
    config() {
        // remove etags from response
        this.app.set('etag', false);
        // we need cookie support
        this.app.use(cookieParser());
        // support application/json type post data
        this.app.use(bodyParser.json());
        //support application/x-www-form-urlencoded post data
        this.app.use(bodyParser.urlencoded({ extended: false }));
        // setup session-store
        this.session_store = sessionStore_1.SessionStore;
    }
    handleRoutes() {
        this.app
            .route('/interface/:interface_key?/:action_type?')
            .get((request, response) => {
            const { interface_key = request.query.interface_key, action_type = request.query.action_type } = request.params;
            const payload = Object.assign({}, request.query);
            delete payload.interface_key;
            delete payload.action_type;
            const duration_start = Date.now();
            handleJWT_1.handleJWT(request.cookies && request.cookies.authtoken)
                .then((state) => {
                if (state.token_is_new) {
                    response.cookie('authtoken', state.token);
                }
                // get session object for current token
                let session;
                if (this.session_store.isSessionDefined(state.token)) {
                    session = this.session_store.getSessionData(state.token);
                }
                else {
                    session = this.session_store.createNewSession(state.token);
                }
                // handle the actual action!
                Promise.resolve().then(() => require('./interface/' + interface_key)).then((interface_functions) => {
                    const { handleAction } = interface_functions;
                    handleAction(session, action_type, payload);
                });
                response
                    .status(200)
                    .type('json')
                    .send({
                    message: ``,
                    duration: Date.now() - duration_start,
                    session: session
                });
            })
                .catch((state) => {
                response
                    .status(200)
                    .clearCookie('authtoken')
                    .type('json')
                    .send({
                    message: ``,
                    duration: Date.now() - duration_start
                });
            });
        });
        this.app.route('*').get((request, response) => {
            response
                .status(404)
                .type('json')
                .send({
                error: 'something went wrong :('
            });
        });
    }
}
exports.default = new App().app;
//# sourceMappingURL=app.js.map