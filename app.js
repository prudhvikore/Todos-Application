const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
var format = require("date-fns/format");
const path = require("path");
var isValid = require("date-fns/isValid");

app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Database Error: ${e.message}`);
  }
};

initializeDbAndServer();

let validStatus;
let validPriority;
let validCategory;

const isStatusValid = (status) => {
  if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
    return true;
  } else {
    return false;
  }
};

const isPriorityValid = (priority) => {
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    return true;
  } else {
    return false;
  }
};

const isCategoryValid = (category) => {
  if (category === "WORK" || category === "HOME" || category === "LEARNING") {
    return true;
  } else {
    return false;
  }
};

const outPutResult = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    category: dbObject.category,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

app.get("/todos", async (req, res) => {
  const { search_q = "", priority, status, category } = req.query;
  let getQuery;
  if (status !== undefined) {
    validStatus = isStatusValid(status);
    if (validStatus === true) {
      getQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status='${status}';`;
      const todoList = await db.all(getQuery);
      res.send(todoList.map((i) => outPutResult(i)));
    } else {
      res.status(400);
      res.send("Invalid Todo Status");
    }
  } else if (priority !== undefined) {
    validPriority = isPriorityValid(priority);
    if (validPriority === true) {
      getQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority='${priority}';`;
      const todoList = await db.all(getQuery);
      res.send(todoList.map((i) => outPutResult(i)));
    } else {
      res.status(400);
      res.send("Invalid Todo Priority");
    }
  } else if (category !== undefined) {
    validCategory = isCategoryValid(category);
    if (validCategory === true) {
      getQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND category='${category}';`;
      const todoList = await db.all(getQuery);
      res.send(todoList.map((i) => outPutResult(i)));
    } else {
      res.status(400);
      res.send("Invalid Todo Category");
    }
  } else if (priority !== undefined && status !== undefined) {
    validPriority = isPriorityValid(priority);
    validStatus = isStatusValid(status);
    if (validStatus === true && validPriority === true) {
      getQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority='${priority}' AND status='${status}';`;
      const todoList = await db.all(getQuery);
      res.send(todoList.map((i) => outPutResult(i)));
    } else {
      if (validStatus === false) {
        res.status(400);
        res.send("Invalid Todo Status");
      } else if (validPriority === false) {
        res.status(400);
        res.send("Invalid Todo Priority");
      }
    }
  } else if (category !== undefined && status !== undefined) {
    validStatus = isStatusValid(status);
    validCategory = isCategoryValid(category);
    if (validCategory === true && validStatus === true) {
      getQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND category='${category}' AND status='${status}';`;
      const todoList = await db.all(getQuery);
      res.send(todoList.map((i) => outPutResult(i)));
    } else {
      if (validStatus === false) {
        res.status(400);
        res.send("Invalid Todo Status");
      } else {
        res.status(400);
        res.send("Invalid Todo Category");
      }
    }
  } else if (priority !== undefined && category !== undefined) {
    validCategory = isCategoryValid(category);
    validPriority = isPriorityValid(priority);
    if (validPriority === true && validCategory === true) {
      getQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority='${priority}' AND category='${category}';`;
      const todoList = await db.all(getQuery);
      res.send(todoList.map((i) => outPutResult(i)));
    } else {
      if (validCategory === false) {
        res.status(400);
        res.send("Invalid Todo Category");
      } else if (validPriority === false) {
        res.status(400);
        res.send("Invalid Todo Priority");
      }
    }
  } else {
    getQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
    const todoList = await db.all(getQuery);
    res.send(todoList.map((i) => outPutResult(i)));
  }
});

app.get("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const getTodoQuery = `SELECT * FROM todo WHERE id=${todoId};`;
  const todo = await db.get(getTodoQuery);
  res.send(outPutResult(todo));
});

app.get("/agenda/", async (req, res) => {
  const { date } = req.query;
  if (isValid(new Date(date)) === true) {
    const formattedDate = format(new Date(date), "yyyy-MM-dd");
    const getQuery = `SELECT * FROM todo WHERE due_date='${formattedDate}';`;
    const result = await db.all(getQuery);
    res.send(result.map((i) => outPutResult(i)));
  } else {
    res.status(400);
    res.send("Invalid Due Date");
  }
});

app.post("/todos/", async (req, res) => {
  const { id, todo, priority, status, category, dueDate } = req.body;
  validStatus = isStatusValid(status);
  validPriority = isPriorityValid(priority);
  validCategory = isCategoryValid(category);
  if (
    isValid(new Date(dueDate)) === true &&
    validStatus === true &&
    validPriority === true &&
    validCategory === true
  ) {
    const date = format(new Date(dueDate), "yyyy-MM-dd");
    const postQuery = `INSERT INTO todo (id,todo,priority,status,category,due_date)
    VALUES (${id},'${todo}','${priority}','${status}','${category}','${date}');`;
    await db.run(postQuery);
    res.send("Todo Successfully Added");
  } else if (validStatus === false) {
    res.status(400);
    res.send("Invalid Todo Status");
  } else if (validPriority === false) {
    res.status(400);
    res.send("Invalid Todo Priority");
  } else if (validCategory === false) {
    res.status(400);
    res.send("Invalid Todo Category");
  } else {
    res.status(400);
    res.send("Invalid Due Date");
  }
});

app.put("/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;
  const { priority, status, category, todo, dueDate } = req.body;
  let updateQuery;
  if (priority !== undefined) {
    validPriority = isPriorityValid(priority);
    if (validPriority === true) {
      updateQuery = `UPDATE todo SET priority='${priority}' WHERE id=${todoId};`;
      await db.run(updateQuery);
      res.send("Priority Updated");
    } else {
      res.status(400);
      res.send("Invalid Todo Priority");
    }
  } else if (status !== undefined) {
    validStatus = isStatusValid(status);
    if (validStatus === true) {
      updateQuery = `UPDATE todo SET status='${status}' WHERE id=${todoId};`;
      await db.run(updateQuery);
      res.send("Status Updated");
    } else {
      res.status(400);
      res.send("Invalid Todo Status");
    }
  } else if (category !== undefined) {
    validCategory = isCategoryValid(category);
    if (validCategory === true) {
      updateQuery = `UPDATE todo SET category='${category}' WHERE id=${todoId};`;
      await db.run(updateQuery);
      res.send("Category Updated");
    } else {
      res.status(400);
      res.send("Invalid Todo Category");
    }
  } else if (dueDate !== undefined) {
    if (isValid(new Date(dueDate)) === true) {
      const formattedDate = format(new Date(dueDate), "yyyy-MM-dd");
      updateQuery = `UPDATE todo SET due_date='${dueDate}';`;
      await db.run(updateQuery);
      res.send("Due Date Updated");
    } else {
      res.status(400);
      res.send("Invalid Due Date");
    }
  } else if (todo !== undefined) {
    updateQuery = `UPDATE todo SET todo='${todo}' WHERE id=${todoId};`;
    await db.run(updateQuery);
    res.send("Todo Updated");
  }
});

app.delete("/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;
  const delQuery = `DELETE FROM todo WHERE id=${todoId};`;
  await db.run(delQuery);
  res.send("Todo Deleted");
});

module.exports = app;
