console.log('Lets write JavaScript');

async function getSongs() {
    let a = await fetch("http://192.168.0.104:3000/songs/");
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");
    let songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/songs/")[1]);
        }
    }

    return songs;
}

let audio = new Audio();

const playMusic = (track) => {
    if (!track) return;
    audio.src = "songs/" + encodeURIComponent(track);
    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    audio.play().catch(error => {
        console.error("Error playing audio:", error);
    });
};

let songs = [];

async function main() {
    let currentSong;
    // Get the songs
    songs = await getSongs();
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


    // Play the first song (optional)
    playMusic(songs[0]);
    // audio.play();

    audio.addEventListener("loadeddata", () => {
        console.log(audio.duration, audio.currentSrc, audio.currentTime);
        // The duration variable now holds the duration (in seconds) of the audio clip
    });
}

main();
