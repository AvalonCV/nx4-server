import * as JWT from 'jsonwebtoken';

export interface JWTClaims {
	session_identifier: string;
	[key: string]: any;
}

const secret = 'shhhhhhhhh';

export const isJWTValid = (jwt_token: string): Promise<boolean> => {
	return new Promise((resolve, reject) => {
		JWT.verify(jwt_token, secret, {}, (error: JWT.JsonWebTokenError) => {
			if (error) {
				resolve(false);
			} else {
				resolve(true);
			}
		});
	});
};

export const getJWTClaims = (jwt_token: string): Promise<JWTClaims> => {
	return new Promise((resolve, reject) => {
		JWT.verify(
			jwt_token,
			secret,
			{},
			(error, claims: JWTClaims | object | string): void => {
				if (error) {
					reject(error);
				} else if (typeof claims === 'string') {
					reject(new Error('Claims have to be an object like stuctrure in this application'));
				} else if (!('session_identifier' in claims)) {
					reject(new Error('session_identifier is missing in claims'));
				} else {
					resolve(claims);
				}
			}
		);
	});
};

export const createJWT = (claims: JWTClaims): string => {
	if (claims.iat) {
		delete claims.ait;
	}
	if (claims.exp) {
		delete claims.exp;
	}

	return JWT.sign(claims, secret, { expiresIn: 60 * 60 });
};
