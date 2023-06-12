<script lang="ts">

    import { onMount, tick } from "svelte";
    import eng_list from "./eng_list.json"
    import { browser } from "$app/environment";

    import {data} from "./mobydick/en"

    var content:string[] = []
    var content_per_level = 10
    var content_size = content_per_level
    var level = 1

    var highscore = 1

    var history: [string, number][] = []

    var caret:HTMLElement

    var alt_pressed = false

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


    var last_event_time = time()

    function register_event(type:string){
        const now = time()
        console.log(now - last_event_time + type);
        last_event_time = now
    }

    onMount(()=>{

        window.addEventListener("keydown", (e)=>{

            register_event("_D_"+e.code)
            if (e.key == "'"){
                e.preventDefault()
            }
            if (e.key.length==1){
                type(e.key)
            }else if (e.key == "Backspace"){
                if (alt_pressed){
                    del_word()
                }else{
                    del()
                }

            }else if (e.key == "Alt"){
                alt_pressed = true
            }
        })
        window.addEventListener("keyup", (e)=>{
            register_event("_U_"+e.code)
            if (e.key == "Alt"){
                alt_pressed = false
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
            caret.style.display = "block"
        }

        if (content.length == 0){
            return
        }

        if (typed_count > letter_count){
            return
        }
        
        const target_character = typed_letter_count==-1 ? " " : content[typed_word_count][typed_letter_count]

        const letter = document.getElementById("L"+typed_word_count+"_"+typed_letter_count)


        if ( letter!= null){

            caret.style.left = letter!.offsetLeft + letter.offsetWidth - 2 + "px"
            caret.style.top = letter!.offsetTop + 4 + "px"
        }else{ // space was typed
            var newleft =  Number(caret.style.left.slice(0,-2))
            caret.style.left = newleft + 4 + "px"
        }
            
        
        if (target_character == key){
            // const letter = document.getElementById("L"+typed_word_count+"_"+(typed_letter_count))
            letter?.classList.remove("wrong")
            letter?.classList.add("done")
            
        }else{
            letter?.classList.add("wrong")
            letter?.classList.remove("done")
            // return
        }


        if (typed_count +1 >= letter_count){
            if (document.querySelector(".wrong") != null){
                // end_game("ERROR")
                return
            }
            content_size += content_per_level
            content = []
            end_game("WIN")
            level += 1
            localStorage.data_line_num = data_line_num
            localStorage.data_word_num = data_word_num


            if (level > highscore){
                highscore = level
                localStorage.highscore = highscore

            }
            history[history.length - 1] = [date, level]
            localStorage.history = JSON.stringify(history)

            localStorage.level = level
            return
        }        

        register_typed(key)
        typed_letter_count += 1

        if (typed_letter_count == content[typed_word_count].length){
            typed_word_count += 1
            typed_letter_count = -1
        }
    }


    function register_typed(key:string){

        typed_count += 1
        register_event("_A_"+key)
    }

    function register_delete(n:number=1){
            
            typed_count -= n
            for (let i = 0; i < n; i++) {
                register_event("_D_")
            }
    }


    function del(){

        if (typed_letter_count == -1){
            typed_word_count -= 1
            typed_letter_count = content[typed_word_count].length - 1
        }else{
            typed_letter_count -= 1
        }
        const letter = document.getElementById("L"+typed_word_count+"_"+typed_letter_count)
        letter?.classList.remove("done")
        letter?.classList.remove("wrong")
        if (letter != null){
            caret.style.left = letter!.offsetLeft + "px"
        }else{ //space deleted
            const newleft = Number(caret.style.left.slice(0,-2))
            caret.style.left = newleft - 4 + "px"
        }

        register_delete()
    }

    function reset_letter(letter:HTMLElement){
        letter.classList.remove("done")
        letter.classList.remove("wrong")
        letter.classList.add("new")
    }

    function del_word(){

        if (typed_letter_count>0){

            register_delete(typed_letter_count + 1)

        }

        if (typed_letter_count<=0){

            const target_word = content[typed_word_count-1]
            if (target_word != undefined){

                register_delete(target_word.length + 1)
            }
            
            
            if (typed_letter_count == 0){
                register_delete()
            }

            typed_word_count -= 1
        }


        typed_letter_count = -1

        if (typed_word_count <= 0){
            typed_word_count = 0
            typed_letter_count = 0
            typed_count = 0
        }

        const target_word = content[typed_word_count]
        for (let i = 0; i < target_word.length; i++) {
            const letter = document.getElementById("L"+typed_word_count+"_"+i)
            
            reset_letter(letter!)
        }

        if(typed_count <0 ){
            typed_count = 0
        }


        const letter = document.getElementById("L"+typed_word_count+"_"+typed_letter_count)

        if (letter != null){
            caret.style.left = letter!.offsetLeft + "px"
        }else{ //space deleted
            const newleft = Number(caret.style.left.slice(0,-2))
            caret.style.left = newleft - 4 + "px"
        }
    }



    var hunted_words = 0
    var hunted_letters = 0


    function start_hunt(){


        start_time = Date.now()
        
        hunt_started = true
        
        setTimeout(() => { hunt() }, 1000);
    }

    var huntid:number | null = null

    function time  (){ return Date.now() - start_time}

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

        set_random_state(date+level)
        
        while(letter_count < content_size){
            // const new_word = get_random_word(date+level+letter_count)
            const new_word = get_word()
            content.push(new_word)
            letter_count += new_word.length + 1
        }
        letter_count -= 1
    }

    const salt = 2**32 *0.34857344
    var random_state = salt

    function set_random_state(seed:string){
        random_state = salt
        random(seed)
    }

    function random(seed = "sdfj0"){

        for (let i = 0; i < seed.length; i++) {
            const char = seed.charCodeAt(i);
            random_state = ((random_state << 5) - random_state) + char;
            random_state = random_state & random_state; // Convert to 32-bit integer
        }

        const randomNumber = Math.abs(random_state) / Math.pow(2, 32); // Divide by 2^32 to get a floating-point number between 0 and 1

        return randomNumber;
    }

    var data_line_num = 0
    var data_word_num = 0
    if (browser){

        if (localStorage.data_line_num){
            data_line_num = parseInt(localStorage.data_line_num)
        }
        if (localStorage.data_word_num){
            data_word_num = parseInt(localStorage.data_word_num)
            
        }
    }
    var data_line = data[data_line_num].split(" ")


    function get_word(){

        if (data_word_num >= data_line.length){

            
            data_line_num += 1
            data_word_num = 0
            if (data_line_num >= data.length){
                
                data_line_num = 0
            }
            data_line = data[data_line_num].split(" ")
        }
        data_word_num += 1
        return data_line[data_word_num-1]
    }

    function get_random_word(seed:string){

        const exp = 1000

        var idx = (exp ** random(seed)-1)/(exp-1)

        idx = Math.floor(idx* eng_list.length)
        const word = eng_list[idx]
        return word
    }

    var counter=0

    function count(){
        counter += 1
        return counter
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
            <!-- {(()=>{count = 0;return ""})()} -->
            {#each content as word,i}
                {#each word as letter,j}
                    {#if j==0} <span id={"L"+i+"_-1"}>{" "}</span>{/if}<letter id={"L"+i+"_"+j} class="new">{letter}</letter>

                {/each}
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