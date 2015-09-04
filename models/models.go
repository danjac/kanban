package models

/*
Task models a single task object
*/
type Task struct {
	ID     int64  `db:"id" json:"id,string"`
	CardID int64  `db:"card_id" json:"-"`
	Text   string `db:"label" json:"text" binding:"required,max=60"`
}

/*
TaskList models a single task list
*/
type Card struct {
	ID       int64  `db:"id"  json:"id,string"`
	Ordering int64  `db:"ordering" json:"ordering"`
	Name     string `db:"name" json:"name" binding:"required,max=60"`
	Tasks    []Task `db:"-" json:"tasks"`
}
