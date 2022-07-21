const express  = require('express') 
const app = express() 
const port = process.env.PORT 

const pg = require('pg')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cors = require('cors')
// para ver o que vem do formulario do postman
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors())



const consStr =  process.env.DATABASE_URL
const pool = new pg.Pool({ connectionString: consStr })




app.listen(port, () => {
    console.log(`executando em http://localhost/${port}`)
})