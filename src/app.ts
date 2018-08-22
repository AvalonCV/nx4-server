// lib/app.ts
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';

import { isJWTValid, getJWTClaims, JWTClaims, createJWT } from './security/handleJWT';
import { SessionStore, CSessionStore, SessionData } from './sessions/sessionStore';
import { createInterfaceResponse } from './functions/response';

export interface IInterface {
	handleAction: (session: SessionData, action_type: string, payload: object) => any;
}

class App {
	public app: express.Application;
	private session_store: CSessionStore;

	constructor() {
		this.app = express();
		// setup session-store
		this.session_store = SessionStore;
		this.config();
		this.handleRoutes();
	}

	private config(): void {
		// remove etags from response
		this.app.set('etag', false);
		// we need cookie support
		this.app.use(cookieParser());
		// support application/json type post data
		this.app.use(bodyParser.json());
		//support application/x-www-form-urlencoded post data
		this.app.use(bodyParser.urlencoded({ extended: false }));
	}

	private handleRoutes(): void {
		this.app
			.route('/interface/:interface_key?/:action_type?')
			.get(async (request: express.Request, response: express.Response) => {
				const duration_start = Date.now();
				try {
					let new_claims: JWTClaims = { session_identifier: '' };
					if (await isJWTValid(request.cookies.authtoken)) {
						// token is valid, get claims and check if session is still valid
						const claims = await getJWTClaims(request.cookies.authtoken);
						if (this.session_store.isSessionDefined(claims.session_identifier)) {
							new_claims = claims;
						}
					} else {
						response.clearCookie('authtoken');
					}

					let session: SessionData;
					if (new_claims.session_identifier === '') {
						new_claims.session_identifier = this.session_store.createNewSessionIdentifier();
						session = this.session_store.createNewSession(new_claims.session_identifier);
					} else {
						session = this.session_store.getSessionData(new_claims.session_identifier);
					}

					// check if we need to update our JWT (e.g. with new session info)
					const new_authtoken = createJWT(new_claims);
					if (new_authtoken !== request.cookies.authtoken) {
						response.cookie('authtoken', new_authtoken);
					}

					// handle the actual action!
					const {
						interface_key = request.query.interface_key,
						action_type = request.query.action_type
					}: { interface_key: string; action_type: string; payload: object } = request.params;

					if (!interface_key || !/[a-z_]/.test(interface_key)) {
						throw new Error('interface_key missing or wrong format');
					}

					const action_payload = { ...request.query };
					delete action_payload.interface_key;
					delete action_payload.action_type;

					const interface_functions: IInterface = await import('./interface/' + interface_key);
					const { handleAction } = interface_functions;
					handleAction(session, action_type, action_payload);

					response
						.status(200)
						.type('json')
						.send(createInterfaceResponse<object>(session, {}));
				} catch (error) {
					response
						.status(500)
						.type('json')
						.send({
							message: `Something went very wrong: '${error.message}'`,
							error: error,
							duration: Date.now() - duration_start
						});
				}
			});

		this.app.route('*').get((request: express.Request, response: express.Response) => {
			response
				.status(404)
				.type('json')
				.send({
					error: 'something went wrong :('
				});
		});
	}
}

export default new App().app;
