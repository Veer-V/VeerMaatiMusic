console.log('Lets write JavaScript');

let currfolder;

async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://192.168.0.104:3000/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");
    let songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currfolder}/`)[1]);
        }
    }

    return songs;
}

let audio = new Audio();

const secondsToMinutesSeconds = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

const playMusic = (track) => {
    if (!track) return;
    audio.src = `/${currfolder}/` + encodeURIComponent(track);
    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    audio.play().then(() => {
        play.src = "img/pause.svg"; // Change button icon to pause when song starts playing
    }).catch(error => {
        console.error("Error playing audio:", error);
    });
};

audio.addEventListener("ended", () => {
    play.src = "img/play.svg"; // Change button icon to play when song ends
});

audio.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(audio.currentTime)} / ${secondsToMinutesSeconds(audio.duration)}`;
    const circle = document.querySelector(".circle");
    if (circle) {
        circle.style.left = (audio.currentTime / audio.duration) * 100 + "%";
    }
});

let songs = [];

async function main() {
    let currentSong;
    // Get the songs
    songs = await getSongs("songs/ncs");
    console.log(songs);
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
        <img class="invert" src="img/music.svg" alt="Music">
        <div class="info">
            <div>${decodeURIComponent(song)}</div>
            <div>Song Artist</div>
        </div><div class="playnow"><span>Play Now</span><img class="invert" src="img/Play.svg" alt="Play"></div></li>`;
    }

    
    // Use event delegation to handle clicks on dynamically added li elements
    songUL.addEventListener("click", (event) => {
        let li = event.target.closest("li");
        if (li) {
            let trackName = li.querySelector(".info").firstElementChild.innerHTML.trim();
            console.log(trackName);
            playMusic(trackName);
        }

         // Show all the songs in the playlist
    async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json(); 
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            playMusic(songs[0])

        })
    })
}

    });

     play.addEventListener("click", () => {
    if (audio.paused) {
        audio.play();                    // Start playing audio
        play.src = "img/pause.svg";     // Change button icon to pause
    } else {
        audio.pause();                  // Pause the audio
        play.src = "img/play.svg";      // Change button icon to play
    }



});

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        audio.currentTime = ((audio.duration) * percent) / 100
    })

// Previous Button
previous.addEventListener("click", () => {
    audio.pause();
    console.log("Previous clicked");
    const currentFilename = decodeURIComponent(new URL(audio.src).pathname.split("/").pop());
    let index = songs.indexOf(currentFilename);
    if (index > 0) {
        playMusic(songs[index - 1]);
    }
});

// Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
// Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

  
// Next Button
next.addEventListener("click", () => {
    audio.pause();
    console.log("Next clicked");
    const currentFilename = decodeURIComponent(new URL(audio.src).pathname.split("/").pop());
    let index = songs.indexOf(currentFilename);
    if (index < songs.length - 1) {
        playMusic(songs[index + 1]);
    }
});

 // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        audio.volume = parseInt(e.target.value) / 100
        if (audio.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    //Add an event listener to a seeker


    // Play the first song (optional)
    playMusic(songs[0]);
    // audio.play();

    audio.addEventListener("loadeddata", () => {
        console.log(audio.duration, audio.currentSrc, audio.currentTime);
        // The duration variable now holds the duration (in seconds) of the audio clip
    });
    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            playMusic(songs[0])

        })

    })
    
  
}

main();
















// Show all the songs in the playlist
    async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json(); 
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            playMusic(songs[0])

        })
    })
}
