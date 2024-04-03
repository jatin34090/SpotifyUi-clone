import { fetchRequest } from "../api";
import { ENDPOINT, LOADED_TRACKS, SECTIONTYPE, getItemFromlocalStorage, logout, setItemInLocalStorage } from "../common";

const audio = new Audio();

let progressInterval;
let displayName;

const onProfileClick = (event) => {
    event.stopPropagation();
    const profileMenu = document.querySelector("#profile-menu")
    profileMenu.classList.toggle("hidden");
    if (!profileMenu.classList.contains("hidden")) {
        profileMenu.querySelector("li#logout").addEventListener("click", logout);
    }
}

const loadUserProfile = async () => {
    return new Promise(async(resolve, reject)=>{
        const defaultImage = document.querySelector("#default-image");
        const profiteButon = document.querySelector("#user-profile-btn");
        const displayNameElement = document.querySelector("#display-name");
    
    
        const { display_name: displayName, images } = await fetchRequest(ENDPOINT.userInfo);
        if (images?.length) {
            defaultImage.classList.add("hidden");
        }
        else {
            defaultImage.classList.remove("hidden");
        }
    
        profiteButon.addEventListener("click", onProfileClick)
    
        displayNameElement.textContent = displayName;
        resolve({displayName})
    })

}
const onPlaylistItemClicked = (event, id) => {
    console.log(event);
    const section = { type: SECTIONTYPE.PLAYLIST, playlist: id };
    history.pushState(section, "", `playlist/${id}`);
    loadSection(section);
}

const loadPlaylist = async (endpoint, elementId) => {
    const { playlists: { items } } = await fetchRequest(endpoint);
    const playlistItemSection = document.querySelector(`#${elementId}`);
    for (let { name, description, images, id } of items) {
        const [{ url: imageUrl }] = images;
        const playlistItem = document.createElement("section");
        playlistItem.className = "bg-black-secondary rounded p-4 hover:cursor-pointer hover:bg-light-black "
        playlistItem.id = id;
        playlistItem.setAttribute("data-type", "playlist");
        playlistItem.addEventListener("click", (event) => onPlaylistItemClicked(event, id));
        playlistItem.innerHTML += `<img src=${imageUrl} alt=${name} class="rounded mb-2 object-contain shadow" />
        <h2 class="text-base font-semibold mb-4 truncate line-clamp-2">${name}</h2>
        <h3 class="text-sm text-secondary line-clamp-2">${description}</h3>`
        playlistItemSection.appendChild(playlistItem);
    }
}
const loadPlaylists = () => {
    loadPlaylist(ENDPOINT.featuredPlaylist, "featured-playlist-items");
    loadPlaylist(ENDPOINT.toplists, "top-playlist-items");
}

const fillContentForDashboard = () => {
    const coverContent = document.querySelector("#cover-content");
    coverContent.innerHTML = `<h1 class="text-6xl">Hello ${displayName}</h1>`
    const pageContent = document.querySelector("#page-content");
    const playlistMap = new Map([["featured", "featured-playlist-items"], ["top playlists", "top-playlist-items"]]);
    let innerHTML = "";
    for (let [type, id] of playlistMap) {
        innerHTML += `<article class="p-4">
        <h1 class="mb-4 text-2xl font-bold capitalize">${type}</h1>
        <section
          class="featured-songs grid grid-cols-auto-fill-cards gap-4"
          id=${id}
        >
         
        </section>
      </article>`;
    }

    pageContent.innerHTML = innerHTML;
}

const formatTime = (duration) => {
    const min = Math.floor(duration / 60_000);
    const sec = ((duration % 6_000) / 1000).toFixed(0);
    const formattedTime = sec == 60 ? min + 1 + ":00" : min + ":" + (sec < 10 ? "0" : "") + sec;
    return formattedTime;
}

const onTrackSelection = (id, event) => {
    document.querySelectorAll("#tracks .track").forEach(trackItem => {
        if (trackItem.id === id) {
            trackItem.classList.add("bg-gray", "selected");
        } else {
            trackItem.classList.remove("bg-gray", "selected");
        }
    })
}


const updateIconForPlayMode = (id) => {
    const playButton = document.querySelector("#play");
    playButton.querySelector("span").textContent = "pause_circle";
    const playButtonFromTracks = document.querySelector(`#play-tracks-${id}`);
    if (playButtonFromTracks) {

        playButtonFromTracks.textContent = "pause";
    }
}
const updateIconForPausedMode = (id) => {
    const playButton = document.querySelector("#play");
    playButton.querySelector("span").textContent = "play_circle";
    const playButtonFromTracks = document.querySelector(`#play-tracks-${id}`);
    if (playButtonFromTracks) {
        playButtonFromTracks.textContent = "play_arrow";
    }
}


const onAudioMatadatLoaded = () => {
    const totalSongDuration = document.querySelector("#total-song-duration");
    totalSongDuration.textContent = `0:${audio.duration.toFixed(0)}`;

}



const togglePlay = () => {
    if (audio.src) {
        if (audio.paused) {
            audio.play();

        } else {
            audio.pause();

        }
    }

}
const findCurrentTrack = () => {
    const audioControl = document.querySelector("#audio-control");
    const trackId = audioControl.getAttribute("data-track-id");
    if (trackId) {
        const loadedTracks = getItemFromlocalStorage(LOADED_TRACKS);
        const currentTrackIndex = loadedTracks?.findIndex(trk => trk.id === trackId);
        return { currentTrackIndex, tracks: loadedTracks };
    }
    return null;
}

const playNextTrack = () => {
    const { currentTrackIndex = -1, tracks = null } = findCurrentTrack() ?? {};
    if (currentTrackIndex > -1 && currentTrackIndex < tracks?.length - 1) {
        playTrack(null, tracks[currentTrackIndex + 1]);

    }

}
const playprevTrack = () => {
    const { currentTrackIndex = -1, tracks = null } = findCurrentTrack() ?? {};
    if (currentTrackIndex > 0) {
        playTrack(null, tracks[currentTrackIndex - 1]);

    }
}

const playTrack = (event, { image, artistNames, name, duration, previewURL, id }) => {
    if (event?.stopPropagation) {
        event.stopPropagation();
    }

    if (audio.src === previewURL) {
        togglePlay();
    } else {

        console.log(image, artistNames, name, duration, previewURL, id);


        const nowPlayingSongImage = document.querySelector("#now-playing-image");
        const songTitle = document.querySelector("#now-playing-song");
        const songArtist = document.querySelector("#now-playing-artist");
        const audioControl = document.querySelector("#audio-control");
        const songinfo = document.querySelector("#song-info");
        
        audioControl.setAttribute("data-track-id", id);
        songTitle.textContent = name;
        nowPlayingSongImage.src = image.url;
        songArtist.textContent = artistNames;
        
        audio.src = previewURL;
        audio.play();
        songinfo.classList.remove("invisible");



    }

}

const loadPlaylistTracks = ({ tracks }) => {
    const trackSections = document.querySelector("#tracks");

    let trackNo = 1;
    const loadedTracks = [];
    console.log("tracks")
    console.log(tracks)
    for (let trackItem of tracks.items.filter(item => item.track.preview_url)) {
        let { id, artists, name, album, duration_ms: duration, preview_url: previewURL } = trackItem.track;
        const track = document.createElement("section");
        track.id = id;
        track.className = "track p-1 grid grid-cols-[50px_1fr_1fr_50px] items-center justify-items-start gap-4 rounded-md text-secondary hover:bg-light-black";
        let image = album.images.find(img => img.height === 64);
        let artistNames = Array.from(artists, artist => artist.name).join(",");
        track.innerHTML = `
        <p class="relative w-full flex items-center justify-center justify-self-center"><span class = "track-no">${trackNo++}</span></p>
        <section class="grid grid-cols-[auto_1fr] gap-2 place-items-center">
          <img class="h-10 w-10" src="${image.url}" alt="${name}" />
          <article class="flex flex-col gap-2 justify-center">
            <h2 class="song-title text-base text-primary line-clamp-1">${name}</h2>
            <p class="text-xs line-clamp-1">${artistNames}</p>
          </article>
        </section>
        <p class="text-sm">${album.name}</p>
        <p class="text-sm">${formatTime(duration)}</p>
      </section>`;
        track.addEventListener("click", (event) => onTrackSelection(id, event));
        const playButton = document.createElement("button");
        playButton.id = `play-tracks-${id}`;
        playButton.className = `play w-full absolute left-0 text-lg invisible material-symbols-outlined`;
        playButton.textContent = "play_arrow";
        playButton.addEventListener("click", (event) => playTrack(event, { image, artistNames, name, duration, previewURL, id }))
        track.querySelector("p").appendChild(playButton);

        trackSections.appendChild(track);
        loadedTracks.push({ id, artistNames, name, album, duration, previewURL, image });

    }
    setItemInLocalStorage(LOADED_TRACKS, loadedTracks);

}

const fillContentForPlaylist = async (playlistId) => {
    const playlist = await fetchRequest(`${ENDPOINT.playlist}/${playlistId}`);
    console.log("playlist");
    console.log(playlist);
    const { name, description, images, tracks, followers } = playlist;
    const coverElement = document.querySelector("#cover-content");
    coverElement.innerHTML = `
   
    <img class="object-contain h-36 w-36" src=${images[0].url} alt="">
    <section>
    <h2 id="playlist-name" class="text-4xl">${name}</h2>
    <p id="playlist-artists" >${description}</p>
    <p id="playlist-details">• ${tracks.items.length} songs • ${followers.total} likes </p>
    <section/>
`
    const pageContent = document.querySelector("#page-content");
    pageContent.innerHTML = `
        <header id="playlist-header" class="mx-8 border-secondary border-b-[0.5px] z-10">
          <nav class="py-2">
            <ul class="grid grid-cols-[50px_1fr_1fr_50px] gap-4 text-secondary">
              <li class="justify-self-center">#</li>
              <li>Title</li>
              <li>Album</li>
              <li>🕛</li>
            </ul>
          </nav>
        </header>
        <section class="px-8 text-secondary mt-4" id="tracks">
        </section>`;


    console.log(playlist);
    loadPlaylistTracks(playlist);


}

const onContentScroll = (event) => {
    const { scrollTop } = event.target;
    const header = document.querySelector(".header");
    const coverElement = document.querySelector("#cover-content");
    const totalHeight = coverElement.offsetHeight;
    const coverOpacity = 100 - (scrollTop >= totalHeight?100: ((scrollTop/totalHeight)*100));
    const headerOpacity = scrollTop>=header.offsetHeight? 100: ((scrollTop/header.offsetHeight)*100);
    coverElement.style.opacity = `${coverOpacity}`;
    header.style.background = `rgba(0 0 0 / ${headerOpacity}%)`;

    if (history.state.type === SECTIONTYPE.PLAYLIST) {
  
        const playlistHeader = document.querySelector("#playlist-header");
            if (coverOpacity <=35) {
            playlistHeader.classList.add("sticky", "bg-black-secondary", "px-8");
            playlistHeader.classList.remove("mx-8");
            playlistHeader.style.top = `${header.offsetHeight}px`;

        } else {
            playlistHeader.classList.remove("sticky", "bg-black-secondary", "px-8");
            playlistHeader.classList.add("mx-8");
            playlistHeader.style.top = `revert`;

        }
    }

}

const loadSection = (section) => {
    if (section.type === SECTIONTYPE.DASHBOARD) {
        fillContentForDashboard();
        loadPlaylists();
    } else if (section.type === SECTIONTYPE.PLAYLIST) {
        // load the element for playlists
        fillContentForPlaylist(section.playlist);
    }

    document.querySelector(".content").removeEventListener("scroll", onContentScroll)
    document.querySelector(".content").addEventListener("scroll", onContentScroll)


}


const onUserPlaylistsClick = (id)=>{
    const section = {type:SECTIONTYPE.PLAYLIST, playlist: id};
    history.pushState(section,"", `/dashboard/playlist/${id}`);
    loadSection(section);
}

const loadUserPlaylists = async() =>{
    const playlists = await fetchRequest(ENDPOINT.userPlaylist);
    console.log((playlists));
    const userPlaylistSection = document.querySelector("#user-playlist > ul");
    userPlaylistSection.innerHTML="";
    for(let {name, id} of playlists.items){
        const li = document.createElement("li");
        li.textContent  = name;
        li.className = "cursor-pointer hover:text-primary";
        li.addEventListener("click", ()=>onUserPlaylistsClick(id));
        userPlaylistSection.appendChild(li);
    }

}
document.addEventListener("DOMContentLoaded", async () => {
    const volume = document.querySelector("#volume");
    const playButton = document.querySelector("#play");
    const songDurationCompleted = document.querySelector("#song-duration-completed");
    const songProgress = document.querySelector("#progress");
    const timeline = document.querySelector("#timeline");
    const audioControl = document.querySelector("#audio-control");
    const next = document.querySelector("#next");
    const prev = document.querySelector("#prev");
    ({displayName} = await loadUserProfile());
    loadUserPlaylists()
    const section = { type: SECTIONTYPE.DASHBOARD };
    // const section = { type: SECTIONTYPE.PLAYLIST, playlist: "37i9dQZF1DWX3SoTqhs2rq" }
    history.pushState(section, "", "");
    // history.pushState(section, "", `/dashboard/playlist/${section.playlist}`);
    loadSection(section);

    document.addEventListener("click", () => {
        const profileMenu = document.querySelector("#profile-menu")
        if (!profileMenu.classList.contains("hidden")) {
            profileMenu.classList.add("hidden")
        }
    })


    audio.addEventListener("play", () => {
        const selectedTrackId = audioControl.getAttribute("data-track-id");
        const tracks = document.querySelector("#tracks");
        const playingTrack = tracks?.querySelector("section.playing");
        const selectedTrack = tracks?.querySelector(`[id="${selectedTrackId}"]`);
        
        if (playingTrack?.id !== selectedTrack?.id) {
            playingTrack?.classList.remove("playing");
        }
        selectedTrack?.classList.add("playing");
        progressInterval = setInterval(() => {
            if (audio.paused) {
                return;
            }
            songDurationCompleted.textContent = `${audio.currentTime.toFixed(0) < 10 ? "0:0" + audio.currentTime.toFixed(0) : "0:" + audio.currentTime.toFixed(0)}`;
            songProgress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
        }, 100)
        updateIconForPlayMode(selectedTrackId);
    });

    audio.addEventListener("pause", () => {
        if (progressInterval) {
            clearInterval(progressInterval);
        }
        const selectedTrackId = audioControl.getAttribute("data-track-id");
        updateIconForPausedMode(selectedTrackId);


    })

    audio.addEventListener("loadedmetadata", onAudioMatadatLoaded);

    playButton.addEventListener("click", togglePlay);


    volume.addEventListener("change", () => {
        audio.volume = volume.value / 100;
    });


    timeline.addEventListener("click", (e) => {
        const timelineWidth = window.getComputedStyle(timeline).width;
        const timeToSeek = (e.offsetX / parseInt(timelineWidth)) * audio.duration;
        audio.currentTime = timeToSeek;
        songProgress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
    }, false);

    next.addEventListener("click", playNextTrack);
    prev.addEventListener("click", playprevTrack);


    window.addEventListener("popstate", (event) => {
        console.log(event);
        loadSection(event.state);
    })
})

