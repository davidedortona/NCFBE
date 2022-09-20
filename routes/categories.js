const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
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
router.get(`/`, async (req, res) =>{
    const categoryList = await Category.find();

    if(!categoryList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(categoryList);
})


router.get('/:id', async(req,res)=>{
    const category = await Category.findById(req.params.id);

    if(!category) {
        res.status(500).json({message: 'The category with the given ID was not found.'})
    } 
    res.status(200).send(category);
}) 

router.post(`/`, uploadOptions.single('image'), async (req, res) => {

    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    let category = new Category({
        name: req.body.name,
        description: req.body.description,
        image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"

    });

    category = await category.save();

    if (!category) return res.status(500).send('The category cannot be created');

    res.send(category);
});



router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Category Id');
    }
    

    const category = await Category.findById(req.params.id);
    if (!category) return res.status(400).send('Invalid Category!');

    const file = req.file;
    let imagepath;

    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        imagepath = category.image;
    }

    const updatedCategory= await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            image: imagepath,
        },
        { new: true }
    );

    if (!updatedCategory) return res.status(500).send('the category cannot be updated!');

    res.send(updatedCategory);
});


router.delete('/:id', async (req, res)=>{
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Category Id');
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(500).json({ success: false });
    }
    //image = category.image.replace('http://localhost:3000/','');
    image = category.image.replace('https://lime-spotless-eel.cyclic.app/','');
        
        console.log(image);
        fs.unlink(image, (err) => {
            if (err) {
              console.error(err)
              return
            }
            console.log('file removed');
            
            //file removed
          })
          
    Category.findByIdAndRemove(req.params.id).then(category =>{
        if(category) {
            return res.status(200).json({success: true, message: 'the category is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "category not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
});

router.get(`/get/count`, async (req, res) => {
    const categoriesCount = await Category.countDocuments((count) => count);

    if (!categoriesCount) {
        res.send({
            categoriesCount: 0
        });
    }
    res.send({
        categoriesCount: categoriesCount
    });
});

module.exports =router;