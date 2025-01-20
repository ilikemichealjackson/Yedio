document.addEventListener('DOMContentLoaded', function() {
    const audioPlayer = document.getElementById('audioPlayer');
    const playButton = document.getElementById('playButton');
    const songTitle = document.getElementById('songTitle');
    const volumeControl = document.getElementById('volume');
    const clockElement = document.getElementById('clock');
    const coverArtElement = document.getElementById('coverArt');

    const regularSongs = [
        { name: '30 Hours.mp3', duration: 323, coverArt: 'covers/tlop.png' },
        { name: 'Believe What I Say.mp3', duration: 242, coverArt: 'covers/donda.png' },
        { name: 'I Thought About Killing You.mp3', duration: 274, coverArt: 'covers/ye.png' },
        { name: 'So Soon.mp3', duration: 147, coverArt: 'covers/y3.png' },
        { name: 'Field Trip.mp3', duration: 192, coverArt: 'covers/Vultures 2.png' },
        { name: 'Gun To My Head.mp3', duration: 350, coverArt: 'covers/Vultures 2.png' },
        { name: 'God Level.mp3', duration: 250, coverArt: 'covers/tlop.png' },
        { name: 'Mr Miyagi.mp3', duration: 148, coverArt: 'covers/donda 2.png' },
        { name: 'Dead.mp3', duration: 207, coverArt: 'covers/Vultures 2.png' },
        { name: 'Happy.mp3', duration: 286, coverArt: 'covers/donda 2.png' },
        { name: 'Pablo.mp3', duration: 334, coverArt: 'covers/donda 2.png' },
        { name: 'Fade.mp3', duration: 193, coverArt: 'covers/tlop.png' },
        { name: 'Can U Be.mp3', duration: 366, coverArt: 'covers/tlop.png' },
        { name: 'FUK SUM.mp3', duration: 162, coverArt: 'covers/yesuke.png' },
        { name: 'Fried.mp3', duration: 196, coverArt: 'covers/yesuke.png' },
        { name: 'Time Flies.mp3', duration: 238, coverArt: 'covers/yesuke.png' },
        { name: 'Unlock.mp3', duration: 215, coverArt: 'covers/yesuke.png' },
        { name: 'Dont.mp3', duration: 154, coverArt: 'covers/yesuke.png' },
        { name: 'Make It Feel Right.mp3', duration: 189, coverArt: 'covers/yesuke.png' },
    ];

    const unreleasedSongs = [
        { name: 'Mr Miyagi.mp3', duration: 148, coverArt: 'covers/donda 2.png' },
        { name: 'Happy.mp3', duration: 286, coverArt: 'covers/donda 2.png' },
        { name: 'Pablo.mp3', duration: 334, coverArt: 'covers/donda 2.png' },
        { name: 'Can U Be.mp3', duration: 366, coverArt: 'covers/tlop.png' },
        
    ];
    const nightVibeSongs = [...regularSongs];

    let currentSongs = regularSongs;
    let currentSongIndex = -1;
    let isPlaying = false;

    function getUniversalTimestamp() {
        return Math.floor(Date.now() / 1000);
    }

    function getTotalDuration(songs) {
        return songs.reduce((total, song) => total + song.duration, 0);
    }

    function syncPlayback() {
        const timestamp = getUniversalTimestamp();
        const totalDuration = getTotalDuration(currentSongs);
        let currentTime = timestamp % totalDuration;
        
        let newSongIndex = 0;
        for (let i = 0; i < currentSongs.length; i++) {
            if (currentTime < currentSongs[i].duration) {
                newSongIndex = i;
                break;
            }
            currentTime -= currentSongs[i].duration;
        }

        if (newSongIndex !== currentSongIndex || audioPlayer.paused) {
            currentSongIndex = newSongIndex;
            const song = currentSongs[currentSongIndex];
            audioPlayer.src = `/songs/${song.name}`;
            audioPlayer.currentTime = currentTime;

            updateSongInfo(song);

            if (isPlaying) {
                const playPromise = audioPlayer.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error('Playback failed:', error);
                    });
                }
            }
        }
    }

    function updateSongInfo(song) {
        songTitle.textContent = song.name.replace('.mp3', '');
        coverArtElement.src = song.coverArt;
        console.log(`Now playing: ${song.name}, at ${audioPlayer.currentTime.toFixed(2)} seconds`);
    }

    function startSync() {
        syncPlayback();
        // Sync every second to keep accurate timing
        setInterval(syncPlayback, 1000);
    }

    function togglePlayPause() {
        if (isPlaying) {
            audioPlayer.pause();
            isPlaying = false;
            playButton.textContent = 'Play';
        } else {
            isPlaying = true;
            playButton.textContent = 'Pause';
            syncPlayback();
        }
    }

    playButton.addEventListener('click', togglePlayPause);

    volumeControl.addEventListener('input', (e) => {
        audioPlayer.volume = e.target.value;
    });

    function checkSpecialEvents() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        
        // Convert to PST (assuming the server is in UTC)
        const pstHours = (hours - 8 + 24) % 24;
        
        if (pstHours === 17 && minutes === 0) {
            console.log("Starting unreleased songs event");
            currentSongs = unreleasedSongs.length > 0 ? unreleasedSongs : regularSongs;
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
        });
        isPlaying = true;
        playButton.textContent = 'Pause';
        songTitle.textContent = 'Event Announcement';
        
        audioPlayer.onended = () => {
            syncPlayback();
            audioPlayer.onended = null;
        };
    }

    // Update clock
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        clockElement.textContent = timeString;
    }

    // Check for special events every minute
    setInterval(checkSpecialEvents, 60000);

    // Update clock every second
    setInterval(updateClock, 1000);
    updateClock(); // Initial update

    // Start syncing playback
    startSync();

    // Initialize
    songTitle.textContent = 'Click Play to Start';

    // Error handling for audio loading
    audioPlayer.addEventListener('error', function(e) {
        console.error('Audio Error:', e);
        songTitle.textContent = 'Error loading audio';
    });
});

