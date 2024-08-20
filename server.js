const express = require('express')
const cors = require('cors')
const bodyparser = require('body-parser')
const db = require('./database/db')
const bcrypt = require('bcrypt')
const profileroute = require('./routes/profile')

const app = express()

app.use(cors())
app.use(bodyparser.json())
app.use(express.json())
app.use(bodyparser.urlencoded({ extended: true, limit: "50mb" })); // Parse URL-encoded bodies

app.use('/api',profileroute)

app.post('/api/signup', async(req,res)=>{
 try {
    const { name,username,password } = req.body;


const verifyemail = await db('user').select('*').where({ username:username  }).first();

if(verifyemail){
    return res.status(400).json({
        message:'this username is already used'
        
    })
}
const hasedpassword = await bcrypt.hash(password,10);
console.log(hasedpassword)

   await db('user').insert({
        name:name,
        username:username,
        password:hasedpassword
    });

return res.status(200).json({
    message:'user created successfully'
})

 } catch (error) {
    return res.status(400).json({
        message:error.message
    })
    
 }
});

app.post('/api/signin', async(req,res)=>{
    
    try {
        const { username,password} = req.body;
        const getuser = await db('user').select('*').where({username:username}).first();
       

        if(!getuser){
            return res.send({
                message:'user not found'
            })
        }
        const compare = await bcrypt.compare(password,getuser.password);

        if(!compare){
            return res.send({
                message:'invalid password'
            })
        }
      delete getuser.password;
        return res.send({
            message:'login successfully',
            user : getuser
        })
        
    } catch (error) {
        return res.send({
            message:error.message
        })
    }
})
     



db.raw('SELECT 1').then(()=>{
    console.log('mysql database is connected')
}).catch((err)=>{
    console.log(err)
})




app.listen(8001,()=>{
    console.log('Server is running on port http://localhost:8001')
})