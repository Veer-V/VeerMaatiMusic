console.log('Initializing Music Player');

let currfolder;
let audio = new Audio();
let songs = [];

// Convert seconds to mm:ss format
const secondsToMinutesSeconds = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

// Fetch song list from folder using Fetch API
async function getSongs(folder) {
    currfolder = folder;
    try {
        let response = await fetch(`/songs/${folder}/`);
        let htmlText = await response.text();

        let div = document.createElement("div");
        div.innerHTML = htmlText;
        let anchors = div.getElementsByTagName("a");
        let songList = [];

        for (const anchor of anchors) {
            if (anchor.href.endsWith(".mp3")) {
                songList.push(anchor.href.split(`/${currfolder}/`)[1]);
            }
        }
        return songList;
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}

// Play selected song
const playMusic = async (track) => {
    if (!track) {
        console.error("No track provided.");
        return;
    }
    
    let encodedTrack = encodeURIComponent(track);
    let sourceURL = `/songs/${currfolder}/${encodedTrack}`;
    
    try {
        let response = await fetch(sourceURL);
        if (!response.ok) throw new Error("File not found or unsupported format");

        audio.src = sourceURL;
        document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
        document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
        audio.play();
        document.querySelector("#play").src = "img/pause.svg";
    } catch (error) {
        console.error("Error playing audio:", error);
    }
    if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
        title: track,  
        artist: "Unknown Artist",  
        album: currfolder,  
        artwork: [{ src: "/songs/" + currfolder + "/cover.jpg", sizes: "500x500", type: "image/png" }]
    });

    navigator.mediaSession.setActionHandler("play", () => audio.play());
    navigator.mediaSession.setActionHandler("pause", () => audio.pause());
    navigator.mediaSession.setActionHandler("previoustrack", () => {
        let index = songs.indexOf(track);
        if (index > 0) playMusic(songs[index - 1]);
    });
    navigator.mediaSession.setActionHandler("nexttrack", () => {
        let index = songs.indexOf(track);
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });
}
};
// Function to handle previous and next actions
function navigateSong(direction) {
    audio.pause();
    console.log(`${direction} clicked`);

    let index = songs.indexOf(decodeURIComponent(audio.src.split("/").pop()));

    if (direction === "Previous" && index > 0) {
        playMusic(songs[index - 1]);
    } else if (direction === "Next" && index < songs.length - 1) {
        playMusic(songs[index + 1]);
    } else {
        console.warn(`No ${direction.toLowerCase()} song available.`);
    }
}

// Add event listeners for Previous and Next buttons
previous.addEventListener("click", () => navigateSong("Previous"));
next.addEventListener("click", () => navigateSong("Next"));



// Update UI for song playback
audio.addEventListener("ended", () => {
    document.querySelector("#play").src = "img/Play.svg";
});

audio.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(audio.currentTime)} / ${secondsToMinutesSeconds(audio.duration)}`;
    const circle = document.querySelector(".circle");
    if (circle) {
        circle.style.left = (audio.currentTime / audio.duration) * 100 + "%";
    }
});

// Fetch and display album cards
async function displayAlbums() {
    console.log("Fetching albums...");
    try {
        let response = await fetch("https://veer-maati-music.vercel.app/songs/");
        let htmlText = await response.text();

        let div = document.createElement("div");
        div.innerHTML = htmlText;
        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = ""; // Clear previous entries

        for (const anchor of anchors) {
            if (anchor.href.includes("/songs") && !anchor.href.includes(".htaccess")) {
                let folder = anchor.href.split("/").slice(-2)[0];

                try {
                    let metadataResponse = await fetch(`/songs/${folder}/info.json`);
                    let metadata = await metadataResponse.json();

                    let cardDiv = document.createElement("div");
                    cardDiv.classList.add("card");
                    cardDiv.dataset.folder = folder;
                    cardDiv.innerHTML = `
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${metadata.title}</h2>
                        <p>${metadata.description}</p>
                    `;
                    cardContainer.appendChild(cardDiv);
                } catch (error) {
                    console.error("Error fetching album metadata:", error);
                }
            }
        }

        // Attach event listeners to newly created cards
        document.querySelectorAll(".card").forEach(card => {
            card.addEventListener("click", async (event) => {
                let folderName = event.currentTarget.dataset.folder;
                songs = await getSongs(folderName);
                displaySongList(songs);
            });
        });

    } catch (error) {
        console.error("Error fetching albums:", error);
    }
}

// Display song list on the left side
function displaySongList(songs) {
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = ""; // Clear previous list

    for (const song of songs) {
        let listItem = document.createElement("li");
        listItem.innerHTML = `
            <img class="invert" src="img/music.svg" alt="Music">
            <div class="info">
                <div>${decodeURIComponent(song)}</div>
                <div>Songs.........</div>
            </div>
            <div class="playnow"><span>Play Now</span><img class="invert" src="img/Play.svg" alt="Play"></div>
        `;
        songUL.appendChild(listItem);
    }

    // Play song on clicking list item
    songUL.addEventListener("click", (event) => {
        let li = event.target.closest("li");
        if (li) {
            let trackName = li.querySelector(".info div:first-child").innerHTML.trim();
            playMusic(trackName);
        }
    });
    async function displaySongList(songs) {
    let songUL = document.querySelector(".songList ul"); // Right-side container
    let cycleContainer = document.querySelector(".cycle-container ul"); // Left quick selection

    if (!songUL || !cycleContainer) {
        console.error("Error: song list or cycle container not found in the DOM.");
        return;
    }

    songUL.innerHTML = ""; // Clear previous list
    cycleContainer.innerHTML = ""; // Clear left-side selection

    for (const song of songs) {
        let songName = decodeURIComponent(song).replace(/.mp3$/i, "").trim(); // ✅ Remove ".mp3"

        // ✅ Fetch song title from info.json
        let songTitle = "Unknown Artist"; // Default text
        try {
            let metadataResponse = await fetch(`/songs/${currfolder}/info.json`);
            if (metadataResponse.ok) {
                let metadata = await metadataResponse.json();
                if (metadata[songName]) {
                    songTitle = metadata[songName].title || "Unknown Artist"; // Use title for the specific song
                }
            }
        } catch (error) {
            console.error("Error fetching song metadata:", error);
        }

        let listItem = document.createElement("li");
        listItem.innerHTML = `
            <img class="invert" src="img/music.svg" alt="Music">
            <div class="info">
                <div>${songName}</div>  <!-- ✅ Cleaned song name -->
                <div>${songTitle}</div>  <!-- ✅ Display title from info.json -->
            </div>
            <div class="playnow"><span>Play Now</span><img class="invert" src="img/Play.svg" alt="Play"></div>
        `;
        songUL.appendChild(listItem);

        let cycleItem = document.createElement("li");
        cycleItem.innerHTML = `<span>${songName}</span>`;
        cycleContainer.appendChild(cycleItem);
    }

    songUL.addEventListener("click", playSongFromList);
    cycleContainer.addEventListener("click", playSongFromList);

    // Hide the elements from view
    songUL.style.display = "none";
    cycleContainer.style.display = "none";
}
}

// ✅ **Volume Control & Mute Feature**
document.querySelector(".range input").addEventListener("change", (e) => {
    console.log("Setting volume to", e.target.value, "/ 100");
    audio.volume = parseInt(e.target.value) / 100;
    if (audio.volume > 0) {
        document.querySelector(".volume>img").src = "img/volume.svg";
    }
});

// ✅ **Mute Button Toggle**
document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
        e.target.src = "img/mute.svg";
        audio.volume = 0;
        document.querySelector(".range input").value = 0;
    } else {
        e.target.src = "img/volume.svg";
        audio.volume = 0.1;
        document.querySelector(".range input").value = 10;
    }
});

// Main function to initialize everything
async function main() {
    await displayAlbums();

    document.querySelector("#play").addEventListener("click", () => {
        if (audio.paused) {
            audio.play();
            document.querySelector("#play").src = "img/pause.svg";
        } else {
            audio.pause();
            document.querySelector("#play").src = "img/Play.svg";
        }
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        audio.currentTime = ((audio.duration) * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });
}

main();
