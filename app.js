const HOST = "localhost";
const WS_PORT = 8765;
const ART_PORT = 8766;

let socket;
let reconnectDelay = 1000;

let position = 0;
let length = 1;
let playing = false;

function formatTime(s) {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, "0")}`;
}

function updateProgress() {
    const progressBar = document.getElementById("progressBar");
    progressBar.setProgress(length ? position / length : 0);
    progressBar.setPlaying(playing);
    document.getElementById("pos").textContent = formatTime(position);
}

async function fakeProgress() {
    if (playing) {
        position += 1;
        updateProgress(position);
    }
}

function handleMessage(data) {
    console.log("Received data:", data);

    let player = data[Object.keys(data)[0]];
    if (!player) {
        player = {
            title: "No music playing",
            artist: "",
            album: "",
            artUrl: `http://${HOST}:${ART_PORT}/art/null`,
            length: 0,
            position: 0,
            status: "Stopped"
        };
    }

    document.getElementById("title").textContent = player.title;
    document.getElementById("artist").textContent = player.artist;
    document.getElementById("album").textContent = player.album;
    document.getElementById("art").src = player.artUrl;
    document.getElementById("bg").style.backgroundImage = `url(${player.artUrl})`;
    document.getElementById("len").textContent = formatTime(player.length);

    length = player.length;
    playing = player.status === "Playing";
    position = player.position;
    updateProgress();

}

function connect() {
    socket = new WebSocket(`ws://${HOST}:${WS_PORT}/`);

    socket.onopen = () => {
        console.log("Connected");
        reconnectDelay = 1000;
    };

    socket.onmessage = (event) => {
        handleMessage(JSON.parse(event.data));
    };

    socket.onclose = () => {
        console.log("Disconnected, retrying...");
        setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, 30000);
    };

    socket.onerror = () => {
        socket.close();
    };
}

connect();
setInterval(fakeProgress, 1000);