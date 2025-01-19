const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Account = require('../models/Account');
const { JWT_SECRET } = require('../config');


router.post('/', async (req, res)=>{
    try{
        const { username, password } = req.body;

        if(!username || !password){
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const account = await Account.findOne({
            username: username, 
            password: password,
        });

        if(!account){
            return res.status(401).json({message:'Invalid Credentials'});
        }

        const token = jwt.sign(
            {
                userId: account._id,
                username: account.username,
                role: account.role
            },
            JWT_SECRET,
            {expiresIn:'1h'}
        );

        const userResponse = {
            username : account.username,
            role: account.role
        }

        res.status(200).json({
            message: 'Login successful',
            debugUser: account, //Has to be removed is here for debug purpose
            user: userResponse,
            token: token
        });
    } catch (error){
        res.status(500).json({message: error.message});}
});

module.exports = router;