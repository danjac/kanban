package models

/*
Task models a single task object
*/
type Task struct {
	ID         int    `db:"id" json:"id"`
	TaskListID int    `db:"task_list_id" json:"taskListId"`
	Text       string `db:"text" json:"text" binding:"required,max=60"`
}

/*
TaskList models a single task list
*/
type TaskList struct {
	ID       int    `db:"id"  json:"id"`
	Ordering int    `db:"ordering" json:"ordering"`
	Name     string `db:"name" json:"name" binding:"required,max=60"`
	Tasks    []Task `db:"-" json:"tasks"`
}
