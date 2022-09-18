const { User } = require('../models/user');
const express = require('express');
const bcrypt = require('bcryptjs')
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

router.get(`/`, async (req,res)=> {

    const userList = await User.find().select('-passwordHash');
    
    if(!userList){
        res.status(500).json({success:false})
    }

    res.send(userList)
})

router.get('/:id', async(req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');;

    if(!user){
        res.status(500).json({message: 'The user with the given ID was not found'})
    }
    res.status(200).send(user);

})

router.post(`/`, async (req,res)=> {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
       
    })

    user = await user.save();

    if(!user){
        return res.status(400).send('the user cannot be created!');
    }

    res.send(user);
})

router.put('/:id', async (req,res)=>{

    const userExist = await User.findById(req.params.id);
    let newPassword
    if(req.body.password){
        newPassword = bcrypt.hashSync(req.body.password, 10)
    } else {
        newPassword = user.Exist.passwordHash;
    }
    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
        name: req.body.name,
        email: req.body.email,
        passwordHash: newPassword,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        },
        {new: true}
    )

    if(!user)
    return res.status(404).send('the user cannot be created!');

    res.send(user);
})

router.post('/login', async(req, res) => {
    const user = await User.findOne({email: req.body.email})
    const secret = process.env.secret;
    if(!user) {
        return res.status(400).send('User not found');
    }

    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            {expiresIn: '1w'}

        )
        
        res.status(200).send({user: user.email, token: token})
    } else {
        res.status(400).send('password not valid');
    }
    
})

router.post('/register', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})





module.exports = router;