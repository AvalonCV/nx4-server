import { SessionData } from './../sessions/sessionStore';

export interface LoginPayload {
	login: string;
	password: string;
}

export interface SessionAuthentificationState {
	is_authenticated: boolean;
	is_identified: boolean;
	customer_objid: number;
}

const areLoginCredentialsValid = (login: string, password: string): boolean => {
	if (login === 'letme@in.com' && password === 'simsalabim!') {
		return true;
	} else {
		return false;
	}
};

const handleLogin = (session: SessionData, login: string, password: string): void => {
	if (areLoginCredentialsValid(login, password)) {
		session.is_authenticated = true;
		session.is_identified = true;
	} else {
	}
};

const handleLogout = (session: SessionData): void => {
	session.is_authenticated = false;
	session.is_identified = false;
};

export const handleAction = (session: SessionData, action_type: string = '', payload: LoginPayload) => {
	switch (action_type) {
		case 'login':
			const { login, password } = payload;
			handleLogin(session, login, password);
			break;
		case 'logout':
			handleLogout(session);
			break;
		default:
			throw new Error(`The action '${action_type}' has no function assigned to it and thus cannot be executed.`);
	}
};
