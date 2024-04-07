import AuthenticateAPI from './auth.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export default class HTTP extends AuthenticateAPI {

    constructor(request, response) {
        super(request, response);
        this.request = request;
        this.response = response;
    }

    static async setup(app, router, express) {

        app.use(cors());
        app.use(bodyParser.json());
        app.use(express.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        await HTTP.prepareRouter(router);

        app.use('/api/v1',router);

        app.use((req, res,) => {
            res.status(404).send('Not Found');
        });
    }

    execption({message, status}) {
        console.error(message);
        this.response.status(status).json({ message: 'false', error: message});
    }

    static async prepareRouter(router) {

        let map = await HTTP.getRouterMap();

        for(let [path, endpoint] of map.entries()) {

            router.all(path,endpoint.validation,(req, res) => {
                HTTP.initialize(req, res, endpoint);
            });
        }
    }

    static async getRouterMap() {

        const filePaths = HTTP.getRouter();

        const endpoints = new Map();

        for(let filePath of filePaths) {

            const module = await import(filePath);

            for (const key of Object.keys(module)) {

                let endpoint = path.join('/',path.basename(filePath,'.js'), key.charAt(0).toLowerCase() + key.slice(1));

                endpoints.set(endpoint, module[key]);
            }
        }

        return endpoints;
    }

    static getRouter() {

        const __dirname = path.dirname(fileURLToPath(import.meta.url));

        const folderPath = path.join(__dirname,'..','www');

        const files = fs.readdirSync(folderPath);

        const filePaths = files.map(file => path.join('../www', file));

        return filePaths;
    }

    static async initialize(req, res, endpoint) {

        let route = new endpoint(req, res);

        route.uploadMulter();

        if(!route.authExecption) {
            let verify = await route.verifyToken();
            if(!verify) {
                return;
            }
        }

        if(!typeof route.execute === 'function') {
            route.execption({message: "execute function missing....", status: 500});
        }

        let paramter = {
            ...req.query,
            ...req.body
        }

        let result = await route.execute(paramter);

        if(!result) {
            return;
        }

        res.set('Content-Type', 'application/json');
        
        res.status(200).json({
            message: 'true',
            data: result
        });
    }

    uploadMulter() {

        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
              cb(null, 'uploads')
            },
            filename: function (req, file, cb) {
              cb(null, Date.now() + '-' +file.originalname )
            }
        })
          
        this.upload = multer({ storage: storage }).single('photo');
    }
}