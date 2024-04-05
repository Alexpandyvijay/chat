import { createServer } from 'http';
import express from 'express';
import config from 'config';
import Mongodb from './mongo.js';
import HTTP from './http.js';

class API {

    static async setup() {

        const
            app = express(),
            server = createServer(app),
            router = express.Router(),
            port = config.get('port');

        await Mongodb.setup();

        await HTTP.setup(app, router);
        
        server.listen(port,() => {
            console.log(`Server successfully running in port ${port}..`);
        });
    }

    
}