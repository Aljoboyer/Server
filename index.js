const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

//MiddleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.obwta.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();

        const database = client.db('ProgrammingSchoolDB');
        const ServicesCollection = database.collection('ServicesCollection')
        const UpcomingCourseCollection = database.collection('UpcomingCourseCollection')
        const ConfirmCourseCollection = database.collection('ConfirmCourseCollection')

        //GET api (getting all data from data base)
        app.get('/services', async(req, res) => {
            const cursor = ServicesCollection.find({})
            const page = req.query.page;
            const size = parseInt(req.query.size);
            const count = await cursor.count();
            let services;
            if(page)
            {
                services = await cursor.skip(page * size).limit(size).toArray();
            }
            else{
                services = await cursor.toArray();
            }
            res.send({
                services,
                count
            });
        })
        app.get('/upcomingservices', async(req, res) => {
            const cursor = UpcomingCourseCollection.find({})
            const services = await cursor.toArray();
            res.send(services);
        })
        //get course by id
        app.get('/services/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await ServicesCollection.findOne(query);
            res.send(result)
        })
        //POST api (adding course )
        app.post('/services', async(req, res) => {
            const course = req.body;
            const result = await ServicesCollection.insertOne(course);
            res.json(result);
        })
        //POST api (adding user confirm data )
        app.post('/confirm', async(req, res) => {
            const course = req.body;
            const result = await ConfirmCourseCollection.insertOne(course);
            res.json(result);
        })
        //  get course by id
         app.get('/confirm', async(req, res) => {
            const cursor = ConfirmCourseCollection.find({})
            const result = await cursor.toArray();
            res.send(result)
        })
        //for confirm course
        app.post('/confirm/byemail', async(req, res) => {
            const email = req.body;
            const query = {email: {$in: email}};
            const result = await ConfirmCourseCollection.find(query).toArray();
            res.send(result)
        })
        //delete operation
        app.delete('/confirm/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await ConfirmCourseCollection.deleteOne(query);
            res.json(result)
        })
    }

    finally{

    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Programming School Server is connected')
});

app.listen(port, (req, res) => {
    console.log('Server Port Is', port)
})