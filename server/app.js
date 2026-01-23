const express = require('express');
require('dotenv').config();
const db = require('./db');
const userRouter = require('./routes/user')
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8888;

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use('/users', userRouter)

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode}`);
    next();
})

app.get('/', async (req, res) => {
    const users = await db.collection('users').get();
    res.json(users.docs.map(doc => doc.data()));
});

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`)
})