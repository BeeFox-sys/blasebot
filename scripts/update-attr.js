
const fetch = require("node-fetch");
const fs = require("fs");

let regex = /{"collection":\[.*?\]}/g;
let urlRegex = /\/static\/js\/main\..*?.chunk.js/g;

async function run(){
    console.log("Fetching script url...");
    let htmlRes = await fetch("https://blaseball.com/");
    let html = await htmlRes.text();
    let url = html.match(urlRegex);
    console.log("Fetching script...");
    let res = await fetch("https://blaseball.com"+url);
    let body = await res.text();
    let [items, attributes] = (body.match(regex));
    console.log("Writing files...");
    fs.writeFileSync("./bot/data/attributes.json",attributes.replace(/\\/g,""));
    fs.writeFileSync("./bot/data/items.json",items.replace(/\\/g,""));
    console.log("Update Complete!");
}


run();