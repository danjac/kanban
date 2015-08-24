package db

import "gopkg.in/gorp.v1"

/*
DB handles all data layer functionality
*/
type DB struct {
	Cards CardDB
	Tasks TaskDB
}

/*
New creates a new db instance
*/
func New(dbMap *gorp.DbMap) *DB {

	return &DB{
		&defaultCardDB{dbMap},
		&defaultTaskDB{dbMap},
	}
}
