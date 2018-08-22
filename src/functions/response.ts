import { SessionData } from 'sessions/sessionStore';

export interface IAuthentificationResponsePart {
	is_identified: boolean;
	is_authenticated: boolean;
}

export type IErrorResponsePart =
	| {
			error_occured: false;
	  }
	| {
			error_occured: true;
			error_message: string;
			error_callstack?: string;
	  };

export interface IActionDataResponsePart<T> {
	action_valid: boolean;
	action_payload?: T;
}

export const createInterfaceResponse = <T = object>(
	session: SessionData,
	action_data: T
): IAuthentificationResponsePart & IErrorResponsePart & IActionDataResponsePart<T> => {
	return {
		is_identified: session.is_identified,
		is_authenticated: session.is_authenticated,
		error_occured: false,
		action_valid: true,
		action_payload: action_data
	};
};
