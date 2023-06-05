<script lang="ts">

    import { onMount, tick } from "svelte";
    import eng_list from "./eng_list.json"
    import { browser } from "$app/environment";

    var content:string[] = []
    var content_per_level = 10
    var content_size = content_per_level
    var level = 1

    var highscore = 1

    var history: [string, number][] = []


    var caret:HTMLElement
    if (browser){

        if(localStorage.level){
            level = parseInt(localStorage.level)
            content_size = level * content_per_level
        }
        if (localStorage.highscore){
            highscore = parseInt(localStorage.highscore)
        }
        if (localStorage.history){
            history = JSON.parse(localStorage.history)
        }else{
            history = [[get_date(), 1]]
        }

        caret = document.getElementById("caret")!

    }


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

        const target_character = typed_letter_count==-1 ? " " : content[typed_word_count][typed_letter_count]

        const letter = document.getElementById("L"+typed_word_count+"_"+typed_letter_count)


        if ( letter!= null){

            caret.style.left = letter!.offsetLeft + letter.offsetWidth - 2 + "px"
            caret.style.top = letter!.offsetTop + 4 + "px"
        }else{
            var newleft =  Number(caret.style.left.slice(0,-2))
            caret.style.left = newleft + 4 + "px"
        }
            
        
        if (target_character == key){

            const letter = document.getElementById("L"+typed_word_count+"_"+(typed_letter_count))
            letter?.classList.add("done")
            
        }else{
            end_game()
            return
        }

        typed_count += 1
        if (typed_count>= letter_count){
            content_size += content_per_level
            content = []
            end_game("WIN")
            level += 1
            if (level > highscore){
                highscore = level
                localStorage.highscore = highscore

            }
            history[history.length - 1] = [date, level]
            localStorage.history = JSON.stringify(history)

            localStorage.level = level
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

        caret.style.display = "block"


        // get the current date

        start_time = Date.now()
        
        hunt_started = true
        
        setTimeout(() => { hunt() }, 1000);
    }

    var huntid:number | null = null

    var time = ()=>{ return Date.now() - start_time}

    function hunt(){
        
        if (!hunt_started || content.length == 0){
            return
        }

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
        caret.style.display = "none"
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

    
    function get_date () { return new Date().getDate() + "." + (new Date().getMonth() + 1) + "." + new Date().getFullYear()+"."}

    var date = get_date()



    if (browser) {
        if (history[history.length - 1][0] != date){
            history.push([date, level])
            console.log(history);
        }
    }

    function start_game(){


        date = get_date()
        if (localStorage.last_used != date){
            localStorage.last_used = date
            localStorage.level = 1

            level = 1
            content_size = 20
        }
        
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


<!-- 10px width div -->

<div id=page>

    <h2 class = level>Level {level}</h2>

    <!-- {steps}/{content_size} -->
    {typed_count}/{letter_count}
    <h2> 
        <div  id ="caret" style="height:1em;width:3px;background:white;position:absolute;display:none"> </div>

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


    {#if !hunt_started }
        <div id = stats>

            <h2>stats:</h2>
            <p>highscore: {highscore}</p>

            {#if history.length > 1}

                {#each history.slice().reverse() as item}
                <p>{item[0]} : {item[1]}</p>
                {/each}
            {/if}

        </div>
    {/if}

</div>