import express from "express";
const app = express();
const port = 32767;

app.use(express.static("dist"));
app.listen(port, function(){
  console.log(`Started server on port ${port}.`);
});