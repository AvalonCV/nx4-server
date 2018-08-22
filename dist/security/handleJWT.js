"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JWT = require("jsonwebtoken");
const createReturnObject = (token_is_new, token_is_valid, data, token) => {
    return {
        token_is_new,
        token_is_valid,
        claims: token_is_valid ? data : undefined,
        error: token_is_valid ? undefined : data,
        token: token_is_new ? token : undefined
    };
};
exports.handleJWT = (jwt_token) => {
    return new Promise((resolve, reject) => {
        if (!jwt_token) {
            const payload = {
                customer_objid: 1
            };
            resolve(createReturnObject(true, true, payload, JWT.sign(payload, 'shhh', { expiresIn: 60 * 60 })));
        }
        else {
            JWT.verify(jwt_token, 'shhh', {}, (error, payload) => {
                if (error) {
                    reject(createReturnObject(false, false, error));
                }
                else {
                    // everything is fine
                    resolve(createReturnObject(false, true, payload));
                }
            });
        }
    });
};
//# sourceMappingURL=handleJWT.js.map