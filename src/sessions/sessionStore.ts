import { randomBytes } from 'crypto';
import { SessionAuthentificationState } from 'interface/session';

export interface GenericSessionData {
	[key: string]: any;
}

export type SessionData = SessionAuthentificationState & GenericSessionData;

interface Session {
	data: SessionData;
	creation_date: Date;
	last_access_date: Date;
	timeout_date: Date;
	time_to_live_ms: Number;
}

const default_time_to_live_ms = 1000 * 60 * 60; // 1 hour

export class CSessionStore {
	private sessions: {
		[session_key: string]: Session;
	};

	constructor() {
		this.sessions = {};
	}

	public createNewSession(session_identifier: string, add_session_to_store: boolean = true): SessionData {
		if (this.isSessionDefined(session_identifier)) {
			throw new Error(
				`Should create new session for token ${session_identifier} but there is already an entry in the session store.`
			);
		} else {
			const new_session = {
				data: {
					is_identified: false,
					is_authenticated: false,
					customer_objid: -1,
					seed: Math.random()
				},
				creation_date: new Date(),
				last_access_date: new Date(),
				timeout_date: new Date(Date.now() + default_time_to_live_ms),
				time_to_live_ms: default_time_to_live_ms
			};

			if (add_session_to_store) {
				this.sessions[session_identifier] = new_session;
			}

			return new_session.data;
		}
	}

	public isSessionDefined(session_identifier: string): boolean {
		return !!this.sessions[session_identifier];
	}

	public getSessionData(session_identifier: string): SessionData {
		const session = this.sessions[session_identifier];

		session.last_access_date = new Date();
		session.timeout_date = new Date(Date.now() + default_time_to_live_ms);

		return session.data;
	}

	public createNewSessionIdentifier(): string {
		let session_identifier = null;
		while (session_identifier === null || this.isSessionDefined(session_identifier)) {
			session_identifier = randomBytes(32).toString('hex');
		}
		return session_identifier;
	}
}

export const SessionStore = new CSessionStore();
