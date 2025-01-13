document.addEventListener('DOMContentLoaded', function() {
    const audioPlayer = document.getElementById('audioPlayer');
    const playButton = document.getElementById('playButton');
    const songTitle = document.getElementById('songTitle');
    const volumeControl = document.getElementById('volume');
    const clockElement = document.getElementById('clock');

    const regularSongs = [
        { name: '30 Hours.mp3', duration: 323 },
        { name: 'Believe What I Say.mp3', duration: 242 },
        { name: 'I Thought About Killing You.mp3', duration: 274 },
        { name: 'So Soon.mp3', duration: 147 }
    ];

    const unreleasedSongs = [];
    const nightVibeSongs = [...regularSongs];

    let currentSongs = regularSongs;
    let currentSongIndex = -1;
    let isPlaying = false;

    // Sync-related variables
    let syncInterval;

    function getServerTimestamp() {
        return Math.floor(Date.now() / 1000);
    }

    function getTotalDuration(songs) {
        return songs.reduce((total, song) => total + song.duration, 0);
    }

    function syncPlayback() {
        const timestamp = getServerTimestamp();
        const totalDuration = getTotalDuration(currentSongs);
        let currentTime = timestamp % totalDuration;
        
        for (let i = 0; i < currentSongs.length; i++) {
            if (currentTime < currentSongs[i].duration) {
                currentSongIndex = i;
                break;
            }
            currentTime -= currentSongs[i].duration;
        }

        const song = currentSongs[currentSongIndex];
        audioPlayer.src = `/songs/${song.name}`;
        audioPlayer.currentTime = currentTime;

        if (isPlaying) {
            const playPromise = audioPlayer.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Playback failed:', error);
                    // Handle the error here, e.g., retry playback or show an error message
                });
            }
        }

        songTitle.textContent = song.name.replace('.mp3', '');
        console.log(`Synced to song: ${song.name}, offset: ${currentTime}`);
    }

    function startSync() {
        syncPlayback();
        // Sync every 30 seconds to account for potential drift
        syncInterval = setInterval(syncPlayback, 30000);
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
            audioPlayer.src = `/songs/${currentSongs[currentSongIndex].name}`;
            audioPlayer.play().catch(error => {
                console.error('Playback failed:', error);
                // Handle the error here
            });
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
        audioPlayer.play().catch(error => {
            console.error('Announcement playback failed:', error);
            // Handle the error here
        });
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

    // Update clock
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        clockElement.textContent = timeString;
    }

    // Update clock every second
    setInterval(updateClock, 1000);
    updateClock(); // Initial update

    // Initialize
    songTitle.textContent = 'Click Play to Start';

    // Error handling for audio loading
    audioPlayer.addEventListener('error', function(e) {
        console.error('Audio Error:', e);
        songTitle.textContent = 'Error loading audio';
    });
});
