import jwt from 'jsonwebtoken';
import config from 'config';
import HTTP from './http.js';
import Mongodb from './mongo.js';

export default class AuthenticateAPI {

    constructor(request, response) {
        this.request = request;
        this.response = response;
        this.collections = Mongodb.collections;
    }

    async generateToken(data) {
        const secret = config.get('jwt_secret_key');
        return jwt.sign(data, secret);
    }

    async verifyToken() {
        const token = this.request.headers['authorization'].split(' ')[1];

        if(!token) {
            this.response.status(400).json({ message: 'false', error: 'Unauthorized access'});
        }
        const secret = config.get('jwt_secret_key');

        try {
             const obj = await jwt.verify(token,secret);

             if(!obj.email) {
                throw new Error('Unauthorized access');
             }
             this.user = await Mongodb.collections.get('user_auth').findOne({email: obj.email},{password: 0});
        } catch(e) {
            this.response.status(400).json({ message: 'false', error: e.message});
        }
    }
}