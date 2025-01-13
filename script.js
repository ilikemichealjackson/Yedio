document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');

    const audioPlayer = document.getElementById('audioPlayer');
    const playButton = document.getElementById('playButton');
    const songTitle = document.getElementById('songTitle');
    const volumeControl = document.getElementById('volume');

    // Define songs and state variables first
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

    // Debug logging for audio element
    console.log('Audio element found:', audioPlayer !== null);

    // Add comprehensive error handling for audio
    audioPlayer.addEventListener('error', function(e) {
        console.error('Audio Error:', e);
        console.error('Error code:', e.target.error.code);
        console.error('Audio source:', audioPlayer.src);
        songTitle.textContent = 'Error loading audio';
    });

    audioPlayer.addEventListener('loadstart', function() {
        console.log('Audio loading started');
        songTitle.textContent = 'Loading...';
    });

    audioPlayer.addEventListener('canplay', function() {
        console.log('Audio can play');
        if (currentSongIndex !== -1) {
            songTitle.textContent = currentSongs[currentSongIndex].replace('.mp3', '');
        }
    });

    function playRandomSong() {
        console.log('Attempting to play random song');
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * currentSongs.length);
        } while (newIndex === currentSongIndex && currentSongs.length > 1);
        
        currentSongIndex = newIndex;
        const song = currentSongs[currentSongIndex];
        console.log('Selected song:', song);
        
        try {
            // Use absolute path from root
            const audioPath = `/songs/${song}`;
            console.log('Audio path:', audioPath);
            audioPlayer.src = audioPath;
            
            const playPromise = audioPlayer.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('Playback started successfully');
                        isPlaying = true;
                        playButton.textContent = 'Pause';
                        songTitle.textContent = song.replace('.mp3', '');
                    })
                    .catch(error => {
                        console.error('Playback failed:', error);
                        isPlaying = false;
                        playButton.textContent = 'Play';
                        songTitle.textContent = 'Click Play to Start';
                    });
            }
        } catch (error) {
            console.error('Error in playRandomSong:', error);
            songTitle.textContent = 'Error loading audio';
        }
    }

    function togglePlayPause() {
        console.log('Toggle play/pause');
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
                            console.log('Playback resumed successfully');
                            isPlaying = true;
                            playButton.textContent = 'Pause';
                        })
                        .catch(error => {
                            console.error('Resume playback failed:', error);
                            isPlaying = false;
                            playButton.textContent = 'Play';
                        });
                }
            }
        }
    }

    function checkSpecialEvents() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const pstHours = (hours - 8 + 24) % 24;
        
        console.log('Checking special events, PST Hour:', pstHours);
        
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
            playRandomSong();
            audioPlayer.onended = null;
        };
    }

    // Add event listeners
    playButton.addEventListener('click', togglePlayPause);
    audioPlayer.addEventListener('ended', playRandomSong);
    volumeControl.addEventListener('input', (e) => {
        audioPlayer.volume = e.target.value;
    });

    // Check for special events every minute
    setInterval(checkSpecialEvents, 60000);

    // Don't auto-play, wait for user interaction
    songTitle.textContent = 'Click Play to Start';
    console.log('Setup complete');
});
