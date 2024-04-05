import {sign ,verify} from 'jsonwebtoken';
import config from 'config';
import HTTP from './http';

export default class AuthenticateAPI {

    constructor(request, response) {
        this.request = request;
        this.response = response;
    }

    async generateToken(data) {
        const secret = config.get('jwt_secret_key');
        return sign(data, secret);
    }

    async verifyToken() {
        const token = req.headers['authorization'];
        if(!token) {
            HTTP.execption({message: 'Unauthorized access',status: 400});
        }
        const secret = config.get('jwt_secret_key');

        const {userId} = await verify(token,secret);

        if(!userId) {
            HTTP.execption({message: 'Unauthorized access',status: 400});
        }

        this.userId = userId;
    }
}