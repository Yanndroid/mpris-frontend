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
    progressBar.setProgress(position / length);
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

    const player = data[Object.keys(data)[0]];
    if (player) {
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
    } else {
        playing = false;
    }
}

function connect() {
    socket = new WebSocket("ws://localhost:8765/");

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