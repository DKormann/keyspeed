
<script lang="ts">
    import { onMount } from "svelte";

    function postdata(key: string, content: string[]) {
        const data = content.join("\n") + "[eos]\n\n"
        const url = "http://localhost:8071/api/setdata/" + key;

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

    onMount(()=>{

        console.log(localStorage.getItem("webkey"));

    });


    var i = 0;

    function push(){
        i++;
        postdata(
            "webkey", 
            ["test"+i, "test"+i, "test"+i]
        );
    }

</script>

<button on:click={push}>+++</button>


