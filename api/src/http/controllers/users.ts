import { Response, Request } from 'express';
import { User } from '@src/models/user';
import AuthService from '@src/services/auth';

export class UsersController{
    public async create(req: Request, res: Response): Promise<void> {
        try {
            const user = new User(req.body);
            const newUser = await user.save();
            res.status(201).send(newUser);
        } catch (error) {
            res.status(400).send({code:400});
        }
    }

    public async authenticate(req: Request, res: Response): Promise<Response | undefined> {
        const { email, password } = req.body
        const user = await User.findOne({ email });
        if (!user) {
            return  res.status(401).send({
                code: 401,
                message: 'User not found!',
                description: 'Try verifying your email address.',
            });
        }
        if (!(await AuthService.comparePassword(password, user.password))) {
            return  res.status(401).send({
                code: 401,
                message: 'Password does not match!',
            });
        }
        const token = AuthService.generateToken(user.toJSON());
        return res.status(200).send({ token });
    }

    public async me(req: Request, res: Response): Promise<Response> {
        const email = req.decoded ? req.decoded.email : undefined;
        const user = await User.findOne({ email });
        if (!user) {
            return  res.status(404).send({
                code: 404,
                message: 'User not found!',
            });
        }

        return res.send({ user });
    }
}