var mysql = require("mysql");
var inquirer = require("inquirer");

var user = "";
var inqChoice = "";
var bid = "";
var item = "";
var currItems = [];
var userItem;
var userBid;
var userBidder;

var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "greatbayDB"
});

startConnection();


function initialPrompt() {
    inquirer.prompt([{
        type: "choices",
        message: "select a path",
        choices: ["POST ITEM","BID ON ITEM"],
        name: "pathChoice"
    }]).then(function(response) {
        inqChoice = response.pathChoice;

        if (inqChoice === "POST ITEM") {
            postItem();
        }

        if (inqChoice === "BID ON ITEM") {
            bidItem();
        }

    });
};

function startConnection() {
        connection.connect(function(err) {
            if (err) throw err;
            console.log("connected as id " + connection.threadId);
            // createSong();
            initialPrompt();
        });
    };

function postItem() {
    inquirer.prompt([{
        type: "input",
        message: "your item",
        name: "inqItem"
    }]).then(function(r) {


        item = r.inqItem;


        console.log(user, item, bid);
        createItem();
    })
};


function bidItem() {
    itemsList();

    inquirer.prompt([{
        type: "choices",
        message: "pick a item",
        choices: currItems,
        name: "userChoice"
    }]).then(function(r) {
        userItem = r.userChoice;

        inquirer.prompt([{
                type: "input",
                message: "your name",
                name: "newBidder"
            },
            {
                type: "input",
                message: "your bid",
                name: "newBid"
            }
        ]).then(function(r) {
            userBid = r.newBid
            userBidder = r.newBidder

            connection.query("SELECT * FROM bids WHERE ?", {
                    item: userItem
                },
                function(error, results) {
                    if (error) {
                        throw error;
                    }
                    if (results.highBid > userBid) {
                        console.log("you dun goofed brah")
                    } else {
                        updateItem();
                    }
                }
            );
        })
    });
}
    function itemsList() {
        currItems = [];
        connection.query("SELECT items FROM bids", function(error, results) {
            console.log("hello");

            if (error) {
                throw error;
            }

            for (var x = 0; x < results.length; x++) {
                currItems.push(results[x].item);
            }
            // connection.end();   
        })

    }






    function createItem() {
        console.log("inserting a new item...\n");
        var query = connection.query(
            "INSERT INTO bids SET ?", {
                item: item
            },
            function(err, res) {
                if (err) throw err;
                console.log(res.affectedRows + "item inserted! \n");

            }
        );

        console.log(query.sql);
    };

    function updateItem() {
        console.log("updating bid... \n");
        var query = connection.query(
            "UPDATE bids SET ? WHERE ?", [{
                    highBid: userBid,
                    highBidder: userBidder
                },
                {
                    item: userItem
                }
            ],
            function(err, res) {
                if (err) throw err;
                console.log(res.affectedRows + "bid updated!\n");

            }
        );
        readItems();
        console.log(query.sql);
    };


    function readItems() {
        connection.query("SELECT * FROM bids", function(error, results) {
            if (error) {
                throw error;
            }
            console.log(results);
            // connection.end();   
        })

    };