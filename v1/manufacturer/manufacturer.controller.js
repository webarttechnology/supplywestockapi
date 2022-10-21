const manufacturerModel = require("./manufacturer.service");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const createManufacturer = async (req, res) => {
    const body = req.body; 
    try{        
        if(body.image){
            let filePath = '../../images';
            var imagename = Date.now()+'.png';
            const imagepath = filePath+'/'+Date.now()+'.png';      
            let buffer = Buffer.from(body.image.split(',')[1], 'base64');
            fs.writeFileSync(path.join(__dirname, imagepath), buffer);
            body.image = 'images/'+imagename;
        } 

        const manufacturer = new manufacturerModel({
            name: body.name,
            image: body.image
        })
        const result = await manufacturer.save();
        if(result){
            return res.status(200).json({
                success: 1,
                data: result
            })
        }else{
            return res.status(400).json({
                success: 0,
                msg: "Insert error! Try again."
            })
        }

    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}




const getManufacturer = async (req, res) => {
    try{
        const manufacturer = await manufacturerModel.find({}, {"name": 1, "image": 1, "_id": 1})

        const manuArray = [];
        manufacturer.map((mvalue, index)=>{
            manuArray.push({value: mvalue.name, label: mvalue.name, image: mvalue.image, id: mvalue._id})
        })      

        return res.status(200).json({
            success: 1,
            data: manuArray
        })
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const getManufacturerById = async (req, res) => {
    try{
        const manufacturer = await manufacturerModel.findOne({_id:mongoose.Types.ObjectId(req.params.id)}, {name: 1, image: 1})
        return res.status(200).json({
            success: 1,
            data: manufacturer
        })
    }catch(e){
        return res.status(400).json({
            success: 1,
            msg: e
        })
    }
}

const updateManufacturer = async (req, res) => {
    const body = req.body;
    try{
        var updateObj = "";
        if(body.image){
            let filePath = '../../images';
            var imagename = Date.now()+'.png';
            const imagepath = filePath+'/'+Date.now()+'.png';      
            let buffer = Buffer.from(body.image.split(',')[1], 'base64');
            fs.writeFileSync(path.join(__dirname, imagepath), buffer);
            body.image = 'images/'+imagename;
            updateObj = {name: body.name, image: body.image};
        }else{
            updateObj = {name: body.name};
        }

        const manufacturer = await manufacturerModel.findOneAndUpdate({_id:mongoose.Types.ObjectId(body.id)}, updateObj)

        if(manufacturer){
            return res.status(200).json({
                success: 1,
                data: "Update successfull"
            })
        }else{
            return res.status(400).json({
                success: 0,
                data: "Update eroor. Try again"
            })
        }
       
    }catch(e){
        return res.status(400).json({
            success: 1,
            msg: e
        })
    }
}

const deleteManufacturer = async (req, res) => {
    try{
        const manufacturer = await manufacturerModel.findOneAndDelete({_id:mongoose.Types.ObjectId(req.params.id)})
        return res.status(200).json({
            success: 1,
            data: "Record has been deleted successfully."
        })
    }catch(e){
        return res.status(400).json({
            success: 1,
            msg: e
        })
    }
}

const getcountData = async (req, res) => {
    try{
        const countManufacturer = await manufacturerModel.find({}).count();
        return res.status(200).json({
            success: 1,
            data: countManufacturer
        })
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const searchManufacturer = async (req, res) => {
    
    try{
        const manufacturer = await manufacturerModel.find({ 'name' : {'$regex': '^'+req.params.key, '$options': 'i'}})
       

	 const manuArray = [];
        manufacturer.map((mvalue, index)=>{
            manuArray.push({value: mvalue.name, label: mvalue.name, image: mvalue.image, id: mvalue._id})
        }) 
        return res.status(200).json({
            success: 1,
            data: manuArray
        });

    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

module.exports = {
    createManufacturer: createManufacturer,
    getManufacturer: getManufacturer,
    getManufacturerById: getManufacturerById,
    updateManufacturer: updateManufacturer,
    deleteManufacturer: deleteManufacturer,
    getcountData: getcountData,
    searchManufacturer: searchManufacturer
}
