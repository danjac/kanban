
-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied

CREATE TABLE cards (
    id INT PRIMARY KEY,
    name TEXT NOT NULL 
);


CREATE TABLE tasks (
    id INT PRIMARY KEY,
    label TEXT NOT NULL,
    card_id INT NOT NULL,
    FOREIGN KEY(card_id) REFERENCES cards(id)
);


-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back

DROP TABLE tasks;
DROP TABLE cards;

