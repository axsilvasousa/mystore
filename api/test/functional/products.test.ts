import { User } from '@src/models/user';
import { Product,IProduct } from "@src/models/product";
import AuthService from '@src/services/auth';

describe('Product functional tests', () => {
    const defaultUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
    };
    let token: string;
    beforeAll(async () => {
        await Product.deleteMany({})
        await User.deleteMany({})
        const user = await new User(defaultUser).save();
        token = AuthService.generateToken(user.toJSON());
    })
    describe('Criação de um novo produto', () => {
        it('deve retornar sucesso ao criar um produto passando um token válido', async () => {
            const newProduct:IProduct = {
                title:"Lorem ipsum is a placeholder text",
                description:"In publishing and graphic design, Lorem ipsum is a placeholder",
                status:"ATIVO",
                price:180.00
            } 
            const response = await global.testRequest.post('/products')
                .set({ 'x-access-token': token })
                .send(newProduct);
            expect(response.status).toBe(201);
        });
        it('Deve retorna erro caso não passe um token', async () => {
            const newProduct:IProduct = {
                title:"Lorem ipsum is a placeholder text",
                description:"In publishing and graphic design, Lorem ipsum is a placeholder",
                status:"ATIVO",
                price:180.00
            } 
            const response = await global.testRequest.post('/products')
                .set({ 'x-access-token': "TOKEN.INVALID" })
                .send(newProduct);

            expect(response.status).toBe(401);
        });
    })
    describe('Atualização de um novo produto', () => {
        it('deve retornar sucesso na atualização do produto', async () => {
            const newProduct:IProduct = {
                title:"Lorem ipsum is a placeholder text",
                description:"In publishing and graphic design, Lorem ipsum is a placeholder",
                status:"ATIVO",
                price:180.00
            }
            const title  = "product atualizado";
            const resNovoProduto = await global.testRequest.post('/products')
                .set({ 'x-access-token': token })
                .send(newProduct);
            const update = resNovoProduto.body;
            const response = await global.testRequest.put(`/products/${update.id}`)
                .set({ 'x-access-token': token })
                .send({...update,title});
            expect(response.status).toBe(200);
            expect(response.body.title).toBe(title);
        });

        it('deve retornar erro se passar um id de um produto invalido', async () => {
            const newProduct:IProduct = {
                title:"Lorem ipsum is a placeholder text",
                description:"In publishing and graphic design, Lorem ipsum is a placeholder",
                status:"ATIVO",
                price:180.00
            }
            const title  = "product atualizado";
            const resNovoProduto = await global.testRequest.post('/products')
                .set({ 'x-access-token': token })
                .send(newProduct);
            const update = resNovoProduto.body;
            const response = await global.testRequest.put('/products/0')
                .set({ 'x-access-token': token })
                .send({...update,title});
            expect(response.status).toBe(404);
        })

        it('deve retornar sucesso na mudança de status de um produto', async () => {
            const newProduct:IProduct = {
                title:"Lorem ipsum is a placeholder text",
                description:"In publishing and graphic design, Lorem ipsum is a placeholder",
                status:"ATIVO",
                price:180.00
            }
            const resNovoProduto = await global.testRequest.post('/products')
                .set({ 'x-access-token': token })
                .send(newProduct);

            const response = await global.testRequest.put(`/products/${resNovoProduto.body.id}`)
                .set({ 'x-access-token': token })
                .send({status:"INATIVO"});
            expect(response.status).toBe(200);
        })
    })
    describe('Apagar um produto', () => {
        it('deve retornar sucesso ao apagar um produto valido', async () => {
            const newProduct:IProduct = {
                title:"Lorem ipsum is a placeholder text",
                description:"In publishing and graphic design, Lorem ipsum is a placeholder",
                status:"ATIVO",
                price:180.00
            }
            
            await global.testRequest.post('/products')
                .set({ 'x-access-token': token })
                .send(newProduct);

            const resNovoProduto = await global.testRequest.post('/products')
                .set({ 'x-access-token': token })
                .send(newProduct);

            const update = resNovoProduto.body;
            const response = await global.testRequest.delete(`/products/${update.id}`)
                .set({ 'x-access-token': token });
            expect(response.status).toBe(200);
        });
    })
});
