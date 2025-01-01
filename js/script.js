// Select play button
let play = document.querySelector(".songbutton").getElementsByClassName("play")[0];
let currentSong = new Audio();
let songs = [];
let currFolder = "";
let currFoldersong = "";

// Utility function to convert seconds to time string
function convertSecondsToTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const formattedSeconds = secs < 10 ? `0${secs}` : secs;
  return `${minutes}:${formattedSeconds}`;
}

// Function to fetch songs from a folder
async function getSongs(folder, folderSong) {
  currFolder = folder;
  currFoldersong = folderSong;

  try {
    let response = await fetch(folder);
    if (!response.ok) throw new Error(`Error fetching songs: ${response.status}`);

    let data = await response.json();
    songs = data.filter(e => e.name.endsWith(".mp3")).map(e => e.name);

    // Update playlist UI
    let songUL = document.querySelector(".song-list ul");
    songUL.innerHTML = songs
      .map(song => `
        <li>
          <img src="img/music.svg" alt="" class="invert">
          <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <div>Shubham</div>
          </div>
          <div class="playnow">
            <span>play</span>
            <img src="img/play.svg" alt="Play" class="invert">
          </div>
        </li>`)
      .join("");

    // Attach click listeners to songs
    Array.from(songUL.children).forEach(e => {
      e.addEventListener("click", () => {
        playMusic(e.querySelector(".info div").textContent);
        play.src = "img/pause.svg";
        document.querySelector(".songinfo").textContent = e.querySelector(".info div").textContent;
      });
    });
  } catch (error) {
    console.error("Error fetching songs:", error);
  }
}

// Function to play music
let playMusic = (track, pause = false) => {
  currentSong.src = `${currFoldersong}${track}`;

  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

// Function to display albums and handle card click events
async function displayAlbums() {
  try {
    let response = await fetch("https://api.github.com/repositories/909009938/contents/songs");
    if (!response.ok) throw new Error(`Error fetching albums: ${response.status}`);

    let data = await response.json();
    let cardContainer = document.querySelector(".card-container");

    cardContainer.innerHTML = data
      .map(e => `
        <div data-folder="${e.name}" class="card">
          <div class="play">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50" color="#000000" fill="#1ed760">
              <circle cx="12" cy="12" r="10" stroke="#1ed760" stroke-width="1.5" />
              <path d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z" fill="currentColor" />
            </svg>
          </div>
          <img src="https://raw.githubusercontent.com/shubhampatel1573/Spotify/main/songs/${e.name}/cover.jpg">
          <h2>${e.name}</h2>
        </div>`)
      .join("");

    // Add click listeners to cards
    Array.from(document.getElementsByClassName("card")).forEach(e => {
      e.addEventListener("click", async () => {
        const folder = e.dataset.folder;
        const folderPath = `https://api.github.com/repos/shubhampatel1573/Spotify/contents/songs/${folder}`;
        const folderSongPath = `https://raw.githubusercontent.com/shubhampatel1573/Spotify/main/songs/${folder}/`;

        await getSongs(folderPath, folderSongPath);

        if (songs.length > 0) {
          playMusic(songs[0]);
        }

        document.querySelector(".album-title").innerText = folder.replaceAll("%20", " ");
        document.querySelector(".album-cover").src = `/songs/${folder}/cover.jpg`;
      });
    });
  } catch (error) {
    console.error("Error displaying albums:", error);
  }
}

// Main function to initialize the app
async function main() {
  await getSongs("https://api.github.com/repos/shubhampatel1573/Spotify/contents/songs/ncs", "https://raw.githubusercontent.com/shubhampatel1573/Spotify/main/songs/ncs/");
  playMusic(songs[0], true);
  displayAlbums();

  // Play/pause functionality
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // Listen for time updates
  currentSong.addEventListener("timeupdate", () => {
    if (!isNaN(currentSong.duration)) {
      document.querySelector(".songtime").innerHTML = `${convertSecondsToTime(currentSong.currentTime)} / ${convertSecondsToTime(currentSong.duration)}`;
      document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    }
  });

  // Seek bar functionality
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = `${percent}%`;
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Hamburger menu functionality
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0px";
  });
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });



  // add an event listener to previous  

  document.querySelector(".previous").addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0])
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1])
    }
  })

  // add an event listener to next 

  document.querySelector(".next").addEventListener("click", () => {


    let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0])
    if ((index + 1) < songs.length) {
      playMusic(songs[index + 1])
    }
  })





  // Volume control
  document.querySelector(".range input").addEventListener("input", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
  });

  // Mute/unmute functionality
  document.querySelector(".volume > img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range input").value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document.querySelector(".range input").value = 10;
    }
  });
}

main();
