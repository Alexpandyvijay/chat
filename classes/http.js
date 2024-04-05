import AuthenticateAPI from './auth';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import Mongodb from './mongo.js'

export default class HTTP extends AuthenticateAPI {

    constructor(request, response) {
        super(request, response);
        this.request = request;
        this.response = response;
    }

    static async setup(app, router) {

        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use(express.json());
        app.use(cors());

        await prepareRouter(router);

        const mongo = new Mongodb();

        this.collections = mongo.collections;

        app.use('/api/v1/',router);

        app.use((req, res,) => {
            res.status(404).send('Not Found');
        });
    }

    static execption({message, status}) {
        console.error(message);
        this.response.status(status).json({ message: 'false', error: message});
    }

    async prepareRouter(router) {

        let map = await this.getRouterMap();

        for(let [path, endpoint] of map.entries()) {

            router.all(path, (req, res) => {
                this.initialize(req, res, endpoint);
            });
        }
    }

    async getRouterMap() {

        const filePaths = this.getRouter();

        const endpoints = new Map();

        for(let filePath of filePaths) {

            const module = await import(filePath);

            for (const key of Object.keys(module)) {

                let endpoint = path.join(path.basename(filePath,'.js'), key.charAt(0).toLowerCase() + key.slice(1));

                endpoints.set(endpoint, module[key]);
            }
        }

        return endpoints;
    }

    getRouter() {

        const folderPath = path.join(__dirname, 'WWW');

        const files = fs.readdirSync(folderPath);

        const filePaths = files.map(file => path.join('../www', file));

        return filePaths;
    }

    async initialize(req, res, endpoint) {

        let route = new endpoint(req, res);

       await this.verifyToken();

        if(!typeof route.prototype.execute === 'function') {
            HTTP.execption({message: "execute function missing....", status: 500});
        }

        let paramter = {
            ...req.query,
            ...req.body
        }

        let result = await route.execute(paramter);

        res.set('Content-Type', 'application/json');
        
        res.status(200).json({
            message: 'true',
            data: result
        });
    }
}