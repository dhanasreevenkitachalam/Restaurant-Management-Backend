const express = require('express');
const bodyParser = require('body-parser');
const mongoose=require('mongoose');
const authenticate=require("../authenticate")
const Favorites =require('../models/favorites');


const cors = require('./cors');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json())

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next) => {
    Favorites.find({user:req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorite)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json')
        res.json(favorite)
    },(err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {

    Favorites.findOne({user:req.user._id})
    .then ((favorites)=>{
        if(favorites!=null){

          
                Favorites.findOneAndUpdate({user:req.user._id},{$addToSet:{dishes: req.body} },
                    {upsert:true,new:true},function(err, result) {
                    if (err) {
                      res.send(err);
                    } else {
                      
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(result);
                   
                }
           
            })
            
         
           
        }
        else{

            Favorites.create({user:req.user._id})
            .then((favorite)=>{
                favorite.dishes.push(req.body);
                favorite.save()
                .then((favorite)=>{
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(favorite)
                },(err) => next(err))
                .catch((err) => next(err));
            },(err) => next(err))
            .catch((err) => next(err));
        }
    })
 })

 .delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {

    Favorites.findOneAndRemove({user:req.user._id})
   .then((resp) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(resp);
}, (err) => next(err))
.catch((err) => next(err));    
 });

 favoriteRouter.route('/:dishId')
 .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

 .post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {

    Favorites.findOne({user:req.user._id})
    .then ((favorites)=>{
        if(favorites!=null){
            Favorites.findOneAndUpdate({user:req.user._id},{$addToSet:{dishes: req.params.dishId} },{upsert:true,new:true},function(err, result) {
                if (err) {
                  res.send(err);
                } else {
                  
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(result);
               
                
            }
       
        })
    }
        else{

            Favorites.create({user:req.user._id})
            .then((favorite)=>{
                favorite.dishes.push(req.params.dishId);
                favorite.save()
                .then((favorite)=>{
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(favorite)
                },(err) => next(err))
                .catch((err) => next(err));
            },(err) => next(err))
            .catch((err) => next(err));
        }
    },(err) => next(err))
    .catch((err) => next(err))
 })



 .delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
     

    Favorites.findOne({user:req.user._id})
    .then((favorite)=>{
        for(var i=favorite.dishes.length-1;i>=0;i--){
            console.log((favorite.dishes[i]._id))
       if(req.params.dishId.toString()===((favorite.dishes[i]._id.toString()))){
          favorite.dishes.splice(i,1);
       }
    }
                favorite.save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);                
                }, (err) => next(err))
                .catch((err)=>new(err));
            
           
        
    },(err) => next(err))
    .catch((err) => next(err))

 })
 module.exports=favoriteRouter;