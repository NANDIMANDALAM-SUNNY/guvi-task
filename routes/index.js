var express = require('express');
var router = express.Router();

const {mongodb,dbName,dburl,mongoClient} = require('../dbConnection')

const client = new mongoClient(dburl,{ useUnifiedTopology: true}, { useNewUrlParser: true });


router.get('/mentors',async (req,res)=>{
  await client.connect();
  try{
    const db = await client.db(dbName);
    let requests  = await db.collection('mentors').find().toArray()
    res.send({
      statusCode:200,
      data:requests,
      message:"success"
    })
  }
  catch(err){
    console.log("Errr");
    res.send({
      statusCode:500,
      message:err
    })
  }
  finally{
   client.close() 
  }
})


router.get('/mentor/:id',async (req,res)=>{
  await client.connect();
  try{
    const db = await client.db(dbName);
    let requests  = await db.collection('mentors').findOne({_id:mongodb.ObjectId(req.params.id)})
    
    res.send({
      statusCode:200,
      data:requests,
      message:"success"
    })
  }
  catch(err){
    console.log("Errr");
    res.send({
      statusCode:500,
      message:err
    })
  }
  finally{
   client.close() 
  }
})

router.get('/checkmentor',async (req,res)=>{
  await client.connect();
  try{
    const db = await client.db(dbName);
    const requests  = await db.collection('mentors').find({students : {$exists:false}}).toArray()
    res.send({
      statusCode:200,
      data:requests,
      
    })
  }
  catch(err){
    console.log("Errr");
    res.send({
      statusCode:500,
      message:err
    })
  }
  finally{
   client.close() 
  }
})

router.post('/addmentors',async (req,res)=>{
  await client.connect();
  try{
    const db = await client.db(dbName);
    db.collection('mentors').createIndex( {"mentorName": 1 }, { unique: true } )
    const duplicate =await db.collection('mentors').find({mentorName:req.body.mentorName}).toArray()
    if(duplicate.length==0){
      let requests  = await db.collection('mentors').insertOne({
       mentorName:req.body.mentorName
       })
       res.send({
        statusCode:200,
        data:requests,
      message:"Success"
      })
   }
   else{
    res.send({
      statusCode:400,
      message:"user ALreadyExist"
    })
   }
   
  }
  catch(err){
    console.log("Errr");
    res.send({
      statusCode:500,
      message:err
    })
  }
  finally{
   client.close() 
  }
})



router.get('/students',async (req,res)=>{
  await client.connect();
  try{
    const db = await client.db(dbName);
    let requests  = await db.collection('students').find().toArray()
    res.send({
      statusCode:200,
      data:requests
    })
  }
  catch(err){
    console.log("Errr");
    res.send({
      statusCode:500,
      message:err
    })
  }
  finally{
   client.close() 
  }
})



router.post('/addstudents',async (req,res)=>{
  await client.connect();
  try{
    const db = await client.db(dbName);
    console.log(req.body)
    const checkStudents = await db.collection('mentors').find({students:req.body.name}).toArray()
    const checkMentor = await db.collection('mentors').find({mentorName:req.body.mentor}).toArray()
    console.log(checkMentor)
    console.log(checkStudents)
    if(checkStudents.length>0){
      res.send({
        statusCode:409,
        message:"Already the selected student has been assigned to a mentor"
      })
    }
    else{
      const Updatestudent = await db.collection('mentors').updateOne({mentorName:req.body.mentor},{$addToSet:{students:req.body.name}})
      const Addstudents  = await db.collection('students').insertOne({
                 name:req.body.name,
                 mentor:req.body.mentor
               })
               res.send({
               statusCode:200,
               message:"success",
               data:[Addstudents,Updatestudent]
              })
    }
  }
  catch(err){
    console.log("Errr");
    res.send({
      statusCode:500,
      message:"error"
    })
  }
  finally{
   client.close() 
  }
})




module.exports = router;
