import { Schema, connect, model} from 'mongoose';
import config from 'config';
import { v4 as uuidv4 } from 'uuid';


export default class Mongodb {

    collections = new Map();
    static collectionSchema = new Map();

    static async setup() {

        if(!config.has('mongo_url')) {
            throw new Error('Mongo url not exist!');
        }

        const mongo_url = config.get('mongo_url');

        Mongodb.createSchema();

        connect(mongo_url,() => {
            console.log('MongoDb cluster connected')
        });
    }

    static createSchema() {

        for(let [name, schema] of Mongodb.collectionSchema.entries()) {

            this.collections.set(name, model(name, new Schema(schema)));
        }
    }
}


Mongodb.collections.set('user_password',{
    userId: { type: String, default: uuidv4, unique: true },
    password: { type: String, required: true },
});

Mongodb.collections.set('user_details',{
    photo : { data : Buffer, contentType : String },
    name: { type: String, required: true },
    bio: { type: String },
    phone: { type: String },
    email: { type: String, required: true, unique: true },
})



