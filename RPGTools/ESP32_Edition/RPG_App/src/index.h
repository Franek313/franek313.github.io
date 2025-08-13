#include <Arduino.h>

const char PAGE_INDEX[] PROGMEM = R"HTML(<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>RPG Tools</title>
    <!-- <link rel="stylesheet" type="text/css" href="https://franek313.github.io/RPGTools/rpg_styles.css"> -->
    <link rel="stylesheet" type="text/css" href="https://franek313.github.io/RPGTools/led_styles.css">
    <!-- <link rel="stylesheet" type="text/css" href="E:\franek313.github.io\RPGTools\ESP32_Edition\RPG_App\extras\led_styles.css"> -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://franek313.github.io/RPGTools/script.js"></script>
    <!-- <script src="E:/franek313.github.io/RPGTools/script.js"></script> -->
    <script src="https://rawcdn.githack.com/jbrems/color-wheel/master/dist/color-wheel.min.js"></script>

</head>

<body>
    <div id="main">
        <div id="songName">Press genre button to play music...</div>
        <div id="worldsPanel"></div>
        <div id="lightPanel"></div>
        <div id="genresPanel"></div>
        <div id="controlsPanel">
            <input type="range" id="volume-slider" min="0" max="1" step="0.01" value="1">
            <div id = "musicControls">
                <button class="controlButton" id="playPauseButton">&#9654</button>
                <button class="controlButton" id="stopButton">&#9632</button>
                <!-- <button class="controlButton" id="muteButton">M</button> -->
                <button class="controlButton" id="fullscreen-button">⛶</button>
            </div>
        </div>
        <audio id="audioPlayer" controls>
            Your browser does not support the audio element.
        </audio>
        <audio id="tempAudioPlayer" controls>
            Your browser does not support the audio element.
        </audio>
    </div>

    <script>
        // Funkcja do uruchamiania pełnoekranowego trybu
        function toggleFullscreen() {
            var elem = document.documentElement;
            if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement) {
                if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                } else if (elem.webkitRequestFullscreen) {
                    elem.webkitRequestFullscreen();
                } else if (elem.mozRequestFullScreen) {
                    elem.mozRequestFullScreen();
                } else if (elem.msRequestFullscreen) {
                    elem.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
        }

        // Dodanie obsługi zdarzenia kliknięcia do przycisku
        var fullscreenButton = document.getElementById('fullscreen-button');
        if (fullscreenButton) {
            fullscreenButton.addEventListener('click', function() {
                toggleFullscreen();
            });
        }
    </script>
</body>
</html>
)HTML";