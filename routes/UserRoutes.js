const {UserModel} = require("../model/UserModel");
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");

const userRouter = express.Router();


userRouter.post("/signup",async(req,res) => {
    const {email,password} = req.body;
    try{
        bcrypt.hash(password, 5, async(err,hash) => {
            if(err) res.send({"Message":"Something Went Wrong","Error":err.message});
            else{
                const user = new UserModel({email,password:hash});
                await user.save();
                res.send({"Message":"Registerd Sucessfully"});
            }
        })
    }
    catch(err){
        res.send({"Message":"Something Went Wrong","Error":err.message})
    }
})

userRouter.get("/user",async(req,res) => {
    try{
        let data = await UserModel.find();
        res.send({User:data})
    }
    catch(e){
        res.send({Message:e.message})
    }
})

userRouter.post("/signin",async(req,res) => {
    const {email,password} = req.body;
    try{
        const user=await UserModel.find({email});
        if(user.length > 0){
            bcrypt.compare(password, user[0].password, function(err, result) {
             if(result){
             const token = jwt.sign({ userID:user[0]._id}, 'masai');

            res.send({Message:"Login Successfull","token":token})
            } else {res.send({Message : "Wrong Credntials"})}
            });
        }
        else{
            res.send({"Message":"Wrong Credential"})
        }

    }
    catch(err){
        res.send({"Message":"Something Went Wrong","Error":err.message});
    }

})

module.exports = {
    userRouter
}