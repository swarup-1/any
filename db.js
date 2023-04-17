const mongoose  = require("mongoose");

require("dotenv").config();

const connection = mongoose.connect(`mongodb+srv://kanban1:kanban1@cluster0.jbhxvfw.mongodb.net/kanban?retryWrites=true&w=majority`);

module.exports = {connection}