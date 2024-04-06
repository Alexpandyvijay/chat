import { Schema, connect, model} from 'mongoose';
import config from 'config';
import { v4 as uuidv4 } from 'uuid';


export default class Mongodb {

    static collections = new Map();
    static collectionSchema = new Map();

    static async setup() {

        if(!config.has('mongo_url')) {
            throw new Error('Mongo url not exist!');
        }

        const mongo_url = config.get('mongo_url');

        Mongodb.createSchema();

        try {
            await connect(mongo_url);
            console.log('Db connected +++++++');
        } catch(e) {
            console.log('Db not connected >>>>>>')
            console.error(e.message);
            throw new Error(e.message);
        }


    }

    static createSchema() {

        for(let [name, schema] of Mongodb.collectionSchema.entries()) {
            
            Mongodb.collections.set(name, model(name, new Schema(schema)));
        }
    }
}


Mongodb.collectionSchema.set('user_auth',{
    userId: { type: String, default: uuidv4, unique: true },
    password: { type: String, required: true },
    privilege: { type: String, default: null},
    email: { type: String, required: true, unique: true },
});

Mongodb.collectionSchema.set('user_profile',{
    userId: { type: String, required: true, unique: true },
    photo : {
        data: { type: Buffer, default: Buffer.from('default image data', 'base64') },
        contentType: { type: String, default: 'image/png' }
    },
    name: { type: String, required: true },
    bio: { type: String, default: null },
    phone: { type: String, default: null },
    private_account: { type: Boolean, default: null }
});



