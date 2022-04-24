const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose')
require('dotenv').config()
const port = process.env.PORT || 8000;
const itemRouter = require('./routes/item.route');
const userRouter = require('./routes/user.route');
const categoryRouter = require('./routes/category.route');
import {mailService} from "./routes/user.route"

const app = express();
app.use(cors());
// healthCheck
app.get("/healthCheck", async(req,res)=>{
    res.send({status: 'Success'})
})

// mongoDB collection
mongoose.connect(process.env.dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(data=>{
    console.log("Database connected")
}).catch(err=>{
    console.log(err.message)
    process.exit(1)
})

app.use(express.json());
app.set('view engine', 'ejs')
// router connection
app.use('/api/v1/item/', itemRouter);
app.use('/api/v2/users/', userRouter);
app.use('/api/v3/category/', categoryRouter);

// server connection
app.listen(port, ()=>{
    console.log(`http://127.0.0.1:${port}`)
});