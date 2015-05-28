package models

type Task struct {
	Id         int64  `db:"id" json:"id"`
	TaskListId int64  `db:"task_list_id" json:"-"`
	Text       string `db:"text" json:"text" required:true`
}

type TaskList struct {
	Id    int64  `db:"id"  json:"id"`
	Name  string `db:"name" json:"name" required:true`
	Tasks []Task `db:"-" json:"tasks"`
}
