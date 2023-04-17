const express = require("express")
const { BoardModel, TaskModel, subtaskModel } = require("../model/kanbanModel")

const KanbanRoutes = express.Router()

KanbanRoutes.get("/getall", async (req, res) => {
  try {
    let data = await BoardModel.find().populate(["tasks", { path: "tasks", populate: { path: 'subtask' } }])
    // let data = await BoardModel.find()
    res.status(200).send(data)
  } catch (err) {
    res.send({ "msg": "Something went wrong", "error": err })
  }
})

KanbanRoutes.get("/getboard", async (req, res) => {
  
  try {
    let data = await BoardModel.find({user:req.query}).populate(["tasks", { path: "tasks", populate: { path: 'subtask' } }])
    // let data = await BoardModel.find()
    res.status(200).send(data)
  } catch (err) {
    res.send({ "msg": "Something went wrong", "error": err })
  }
})

// ------------------------POST Routes---------------------------------------
KanbanRoutes.post("/addboard", async (req, res) => {
  // const {name}= req.body
  console.log(req.body);
  try {
    let data = await new BoardModel(req.body)
    await data.save()
    res.status(200).send({ "msg": "Board Added successfull", "data": data })
  } catch (err) {
    res.status(404).send({ "msg": "Something went wrong", "error": err })
  }
})

KanbanRoutes.post("/addtask/:boardid", async (req, res) => {
  let boardid = req.params.boardid;
  let body = req.body;

  try {
    let subtask = body.subtask;
    let subarr = [];
    for (let i = 0; i < subtask.length; i++) {
      let newSub_task = await new subtaskModel(subtask[i]);
      await newSub_task.save();
      subarr.push(newSub_task._id);
    }
    body = { ...body, subtask: subarr };
    let new_task = await new TaskModel(body);
    await new_task.save();
    // console.log("new_task", new_task);
    let data = await BoardModel.findById(boardid);
    let arr = [...data.tasks, new_task._id];
    let new_data = await BoardModel.findByIdAndUpdate(boardid, { tasks: arr })
    // console.log("arr", arr);
    // console.log("new_data", new_data);
    res.status(200).send({ msg: "Task Added successfully", data: new_data });
  } catch (err) {
    res.status(500).send({ msg: "Something went wrong", error: err });
  }
});

KanbanRoutes.post("/addsubtask/:taskid", async (req, res) => {
  let taskid = req.params.taskid;
  let body = req.body;

  try {
    let newSub_task = await new subtaskModel(body);
    await newSub_task.save();
    let data = await TaskModel.findById(taskid);
    let arr = [...data.subtask]
    arr.push(newSub_task._id)
    let new_task = await TaskModel.findByIdAndUpdate(taskid, {subtask:arr} );
    res.status(200).send({ msg: "SubTask Added successfully"});
  } catch (err) {
    res.status(500).send({ msg: "Something went wrong", error: err });
  }
});
// ---------------------------------------------------------------------------

// ------------------------PATCH Routes---------------------------------------
KanbanRoutes.patch("/updateboard/:boardid", async (req, res) => {
  let boardid = req.params.boardid
  let body = req.body;

  try {
    let updated = await BoardModel.findByIdAndUpdate(boardid, body);
    res.status(200).send({ msg: "Board Updated successfully"});
  } catch (err) {
    res.send({ msg: "Something went wrong", error: err });
  }
});
KanbanRoutes.patch("/updatetask/:taskid", async (req, res) => {
  let taskid = req.params.taskid
  let body = req.body;

  try {
    let updated = await TaskModel.findByIdAndUpdate(taskid, body);
    res.status(200).send({ msg: "Task Updated successfully"});
  } catch (err) {
    res.send({ msg: "Something went wrong", error: err });
  }
});
KanbanRoutes.patch("/updatesubtask/:subtaskid", async (req, res) => {
  let subtaskid = req.params.subtaskid
  let body = req.body;

  try {
    let updated = await subtaskModel.findByIdAndUpdate(subtaskid, body);
    res.status(200).send({ msg: "Sub-Task Updated successfully" });
  } catch (err) {
    res.send({ msg: "Something went wrong", error: err });
  }
});

// ---------------------------------------------------------------------------

// ------------------------DELETE Routes---------------------------------------
KanbanRoutes.delete("/deleteboard/:boardid", async (req, res) => {
  let boardid = req.params.boardid

  try {
    let board = await BoardModel.findById(boardid);
    let tasks = board.tasks
    console.log(tasks.length);
    if(tasks.length!=0){
      for(let i=0;i<tasks.length;i++){
        let removedFromBoard = await BoardModel.findByIdAndUpdate(boardid,{tasks:[]});
        if(tasks[i].subtask.length!=0){
          for(let j=0;j<tasks[i].subtask.length;j++){
            let removedFromTasks = await TaskModel.findByIdAndUpdate(taskid,{subtask:[]});
            let deletedSubTask = await subtaskModel.findByIdAndDelete(tasks[i].subtask[j]);
          }
        }
        let deletedTask = await TaskModel.findByIdAndDelete(tasks[i]);
      }
    }
    let deleted = await BoardModel.findByIdAndDelete(boardid);
    res.status(200).send({ msg: "Board deleted successfully" });
  } catch (err) {
    res.send({ msg: "Something went wrong", error: err });
  }
});
KanbanRoutes.delete("/deletetask/:boardid/:taskid", async (req, res) => {
  let taskid = req.params.taskid
  let boardid = req.params.boardid
  
  try {
    let maintask = await TaskModel.findById(taskid);
    let subtask = maintask.subtask
    if(subtask.length!=0){
      for(let j=0;j<subtask.length;j++){
        let removedFromTasks = await TaskModel.findByIdAndUpdate(taskid,{subtask:[]});
        let deletedSubTask = await subtaskModel.findByIdAndDelete(subtask[j]);
      }
    }
    let board = await BoardModel.findById(boardid);
    console.log(board);
    let newTasksArr = board.tasks.filter((el)=>{
      return el!=taskid
    })
    console.log(newTasksArr);
    let removedFromBoard = await BoardModel.findByIdAndUpdate(boardid,{tasks:newTasksArr});
    let deleted = await TaskModel.findByIdAndDelete(taskid);
    res.status(200).send({ msg: "Task Deleted successfully"});
  } catch (err) {
    res.send({ msg: "Something went wrong", error: err });
  }
});
KanbanRoutes.delete("/deletesubtask/:taskid/:subtaskid", async (req, res) => {
  let taskid = req.params.taskid
  let subtaskid = req.params.subtaskid
// console.log("taskid", taskid, "sub", subtaskid);
  try {
    let board = await TaskModel.findById(taskid);
    // console.log("board", board);
    let newSubTaskArr = board.subtask.filter((el)=>{
      return el!=subtaskid
    })
    console.log(newSubTaskArr);
    let removedFromTasks = await TaskModel.findByIdAndUpdate(taskid,{subtask:newSubTaskArr});
    let deleted = await subtaskModel.findByIdAndDelete(subtaskid);
    res.status(200).send({ msg: "Sub-Task Deleted successfully" });
  } catch (err) {
    res.send({ msg: "Something went wrong", error: err });
  }
});
// ---------------------------------------------------------------------------

module.exports = { KanbanRoutes }