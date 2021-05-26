import { Response, Request } from 'express';
import { Product } from '@src/models/product';

export class ProductsController{
    constructor(){
        this.get = this.get.bind(this);
    }
    public async catalogo(req:Request,res:Response){
        let limit = 10;
        let page = 0;
        if (req.query && req.query.page) { 
            page = parseInt((req.query as any).page); 
        }
        let nexPage = page + limit as number || null;
        const filter = {
            status:"ATIVO"
        }
        const products = await Product
                                .find(filter)
                                .sort("price")
                                .limit(limit)
                                .skip(page);
        
        const countProduct = await Product.find(filter);
        if(nexPage != null && nexPage > countProduct.length){
            nexPage = null
        }
        res.status(200).json({items:products,next:nexPage});
    }

    public async get(req:Request,res:Response){
        let limit = 10;
        let page = 0;
        if (req.query && req.query.page) { 
            page = parseInt((req.query as any).page); 
        }
        let nexPage = page + limit as number || null;
        const filter = this.filterProduct(req.body);
        
        const products = await Product
                                .find(filter)
                                .sort("created")
                                .limit(limit)
                                .skip(page);
        
        const countProduct = await Product.find(filter);
        if(nexPage != null && nexPage > countProduct.length){
            nexPage = null
        }
        res.status(200).json({items:products,next:nexPage});
    }

    public async create(req:Request,res:Response){
        try {
            const data    = { ...req.body, ...{ user: req.decoded?.id } };
            const product = new Product({...data,created:new Date});
            const payload = await product.save();
            res.status(201).send(payload);
        } catch (error) {
            res.status(400).send({message:error.message});
        }
    }

    public async update(req:Request,res:Response){
        try {
            const update = {...req.body,updated:new Date}
            const filter = {_id:req.params.id};
            await Product.updateOne(filter, update);
            const product = await Product.findOne(filter);
            res.status(200).json(product)
        } catch (error) {
            res.status(404).send({message:error.message});
        }
    }

    public async status(req:Request,res:Response){
        try {
            const filter = {_id:req.params.id};
            await Product.updateOne(filter, {status:req.body.status});
            const product = await Product.findOne(filter);
            res.status(200).json({message:"success"});
        } catch (error) {
            res.status(404).send({message:error.message});
        }
    }

    public async delete(req:Request,res:Response){
        try {
            const filter = {_id:req.params.id};
            await Product.deleteOne(filter);
            res.status(200).json({message:"success"});
        } catch (error) {
            res.status(404).send({message:error.message});
        }
    }

    private filterProduct(body:any){
        const filter:any = {}
        if(body.title){
            filter.title =  { $regex : body.title, $options : 'i' }
        }
        
        if(body.priceMin){
            filter.price = {...filter.price,'$gte':body.priceMin}
        }
        
        if(body.priceMax){
            filter.price = {...filter.price,'$lte':body.priceMax}
        }
        if(body.status){
            filter.status = filter.status
        }
        return filter
    }
}