//jshint esversion:6

//Add the modules again when using
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const mongodbPassword: "YourPassword"
const mongodbLogin: "YourLogin"
mongoose.connect("mongodb+srv://" + mongodbLogin + ":"+mongodbPassword+"@cluster0.asdzy.mongodb.net/todolistDB", {useNewUrlParser: true, useNewUrlParser: true, useUnifiedTopology: true,
useFindAndModify: false},);

//Schema Item
const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({name: "Welcome to your todoList!"});
const item2 = new Item ({name: "Hit the + button to add a new item"});
const item3 = new Item ({name: "<-- Hit this to delete an item"});

const defaultItems = [item1, item2, item3];

//Schema List
const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  
  Item.find({},function(err,foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err)
        }
        else{
          console.log("Succesfully saved our default items to database!")
        }
      });
      res.redirect("/");
    } 
        else {
          res.render("list", {listTitle: "Today", newListItems: foundItems});
        }    
    });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if (listName == "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save()
      res.redirect("/" + listName);
    });
  };
});

app.post("/delete", function(req, res){

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName == "Today"){

    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        //console.log("Succesfully deleted checked item.");
        res.redirect("/");
      }
    });
  }
    else{
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err,foundList){
        if(!err) {
          //console.log(listName)
          res.redirect("/" + listName);
        }
    });
    };
});

app.get("/:listName", function(req,res){

  //console.log(req.params.listName);

  var listTitle = _.capitalize(req.params.listName);
 
  List.findOne({name: listTitle}, function(err,foundList){
    if(!err){
      if(!foundList){
          const list = new List({
                name: listTitle,
                items: defaultItems
                });
                list.save();
                res.redirect("/" + listTitle)
      }
      else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});