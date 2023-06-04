<script lang="ts">

    import { onMount, tick } from "svelte";
    import eng_list from "./eng_list.json"

    var content:string[] = []
    var content_size = 20
    var level = 1

    var gameover_msg = ""

    onMount(()=>{

        window.addEventListener("keydown", (e)=>{
            if (e.key.length==1){
                type(e.key)
            }
        })
        start_game()
    })

    var typed_word_count = 0
    var typed_letter_count = 0

    var hunt_started = false

    function type(key:string){

        if (!game_started){
            return
        }
        if (!hunt_started){
            start_hunt()
        }

        if (content.length == 0){
            return
        }
        
        typed_count += 1
        if (typed_count>= letter_count){
            content_size += 10
            content = []
            end_game("WIN")
            level += 1
            return
        }

        const target_character = typed_letter_count==-1 ? " " : content[typed_word_count][typed_letter_count]
        
        if (target_character == key){

            const letter = document.getElementById("L"+typed_word_count+"_"+(typed_letter_count))
            letter?.classList.add("done")
            
        }else{
            end_game()
            return
        }

        typed_letter_count += 1

        if (typed_letter_count == content[typed_word_count].length){
            typed_word_count += 1
            typed_letter_count = -1
        }
    }

    var hunted_words = 0
    var hunted_letters = 0

    function start_hunt(){
        
        hunt_started = true
        
        setTimeout(() => { hunt() }, 1000);
    }

    var huntid:number | null = null

    var time = ()=>{ return Date.now() - start_time}

    function hunt(){
        
        if (!hunt_started || content.length == 0){
            return
        }
        console.log("hunt");

        const letter = document.getElementById("L"+hunted_words+"_"+hunted_letters)
        if (letter != null){
            letter.classList.add("hunter")
            if (!letter.classList.contains("done")){

                end_game("BURNED")
                return
            }
        }
        var speed = 1 + (time()/1000)**0.5

        if (hunted_words < typed_word_count - 2){
            speed *=2
        }
        const interval = 1000 / speed
        huntid = setTimeout(() => {
            hunt()
        }, interval);

        hunted_letters += 1
        try{

            if (hunted_letters == content[hunted_words].length){
                hunted_words += 1
                hunted_letters = -1
            }
        }catch{
            end_game("BURNED")
        }
    }

    var old_content : string[] = []

    function end_game(msg:string = "ERROR"){
        game_started = false

        old_content = content
        content = []

        gameover_msg = msg
        hunt_started = false

        setTimeout(() => {
            gameover_msg =""
            start_game()
        }, 1000);
    }

    var letter_count = 0
    var game_started = false
    var typed_count = 0
    var start_time = Date.now()


    

    function start_game(){
        start_time = Date.now()
        game_started = true

        typed_word_count = 0
        typed_letter_count = 0
        typed_count = 0

        hunted_words = 0
        hunted_letters = 0

        content = []
        if (old_content.length > 0){
            content = old_content
            old_content = []
            return
        }
        letter_count = 0

        while(letter_count < content_size){
            const new_word = get_word()
            content.push(new_word)
            letter_count += new_word.length + 1
        }
        letter_count -= 1
    }

    function get_word(){

        const exp = 1000
        var idx = (exp ** Math.random()-1)/(exp-1)

        idx = Math.floor(idx* eng_list.length)
        const word = eng_list[idx]
        return word
    }

</script>

<div id=page>

    <h2 class = level>Level {level}</h2>

    <!-- {steps}/{content_size} -->
    {typed_count}/{letter_count}
    <h2> 
        {#if gameover_msg != ""}
        <span class="hunter">
            {gameover_msg}
        </span>
        {:else}
            {#each content as word,i}
                {#each word as letter,j}
                    <letter id={"L"+i+"_"+j} class="new">{letter}</letter>
                {/each}
                <letter> </letter>
            {/each}
        {/if}

    </h2>

</div>