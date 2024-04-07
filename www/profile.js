import HTTP from '../classes/http.js';
import fs from 'fs';
import path from 'path';

export class Get extends HTTP {

    static validation = [];

   async execute({}) {

        const 
            UserAuth = this.collections.get('user_auth'),
            UserProfile = this.collections.get('user_profile');

        let {userId, email, privilege} = await UserAuth.findOne({userId: this.user.userId},{password: 0});
        let {photo, name, bio, phone, private_account} = await UserProfile.findOne({userId: this.user.userId});
        return {
            account_id : email,
            userId: userId,
            photo, photo,
            name, name,
            bio, bio,
            phone, phone,
            privilege, privilege,
            private_account, private_account
        };
    }
}

export class Update extends HTTP {

    static validation = [];

    async execute({name, bio, phone, private_account, account_id}) {

        const UserProfile = this.collections.get('user_profile');

        let data = {};

        if(this.request.file) {
            this.upload(this.request,this.response, (err) => {

                if(err) {
                    throw new Error(err);
                }

                data.image = {
                    data : fs.readFileSync(path.join(process.cwd(),'..',"/uploads/",this.request.file.filename)),
                    contentType : "image/png"
                };

                const __dirname = path.dirname(fileURLToPath(import.meta.url));

                const folderPath = path.join(__dirname,'..','uploads');

                fs.readdir(folderPath, (err, files) => {
                    if (err) {
                        throw new Error(err);
                    }
                
                    files.forEach((file) => {
                      fs.unlinkSync('uploads/' + file);
                    });
                });
            });
        }

        if(name?.trim()) {
            data.name = name
        }

        if(bio?.trim()) {
            data.bio = bio;
        }

        if(phone?.trim()) {
            data.phone = phone;
        }

        if(private_account?.trim()) {
            data.private_account = private_account;
        }

        if(account_id?.trim()) {
            data.email = account_id;
        }

        try {

            let res = await UserProfile.findOneAndUpdate({userId: this.user.userId},data,{ new: true });
            return res;

        } catch(e) {
            this.execption({message: e.message, status: 500});
            return false;
        }
    }
}

export class List extends HTTP {

    static validation = [];

    async execute({}) {

        let res;

        if(this.user.privilege == 'admin') {
            res = await this.collections.get('user_profile').find({});
        } else {
            res = await this.collections.get('user_profile').find({private_account: false});
        }

        return res;
    }
}