document.addEventListener('DOMContentLoaded', function() {
    const audioPlayer = document.getElementById('audioPlayer');
    const playButton = document.getElementById('playButton');
    const songTitle = document.getElementById('songTitle');
    const volumeControl = document.getElementById('volume');

    const regularSongs = [
        '30 Hours.mp3',
        'Believe What I Say.mp3',
        'I Thought About Killing You.mp3',
        'So Soon.mp3'
    ];

    const unreleasedSongs = [];
    const nightVibeSongs = [...regularSongs];

    let currentSongs = regularSongs;
    let currentSongIndex = -1;
    let isPlaying = false;

    // Sync-related variables
    const songDuration = 180; // Assume each song is 3 minutes (180 seconds)
    let syncInterval;

    function getServerTimestamp() {
        return Math.floor(Date.now() / 1000);
    }

    function syncPlayback() {
        const timestamp = getServerTimestamp();
        const totalDuration = currentSongs.length * songDuration;
        const currentTime = timestamp % totalDuration;
        currentSongIndex = Math.floor(currentTime / songDuration);
        const songOffset = currentTime % songDuration;

        const song = currentSongs[currentSongIndex];
        audioPlayer.src = `/songs/${song}`;
        audioPlayer.currentTime = songOffset;

        if (isPlaying) {
            audioPlayer.play();
        }

        songTitle.textContent = song.replace('.mp3', '');
        console.log(`Synced to song: ${song}, offset: ${songOffset}`);
    }

    function startSync() {
        syncPlayback();
        syncInterval = setInterval(syncPlayback, songDuration * 1000);
    }

    function stopSync() {
        clearInterval(syncInterval);
    }

    function togglePlayPause() {
        if (isPlaying) {
            audioPlayer.pause();
            isPlaying = false;
            playButton.textContent = 'Play';
            stopSync();
        } else {
            isPlaying = true;
            playButton.textContent = 'Pause';
            startSync();
        }
    }

    playButton.addEventListener('click', togglePlayPause);

    volumeControl.addEventListener('input', (e) => {
        audioPlayer.volume = e.target.value;
    });

    audioPlayer.addEventListener('ended', () => {
        currentSongIndex = (currentSongIndex + 1) % currentSongs.length;
        if (isPlaying) {
            audioPlayer.src = `/songs/${currentSongs[currentSongIndex]}`;
            audioPlayer.play();
        }
    });

    function checkSpecialEvents() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const pstHours = (hours - 8 + 24) % 24;
        
        if (pstHours === 17 && minutes === 0) {
            console.log("Starting unreleased songs event");
            currentSongs = unreleasedSongs;
            playEventAnnouncement('unreleased_event.mp3');
        } else if (pstHours === 22 && minutes === 0) {
            console.log("Starting night time vibe songs event");
            currentSongs = nightVibeSongs;
            playEventAnnouncement('night_vibe_event.mp3');
        } else if ((pstHours === 18 && minutes === 0) || (pstHours === 23 && minutes === 0)) {
            console.log("Returning to regular programming");
            currentSongs = regularSongs;
            playEventAnnouncement('regular_programming.mp3');
        }
    }

    function playEventAnnouncement(announcementFile) {
        audioPlayer.src = `/announcements/${announcementFile}`;
        audioPlayer.play();
        isPlaying = true;
        playButton.textContent = 'Pause';
        songTitle.textContent = 'Event Announcement';
        
        audioPlayer.onended = () => {
            startSync();
            audioPlayer.onended = null;
        };
    }

    // Check for special events every minute
    setInterval(checkSpecialEvents, 60000);

    // Initialize
    songTitle.textContent = 'Click Play to Start';
});
