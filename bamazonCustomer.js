//Dependencies
//-----------------------------------------
var mysql = require("mysql");
var inquirer = require("inquirer");
//-----------------------------------------

//Create mySql connection
//-----------------------------------------
var connection = mysql.createConnection({
    host: 'localhost',
    port: 8889,
    user: 'root',
    password: 'hking5484',
    database: 'bamazon_DB'
});
//-----------------------------------------

//Open mySql Connection 
//----------------------------------------------------------
connection.connect(function(err){
    if (err) throw err;
    console.log("Connected as ID: " + connection.threadId);
    run();
});
//----------------------------------------------------------

//Function to run the app
//--------------------------------------------------------------------
var run = function(){
    //Query All from products Table
    //--------------------------------------------------------------------
    connection.query('SELECT * FROM products WHERE inStock=1', function(err, res){
        if (err) throw err  
        //Fxn that Builds formatted product information for each item to display prior to prompt   
        //--------------------------------------------------------------------
        var choiceArr = function(val) {
            console.log("choiceArr");
            var choiceArr = [];
            for (var i = 0; i < res.length; i++) {
                var item = `ID: ${res[i].item_id} | Product: ${res[i].product_name} | Price: $${res[i].price}`
                choiceArr.push(item);
                //.product_name
            };
            return choiceArr;
        };
        //--------------------------------------------------------------------
        //Fxn that Displays the formatted information before prompt
        //--------------------------------------------------------------------
        var showProducts = function() {
            choiceArr = choiceArr();
            for (var i = 0; i <  choiceArr.length; i++) {
                console.log(choiceArr[i]);
            };
        };
        //--------------------------------------------------------------------
        showProducts();
        //User form to capture and return an answer object
        //--------------------------------------------------------------------
        inquirer.prompt([
            {
                name: "item_choice",
                type:"input",
                message: "Please input the ID of the product you want to purchase.",
            },
            {
                name: "itemqty",
                type: "input",
                message:"How many of those would you like to buy?"
        }]).then(function(answerObj){ 
            //logic for user input
            var userInput = {
                "item_id": answerObj.item_choice,
                "req_quantity": answerObj.itemqty
            };
            var submitInput = function(){
                connection.query("SELECT * FROM products WHERE item_id=" + answerObj.item_choice, function(err, res){
                    //array selector necessary
                    if(res[0].stock_quantity>=answerObj.itemqty){          
                        var inventoryCount = function (){
                            connection.query('SELECT * FROM products WHERE stock_quantity=0', function(err, res){
                                if (err) throw err;
                                for(var i=0; i < res.length; i++) {
                                    if(res[i].stock_quantity === 0){
                                        connection.query("UPDATE products WHERE stock_quantity=0 SET inStock=false");
                                    };
                                };
                            });
                            console.log("---------------------------------------");                                    
                        };
                        var updateQty = function(databaseStock) {
                            var adjustedStock = parseInt(databaseStock) - answerObj.itemqty;
                            connection.query("UPDATE products SET stock_quantity=" + adjustedStock + " WHERE item_id=" + answerObj.item_choice, function(err){
                                if (err) throw err;
                                console.log(`Stock Updated. ID: ${answerObj.item_choice}`)                                    
                                console.log("---------------------------------------");                                    
                            });
                            inventoryCount();
                            
                        }

                        updateQty(res[0].stock_quantity);
                    } else { 
                    console.log("Sorry. Only " + res[0].stock_quantity + " in stock.");
                    }  
                });
            };
            submitInput();
        }).then(function(){ 
            setTimeout(function(){
                console.log("Ending Connection");
                connection.end();
            }, 1000)
        });
        //--------------------------------------------------------------------
    });
    //--------------------------------------------------------------------
};
//--------------------------------------------------------------------


