const mongoose = require("mongoose")
const boardSchema = mongoose.Schema(
    {
        name: String,
        tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
        user:String
    }, {
    versionKey: false
}
)

const taskSchema = mongoose.Schema(
    {
        title: String,
        description: String,
        status: { type: String, enum: ['Todo', 'Doing', 'Done'], default: 'Todo' },
        subtask: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subtask' }]
    }, {
    versionKey: false
}
)

const subtaskSchema = mongoose.Schema(
    {
        title: String,
        isCompleted: Boolean
    }, {
    versionKey: false
}
)

const BoardModel = mongoose.model("Board", boardSchema)
const TaskModel = mongoose.model("Task", taskSchema)
const subtaskModel = mongoose.model("Subtask", subtaskSchema)

module.exports = { BoardModel, TaskModel, subtaskModel }
