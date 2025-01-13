document.addEventListener('DOMContentLoaded', function() {\

const audioPlayer = document.getElementById('audioPlayer');
const playButton = document.getElementById('playButton');
const songTitle = document.getElementById('songTitle');
const volumeControl = document.getElementById('volume');

// Add error handling for audio
    audioPlayer.addEventListener('error', function(e) {
        console.error('Error loading audio:', e);
        console.log('Audio source:', audioPlayer.src);
        songTitle.textContent = 'Error loading audio';
    });

    // Add loading state
    audioPlayer.addEventListener('loadstart', function() {
        songTitle.textContent = 'Loading...';
    });

    // Add ready state
    audioPlayer.addEventListener('canplay', function() {
        songTitle.textContent = currentSongs[currentSongIndex].replace('.mp3', '');
    });

    // Modify playRandomSong function
    function playRandomSong() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * currentSongs.length);
        } while (newIndex === currentSongIndex && currentSongs.length > 1);
        
        currentSongIndex = newIndex;
        const song = currentSongs[currentSongIndex];
        
        // Add error handling for file path
        try {
            const audioPath = `./songs/${song}`;
            audioPlayer.src = audioPath;
            
            // Create a promise to handle autoplay
            const playPromise = audioPlayer.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        isPlaying = true;
                        playButton.textContent = 'Pause';
                        songTitle.textContent = song.replace('.mp3', '');
                    })
                    .catch(error => {
                        console.error('Autoplay prevented:', error);
                        isPlaying = false;
                        playButton.textContent = 'Play';
                        songTitle.textContent = 'Click Play to Start';
                    });
            }
        } catch (error) {
            console.error('Error setting audio source:', error);
            songTitle.textContent = 'Error loading audio';
        }
    }

    // Modify togglePlayPause function
    function togglePlayPause() {
        if (isPlaying) {
            audioPlayer.pause();
            isPlaying = false;
            playButton.textContent = 'Play';
        } else {
            if (currentSongIndex === -1) {
                playRandomSong();
            } else {
                const playPromise = audioPlayer.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            isPlaying = true;
                            playButton.textContent = 'Pause';
                        })
                        .catch(error => {
                            console.error('Playback prevented:', error);
                            isPlaying = false;
                            playButton.textContent = 'Play';
                        });
                }
            }
        }
    }

const regularSongs = [
    '30 Hours.mp3',
    'Believe What I Say.mp3',
    'I Thought About Killing You.mp3',
    'So Soon.mp3',
    // Add more regular song filenames here
];

const unreleasedSongs = [
    // Add unreleased song filenames here
];

const nightVibeSongs = [
    '30 Hours.mp3',
    'Believe What I Say.mp3',
    'I Thought About Killing You.mp3',
    'So Soon.mp3',
    // Add more night vibe song filenames here
];

let currentSongs = regularSongs;
let currentSongIndex = -1;
let isPlaying = false;

function playRandomSong() {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * currentSongs.length);
    } while (newIndex === currentSongIndex && currentSongs.length > 1);
    
    currentSongIndex = newIndex;
    const song = currentSongs[currentSongIndex];
    
    audioPlayer.src = `songs/${song}`;
    audioPlayer.play();
    isPlaying = true;
    playButton.textContent = 'Pause';
    
    // Update song title (remove file extension)
    songTitle.textContent = song.replace('.mp3', '');
}

function togglePlayPause() {
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
        playButton.textContent = 'Play';
    } else {
        if (currentSongIndex === -1) {
            playRandomSong();
        } else {
            audioPlayer.play();
            isPlaying = true;
            playButton.textContent = 'Pause';
        }
    }
}

playButton.addEventListener('click', togglePlayPause);
audioPlayer.addEventListener('ended', playRandomSong);

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
        // 5-6 PM PST: Unreleased songs event
        console.log("Starting unreleased songs event");
        currentSongs = unreleasedSongs;
        playEventAnnouncement('unreleased_event.mp3');
    } else if (pstHours === 22 && minutes === 0) {
        // 10-11 PM PST: Night time vibe songs event
        console.log("Starting night time vibe songs event");
        currentSongs = nightVibeSongs;
        playEventAnnouncement('night_vibe_event.mp3');
    } else if ((pstHours === 18 && minutes === 0) || (pstHours === 23 && minutes === 0)) {
        // Return to regular songs after events
        console.log("Returning to regular programming");
        currentSongs = regularSongs;
        playEventAnnouncement('regular_programming.mp3');
    }
}

function playEventAnnouncement(announcementFile) {
    audioPlayer.src = `announcements/${announcementFile}`;
    audioPlayer.play();
    isPlaying = true;
    playButton.textContent = 'Pause';
    songTitle.textContent = 'Event Announcement';
    
    audioPlayer.onended = () => {
        playRandomSong();
        audioPlayer.onended = null;  // Reset the onended handler
    };
}

// Check for special events every minute
setInterval(checkSpecialEvents, 60000);

// Initial play to start the radio
playRandomSong();

});