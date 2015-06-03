package models

type Task struct {
	Id         int    `db:"id" json:"id"`
	TaskListId int    `db:"task_list_id" json:"taskListId"`
	Text       string `db:"text" json:"text" binding:"required"`
}

type TaskList struct {
	Id       int    `db:"id"  json:"id"`
	Ordering int    `db:"ordering" json:"ordering"`
	Name     string `db:"name" json:"name" binding:"required"`
	Tasks    []Task `db:"-" json:"tasks"`
}
