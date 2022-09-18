const {Visitor} = require('../models/visitor');
const {UniqueVisitor} = require('../models/uniquevisitor');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

//counter = 0;
router.put('/setvisit', async (req, res) => {

    if (!mongoose.isValidObjectId('6315dce67cb743e3998a17d5')) {
        return res.status(400).send('Invalid Counter Id');
    }

    const visits = await Visitor.findByIdAndUpdate(
        '6315dce67cb743e3998a17d5',
        {
            $inc : { counter: 1}
        },
        { new: true }
    );

    if (!visits) return res.status(500).send('the visits cannot be updated!');

    res.send(visits);
});

router.get('/setcookie', (req, res) => {
    res.cookie(`uniqueVisitor`,`true`,{
        maxAge: 24*60*1000,
        // expires works the same as the maxAge
        //expires: new Date('01 12 2022'),
        secure: true,
        httpOnly: true,
        sameSite: 'lax'
    });
    res.send('Cookie have been saved successfully');
});

router.get('/getcookie', (req, res) => {
    //show the saved cookies
    console.log(req.cookies)
    res.send(req.cookies);
});

router.get('/deletecookie', (req, res) => {
    //show the saved cookies
    res.clearCookie()
    res.send('Cookie has been deleted successfully');
}); 

router.get('/settings/getVisitors', async (req, res) => {

    if (!mongoose.isValidObjectId('6315dce67cb743e3998a17d5')) {
        return res.status(400).send('Invalid Counter Id');
    }

    const visitsCount = await Visitor.findById('6315dce67cb743e3998a17d5').distinct('counter');

    //visitor = visitsCount.counter.toString();
    if (!visitsCount){
        visitsCount = 0;
        res.send(visitsCount);
    }

    res.send(visitsCount);

    
});


    


module.exports =router;