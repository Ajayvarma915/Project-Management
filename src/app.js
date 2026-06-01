import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app=express()

//basic configurations
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:'16kb'}))
app.use(express.static("public"))

//cookie Parser
app.use(cookieParser())

//cors configurations
app.use(cors({
  origin:process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
  credentials:true,
  methods:["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders:["Authorization","Content-Type"]
}))
 
//import the routes
import healthcheckRouter from './routes/healthcheck.routes.js'
import authRouter from './routes/auth.routes.js'
import projectRouter from './routes/project.routes.js'
import taskRouter from './routes/task.routes.js'
import noteRouter from './routes/note.routes.js'

app.use('/api/v1/healthcheck',healthcheckRouter)
app.use('/api/v1/auth',authRouter)
app.use('/api/v1/projects',projectRouter);
app.use('/api/v1/tasks',taskRouter);
app.use('/api/v1/notes/',noteRouter);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/instagram',(req,res)=>{ 
    res.send("this is an instagram page");
})

export default app