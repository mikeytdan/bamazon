var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3307,
    user: "root",
    password: "root",
    database: "bamazon"
});

console.log("Connection to Bamazon...")
connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected as id " + connection.threadId + "\n");
    showMenu();
});

function showMenu() {
    inquirer.prompt([
        {
            name: "option",
            type: "list",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
            message: "Menu Options"
        }
    ]).then(function (response) {
        switch (response.option) {
            case "View Products for Sale":
                viewProductsForSale();
                break;
            case "View Low Inventory":
                viewLowInventory()
                break;
            case "Add to Inventory":
                selectExistingProductToAdd()
                break;
            case "Add New Product":
                addNewProduct();
                break;
        }
    });
}

function viewProductsForSale() {
    console.log("Fetching products...");
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.log("-------------------------------------");
        for (item of res) {
            console.log(`Item #${item.item_id}: ${item.product_name} ($${item.price}) `);
            console.log(`    - Department: ${item.department_name}`);
            console.log(`    - Quantity: ${item.stock_quantity}`);
        }
        console.log("-------------------------------------");
        connection.end();
    });
}

function viewLowInventory() {
    console.log("Fetching products that are running low...");
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (err, res) {
        if (err) throw err;
        console.log("--------------------------------------");
        for (item of res) {
            console.log(`Item #${item.item_id}: ${item.product_name} `);
            console.log(`    - Quantity: ${item.stock_quantity}`);
        }
        console.log("-------------------------------------");
        connection.end();
    });
}

function selectExistingProductToAdd() {
    inquirer.prompt([
        {
            name: "itemID",
            message: "Enter product ID",
            validate: function (input) {
                if (isNaN(input)) {
                    return "Input must be a number"
                }

                return true;
            }
        }
    ]).then(function (response) {
        connection.query("SELECT * FROM products WHERE ?", [{
            item_id: parseInt(response.itemID)
        }], function (err, res) {
            if (err) throw err;
            if (res.length == 0) {
                throw "Couldn't find a product with the given ID";
            }

            var product = res[0];
            console.log(`Selected: ${product.product_name}`);
            console.log(`Quantity: ${product.stock_quantity}`);
            selectQuantityForAddingProduct(product)
        });
    });
}

function selectQuantityForAddingProduct(product) {
    inquirer.prompt([
        {
            name: "quantity",
            message: `How many "${product.product_name}" would you like to add?`,
            validate: function (input) {
                if (isNaN(input)) {
                    return "Input must be a number"
                }

                var quantity = parseInt(input);
                if (quantity < 0) {
                    return "Quantity must be a positive number!"
                }

                return true;
            }
        }
    ]).then(function (response) {
        if (response.length == 0) {
            console.log("Canceled operation!");
            connection.end();
            return
        }

        var quantity = parseInt(response.quantity);
        connection.query('UPDATE products SET stock_quantity = stock_quantity + ? WHERE item_id = ?', [quantity, product.item_id], function (err, results, fields) {
            if (err) throw err;
            console.log(`Added ${quantity} "${product.product_name}" successfully!`);
            console.log(`Updated quantity: ${product.stock_quantity + quantity}`)
            connection.end();
        });
    });
}

function addNewProduct() {
    inquirer.prompt([
        {
            name: "name",
            message: "Enter product name"
        }, {
            name: "department",
            message: "Enter department name"
        }, {
            name: "price",
            message: "Enter price",
            validate: function (input) {
                if (isNaN(input)) {
                    return "Input must be a number"
                }

                if (parseInt(input) < 0) {
                    return "Must be a positive number";
                }

                return true;
            }
        }, {
            name: "stock",
            message: "Enter initial stock",
            validate: function (input) {
                if (isNaN(input)) {
                    return "Input must be a number"
                }

                if (parseInt(input) < 0) {
                    return "Must be a positive number";
                }

                return true;
            }
        }
    ]).then(function (response) {
        console.log("Inserting product...");
        var query = connection.query("INSERT INTO products SET ?", {
            product_name: response.name,
            department_name: response.department,
            price: parseInt(response.stock),
            stock_quantity: parseInt(response.stock)
        }, function (err, res) {
            if (err) throw err;
            console.log("Added product successfully!");
            connection.end();
        });
    });
}
