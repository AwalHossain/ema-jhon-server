const express = require('express')
const app = express()
const { MongoClient } = require('mongodb');
require('dotenv').config()
//port
const port = process.env.PORT || 5000
//middleware
const cors = require('cors')
app.use(cors())
//body parser
app.use(express.json())
// .env file

app.get('/', (req, res)=>{
    res.send('Server is running')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.33slg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
   try{
        await client.connect()
        const database = client.db('eCommerceDb')
        const dbCollection = database.collection('products')
        const orderCollection = database.collection('orderList')
        // const result = await dbCollection.insertOne(doc)
        //get api
        app.get('/products', async(req, res)=>{
            // console.log(req.query)
            const cursor =  dbCollection.find({})
            const count = await cursor.count();
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let result;
            if(page){
                result = await cursor.skip(page*size).limit(size).toArray()
            }
            else{
                result=await cursor.toArray()
            }
            res.send({count, result})
        })
        // user POST to get data by keys
        // app.post('/products/byKeys', async(req, res)=>{
        //     const keys = (req.body);
        //     //i am confused here
        //     const query  = {key: {$in: keys}}
        //     const users = await dbCollection.find(query).toArray();
        //     res.send(users)
        // })
        app.post('/products/byKeys', async (req, res) => {
            const keys = req.body;
            console.log(req.body);
            const query = { key: { $in: keys } }
            const products = await dbCollection.find(query).toArray();
            res.json(products);
            
        });
        //post api for order
        app.post('/orders', async(req, res)=>{
            const order= req.body;
            console.log('order', order);
            const result = await orderCollection.insertOne(order)
            res.json(result)
            
        })
   }
   finally{
    // await client.close()
   }
}
run().catch(console.dir)

app.listen(port, ()=>{
    console.log("server listening on", port);
})