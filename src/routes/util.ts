import { onMount } from "svelte";


var key :string


export function setup_util(){

    if(localStorage.userID){
        key = localStorage.userID
    }else{
        key = String(Math.random()).slice(2)
        localStorage.userID = key
    }
}



export function postData(content:string[]){

    const data = content.join("\n") + "\n[eos]\n\n"
    const url = "http://159.89.111.65:8071/keyspeed_api/setdata/" + key;

    // send data with POST method
    fetch(url, {

        method: "POST",
        body: data,
        headers: {
            "Content-Type": "application/json",
        },

    }).then((response) => {

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        console.log("data sent");

    }).catch((error) => {
        console.error("Error:", error);
    });
}
