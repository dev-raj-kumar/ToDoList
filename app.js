const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const date = require(__dirname + "/date.js");

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/toDoListDB",{useNewUrlParser : true});

const _ = require("lodash");

app.use(bodyParser.urlencoded({extended : true}));
app.set("view engine","ejs");
app.use(express.static("public"));

const itemSchema = new mongoose.Schema({
  name : {
    type : String,
    required : [true,"Please! provide a name !"]
  }
});

const Item = mongoose.model("item",itemSchema);

const listSchema = new mongoose.Schema({
  name : String,
  listItems : [itemSchema]
});

const List = mongoose.model("list",listSchema);

const item1 = new Item({
  name : "Welcome !! To your TODOList"
});
const item2 = new Item({
  name : "->-> click on + to add items"
});
const item3 = new Item({
  name : "<-<- check that box to delete an item"
});
const defaultItems = [item1,item2,item3];


app.get("/",function(req,res){
  // let day = date.getDate();
  // console.log(date.getDay());
  Item.find({},function(err,foundItems){
    if(err)
    console.log(err);
    else if(foundItems.length === 0){
      Item.insertMany(defaultItems , function(err){
        if(err)
        console.log(err);
        else
        console.log("Added default items successfully");
      });
      res.redirect("/");
    }
    else {
  res.render("list" ,{
      listTitle : "Today",
     listItem : foundItems
  });
}
});
});
app.post("/",function(req,res){
   const nit = req.body.newTodo;
   const whchList = req.body.button;
   const it = new Item({
     name : nit
   });

   if(whchList === "Today"){
     it.save();
     res.redirect("/");
 }
 else{
   List.findOne({name : whchList} , function(err,foundRes){
      foundRes.listItems.push(it);
      foundRes.save();
      res.redirect("/"+whchList);
   })
 }
});
app.post("/delete",function(req,res){
    const delId = req.body.chkb;
    const listName = req.body.listName;
    if(listName === "Today"){
    Item.findByIdAndRemove(delId,function(err){
       if(! err)
       console.log("Succsesfully deleted");
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name : listName} , {$pull : { listItems :  { _id : delId}}}, function(err,resFound){
      if(! err)
      res.redirect("/"+listName);
    });
  }
});
app.get("/:place",function(req,res){
  var pl = _.capitalize(req.params.place);
  List.findOne({name : pl},function(err,resFound){
    if(err)
    console.log(err);
    else{
      if(resFound){
        console.log("Result exists already");
        res.render("list",{
          listTitle : resFound.name,
         listItem : resFound.listItems
       });
      }
      else{
        const list = new List({
          name : pl,
          listItems : defaultItems
        });
        list.save();
        console.log("New List saved");
        res.redirect("/"+pl);
      }
    }
  });

});
app.get("/about",function(req,res){
  res.render("about");
});
app.listen("3000",function(){
  console.log("Port 3000 has started");
});
