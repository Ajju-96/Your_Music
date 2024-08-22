let currentSong = new Audio();
let songs;
let currFolder;

// Time converter min to sec
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  let response = await fetch(`/${folder}/`).then(res => res.text());
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  songs = [];
  for (let element of as) {
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // Show all the songs in the playlist
  let songLI = document.querySelector(".songlist").getElementsByTagName("ul")[0];
  songLI.innerHTML = "";
  for (const song of songs) {
    songLI.innerHTML += `<li>
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Ajju Bhai</div>
                            </div>
                            <div class="palynow">
                                <span>Play Now</span>
                                <div class="invert"><img src="img/playnow.svg" alt=""></div>
                            </div>
                        </li>`;
  }

  // Attach an event listener to each song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      palyMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
}

const palyMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    document.querySelector("#play").src = "img/paused.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let response = await fetch(`/gaana/`).then(res => res.text());
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardcontainer = document.querySelector(".cardcontainer");

  for (let e of anchors) {
    if (e.href.includes("/gaana/")) {
      let folder = e.href.split("/").slice(-1)[0];
      let albumResponse = await fetch(`/gaana/${folder}/info.json`).then(res => res.json());
      cardcontainer.innerHTML += `<div data-folder="${folder}" class="card ">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round" />
                    </svg>
                </div>
                <img src="/gaana/${folder}/cover.jpg" alt="">
                <h2>${albumResponse.title}</h2>
                <p>${albumResponse.description}</p>
            </div>`;
    }
  }

  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      songs = await getSongs(`gaana/${item.currentTarget.dataset.folder}`);
      palyMusic(songs[0]);
    });
  });
}

async function main() {
  // Get the list of all the songs
  await getSongs("gaana/ncs");

  palyMusic(songs[0], true);

  // Display all the albums on the page
  await displayAlbums();

  // Element references
  const play = document.querySelector("#play");
  const previos = document.querySelector("#previos");
  const next = document.querySelector("#next");

  // Attach an event listener to play/pause button
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/paused.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // Listen for time update event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )}/${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add event listeners for hamburger and close buttons
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-130%";
  });

  // Add an event listener to previous button
  previos.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      palyMusic(songs[index - 1]);
    }
  });

  // Add an event listener to next button
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      palyMusic(songs[index + 1]);
    }
  });

  // Add an event listener to volume control
  document.querySelector(".range input").addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
  });

  // Add an event listener to mute/unmute button
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    const volumeImg = e.target;
    if (volumeImg.src.includes("volume.svg")) {
      volumeImg.src = volumeImg.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range input").value = 0;
    } else {
      volumeImg.src = volumeImg.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.10;
      document.querySelector(".range input").value = 10;
    }
  });
}

main();
