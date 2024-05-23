const express = require('express')
const app = express()
app.use(express.json())
const path = require('path')
const dbpath = path.join(__dirname, 'todoApplication.db')
let db = null
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const initializeserver = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`dberror:${e.message}`)
    process.exit(1)
  }
}
initializeserver()
module.exports = app
//api1
const haspriorityandstatus = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}
const haspriority = requestQuery => {
  return requestQuery.priority !== undefined
}
const hasstatus = requestQuery => {
  return requestQuery.status !== undefined
}
app.get('/todos/', async (request, response) => {
  const {search_q = '', priority, status} = request.query
  let data = null
  let dataquery = ''
  switch (true) {
    case haspriorityandstatus(request.query):
      dataquery = `select * from todo where 
    todo like '%${search_q}%' and
    priority='${priority}' and
    status='${status}'`
      break
    case haspriority(request.query):
      dataquery = `select * from todo where
    todo like '%${search_q}%' and priority='${priority}'`
      break
    case hasstatus(request.query):
      dataquery = `select * from todo where
    todo like '%${search_q}%' and status='${status}'`
      break
    default:
      dataquery = `select * from todo where
    todo like '%${search_q}'`
      break
  }
  dbresponse = await db.all(dataquery)
  response.send(dbresponse)
})
//api2
app.get('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  const gettodoquery = `select * from todo where 
  id='${todoId}'`
  const dbresponse = await db.get(gettodoquery)
  response.send(dbresponse)
})
//api3
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const addtodoquery = `insert into todo
  (id,todo,priority,status)
  values(${id},'${todo}','${priority}','${status}')`
  const dbresponse = await db.run(addtodoquery)
  response.send('Todo Successfully Added')
})
//api4
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const requestBody = request.body
  let updatecolumn = ''
  switch (true) {
    case requestBody.status !== undefined:
      updatecolumn = 'Status'
      break
    case requestBody.priority !== undefined:
      updatecolumn = 'Priority'
      break
    case requestBody.todo !== undefined:
      updatecolumn = 'Todo'
      break
  }
  const previoustodoquery = `select * from todo where 
  id='${todoId}'`
  const previoustodoresponse = await db.get(previoustodoquery)
  const {
    todo = previoustodoresponse.todo,
    status = previoustodoresponse.status,
    priority = previoustodoresponse.priority,
  } = request.body
  const updatequery = `update todo set 
  todo='${todo}',
  status='${status}',
  priority='${priority}' where id=${todoId}`
  await db.run(updatequery)
  response.send(`${updatecolumn} Updated`)
})
//api5
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deletequery = `select * from todo
  where id=${todoId}`
  const dbresponse=await db.run(deletequery)
  response.send('Todo Deleted')
})
