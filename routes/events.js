const { Event } = require('../models/event');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage });

router.get(`/get/count`, async (req, res) => {
    const eventsCount = await Event.countDocuments((count) => count);

    if (!eventsCount) {
    
        res.send({
            eventsCount: 0
        })
    }
    res.send({
        eventsCount: eventsCount
    });
});

router.get(`/allEvents`, async (req, res) => {
   

    
    const eventList = await Event.find().populate('category');

    if (!eventList) {
        res.status(500).json({ success: false });
    }
    res.send(eventList);
});
router.get(`/`, async (req, res) => {
    let filter = {};
    if (req.query.category) {
        filter = req.query.category;
        console.log("filtro eventi: " + filter);
    }

    
    const eventList = await Event.find({category: { $in : filter}}).populate('category');

    if (!eventList) {
        res.status(500).json({ success: false });
    }
    res.send(eventList);
});

router.get(`/:id`, async (req, res) => {
    const event = await Event.findById(req.params.id).populate('category');

    if (!event) {
        res.status(500).json({ success: false });
    }
    res.send(event);
});

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    let event = new Event({
        name: req.body.name,
        description: req.body.description,
        image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
        category: req.body.category,
    });

    event = await event.save();

    if (!event) return res.status(500).send('The Event cannot be created');

    res.send(event);
});

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Event Id');
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(400).send('Invalid Event!');
   
    const file = req.file;
    let imagepath;

    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        imagepath = event.image;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            image: imagepath,
            category: req.body.category,
        },
        { new: true }
    );

    if (!updatedEvent) return res.status(500).send('the event cannot be updated!');

    res.send(updatedEvent);
});




router.post('/gallery-images/:id', uploadOptions.array('images', 100), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Event Id');
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (files) {
        files.map((file) => {
            imagesPaths.push(`${basePath}${file.filename}`);
        });
    }

    const event = await Event.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        { new: true }
    );

    if (!event) return res.status(500).send('the gallery cannot be updated!');

    res.send(event);
});

router.put('/gallery-images/:id', uploadOptions.array('images', 100), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Event Id');
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    
    if (files) {

       
            files.map((file) => {
                imagesPaths.push(`${basePath}${file.filename}`);
            });
       
       
    }

    const event = await Event.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        { new: true }
    );

    if (!event) return res.status(500).send('the gallery cannot be updated!');

    res.send(event);
});



router.delete('/:id', async(req,res) =>{
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Event Id');
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(500).json({ success: false });
    }
    //immagine = event.image.replace('http://localhost:3000/','');
    immagine = event.image.replace('https://ncfbackend.herokuapp.com/','');
   
    fs.unlink(immagine, (err) => {
        if (err) {
          console.error(err)
          return
        }
        console.log('file removed');
        
        //file removed
      })
    images = event.images;
    for(let i=0; i< images.length; i++){
        //var image = images[i].replace('http://localhost:3000/','');
        var image = images[i].replace('https://ncfbackend.herokuapp.com/','');
        
        console.log(image);
        fs.unlink(image, (err) => {
            if (err) {
              console.error(err)
              return
            }
            console.log('file removed');
            
            //file removed
          })


    }

    Event.findByIdAndRemove(req.params.id)
        .then((event) =>{
            if(event){
                return res.status(200).json({
                    success:true,
                    message: 'the event has been deleted'
                });

            } else {
                return res.status(404).json({ success: false, message: 'event not found!' });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
    

})
module.exports = router;
