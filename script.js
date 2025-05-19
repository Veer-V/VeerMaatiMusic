console.log('Lets write JavaScript');

async function getSongs() {
    let a = await fetch("http://192.168.0.107:3000/songs/");
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
    audio.play().catch(error => {
        console.error("Error playing audio:", error);
    });
};

async function main() {
    let currentSong;
    // Get the songs
    let songs = await getSongs();
    console.log(songs);
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
        <img class="invert" src="img/music.svg" alt="Music">
        <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
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

    // Play the first song (optional)
    audio.src = "songs/" + encodeURIComponent(songs[0]);
    // audio.play();

    audio.addEventListener("loadeddata", () => {
        console.log(audio.duration, audio.currentSrc, audio.currentTime);
        // The duration variable now holds the duration (in seconds) of the audio clip
    });
}

main();
