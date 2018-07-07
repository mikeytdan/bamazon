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
    selectItem();
});

function selectItem() {
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
            console.log(`Selected "${product.product_name}" from the ${product.department_name} department`);
            console.log(`Price: ${product.price}`);
            console.log(`Quantity: ${product.stock_quantity}`);
            if (product.stock_quantity == 0) {
                console.log(`"${product.product_name}" is currently out of stock.`);
                connection.end();
                return
            }
            
            selectQuantityForProduct(product)
        });
    });
}

function selectQuantityForProduct(product) {
    inquirer.prompt([
        {
            name: "quantity",
            message: `How many ${product.product_name} do you want?`,
            validate: function (input) {
                if (isNaN(input)) {
                    return "Input must be a number"
                }

                var quantity = parseInt(input);
                if (quantity > product.stock_quantity) {
                    return "Insufficient quantity!"
                }

                return true;
            }
        }
    ]).then(function (response) {
        if (response.length == 0) {
            console.log("Canceled order!");
            connection.end();
            return
        }
        connection.query('UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ? AND stock_quantity >= ?', [response.quantity, product.item_id, response.quantity], function (error, results, fields) {
            if (error) throw error;
            console.log(`Purchase successful!`);
            console.log(`Your total was $${product.price * response.quantity}`);
            connection.end();
        });
    });
}
