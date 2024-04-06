import HTTP from '../classes/http.js';
import { compare, hash } from 'bcrypt';
import config from 'config';

export class Signin extends HTTP {

    authExecption = true;

    async execute({email, password}) {

        const user = await this.collections.get('user_auth')
        .findOne({email : email},{userId: 1, password: 1});

        if(!user.userId) {
            this.execption({message: 'user not exist', status: 400});
            return false;
        }

        const passwordCheck = await compare(password, user.password);

        if(!passwordCheck) {
            this.execption({message: 'Either Account Id or password is not correct..', status: 400});
            return false;
        }

        const data = {
            email: email,
            exp: Math.floor(Date.now() / 1000) + (60 * 60)
        }

        const token = await this.generateToken(data);

        return {
            comment: 'successfully logged In....',
            token: token
        };
    }
}

export class Signup extends HTTP {

    authExecption = true;

    async execute({email, password, name}) {

        const 
            UserAuth = this.collections.get('user_auth'),
            UserProfile = this.collections.get('user_profile');

        const user  = UserAuth.findOne({email : email},{userId: 1});

        if(user && user?.userId) {
            this.execption({message: 'Account Id associated to another account', status: 400});
            return false;
        }

        const passwordHash = await hash(password, config.get('password_hash'));

        const data = {
            email: email,
            password: passwordHash
        }

        try {

            const userAuthIntance =  new UserAuth(data);

            await userAuthIntance.save();

            const newUser  = await this.collections.get('user_auth')
            .findOne({email : email},{userId: 1});

            const profile = {
                name: name,
                userId: newUser.userId
            }

            const userProfileInstance = new UserProfile(profile);

            await userProfileInstance.save();
        } catch(e) {

            this.execption({message: e.message, status: 500});
            return false;
        }

        const token = await this.generateToken(email);

        return {
            comment: 'Account created successfully....',
            token: token
        };
    }
}