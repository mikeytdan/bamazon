DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
  item_id INTEGER(11) NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(45) NOT NULL,
  department_name VARCHAR(45) NOT NULL,
  price INTEGER(11) NOT NULL,
  stock_quantity INTEGER(11) NOT NULL,
  PRIMARY KEY (item_id)
);


INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("TV", "Electronics", 249, 1), ("Computer", "Electronics", 129, 2), ("Batman Movie", "Movies", 5, 10), ("Lego Movie", "Movies", 5, 8), ("Advil", "Pharmacy", 8, 7), ("IbuProfen", "Pharmacy", 7, 8), ("Blue Thread", "Sewing", 2, 20), ("Red Thread", "Sewing", 2, 18), ("Shirt", "Clothing", 10, 30), ("Pants", "Clothing", 10, 30);