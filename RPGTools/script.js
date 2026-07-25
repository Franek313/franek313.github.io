var musicAudioPlayer;
var tempMusicAudioPlayer;
var currentMusicPlayer;
var rainAudioPlayer;
var tempRainAudioPlayer;
var currentRainPlayer;
var currentWeather = 'no';
var globalVolume = 1.0;
var rainVolume = 0.1;

var fadeDelay = 1500;
var rainfadeDelay = 1500;

var musicMap;
var categories;
var currentCategory = "";
var worldsPrefixesMap = new Map();
var worldPrefix = "f_";
var worldsButtonsArray = ["Fantasy", "Vampire", "Pirate", "London 1888", "Kult", "Western", "Action 80s", "SPECIAL"];

var styleMap = new Map();
styleMap.set(`f_`, { 'border-color': 'gold', 'background-color': 'rgb(252, 255, 70)', 'color': 'gold' });
styleMap.set(`v_`, { 'border-color': 'red', 'background-color': '#630000', 'color': 'red' });
styleMap.set(`p_`, { 'border-color': '#4390DA', 'background-color': '#053B6F', 'color': '#4390DA' });
styleMap.set(`S_`, { 'border-color': 'gray', 'background-color': '#CFCFCF', 'color': 'silver' });
styleMap.set(`l_`, { 'border-color': '#46CE46', 'background-color': '#90EE90', 'color': '#46CE46' });
styleMap.set(`k_`, { 'border-color': 'red', 'background-color': '#630000', 'color': 'red' });
styleMap.set(`w_`, { 'border-color': '#825531ff', 'background-color': '#C4A484', 'color': '#825531ff' });
styleMap.set(`a_`, { 'border-color': 'rgb(255, 116, 190)', 'background-color': '#ffafdb', 'color': 'rgb(255, 41, 177)' });

function playRandomSong(category, endedPlayer) {
    var newSongName;
    var randomIndex;
    var songName = $("#songName");

    var firstTry = true;
    do {
        if (!firstTry) console.log(`Same! = ${songName.text()}`);
        firstTry = false;
        randomIndex = Math.floor(Math.random() * musicMap.get(category).length);
        newSongName = (musicMap.get(category)[randomIndex]).replace('.mp3', '');
        if (musicMap.get(category).length == 1) break;
    } while (songName.text() == newSongName);

    songName.text((musicMap.get(category)[randomIndex]).replace('.mp3', ''));
    var audioUrl = `${DATA_SOURCE}Audio/${category.replace(worldPrefix, "")}/${musicMap.get(category)[randomIndex]}`;

    var incomingPlayer, outgoingPlayer;

    if (endedPlayer) {
        incomingPlayer = endedPlayer;
        outgoingPlayer = (endedPlayer === musicAudioPlayer) ? tempMusicAudioPlayer : musicAudioPlayer;
    } else if (musicAudioPlayer[0].paused) {
        incomingPlayer = musicAudioPlayer;
        outgoingPlayer = tempMusicAudioPlayer;
    } else if (tempMusicAudioPlayer[0].paused) {
        incomingPlayer = tempMusicAudioPlayer;
        outgoingPlayer = musicAudioPlayer;
    } else {
        incomingPlayer = (currentMusicPlayer === musicAudioPlayer) ? tempMusicAudioPlayer : musicAudioPlayer;
        outgoingPlayer = currentMusicPlayer;
        console.warn('playRandomSong: fallback - oba playery były "not paused", wybrano awaryjnie.');
    }

    currentMusicPlayer = incomingPlayer;

    outgoingPlayer.stop(true);
    incomingPlayer.stop(true);

    outgoingPlayer.animate({ volume: 0 }, fadeDelay, function () {
        outgoingPlayer[0].pause();
    });

    incomingPlayer[0].src = audioUrl;
    incomingPlayer[0].play();
    incomingPlayer[0].volume = 0;
    incomingPlayer.animate({ volume: globalVolume }, fadeDelay);
}

function generateGenreButtons(categories) {
    var genresPanel = $('#genresPanel');
    $.each(categories, function (index, name) {
        if (name.includes(worldPrefix)) {
            var button = $('<button>').text(name.replace(worldPrefix, "")).attr('class', 'GenreButton');
            let styleString = styleMap.get(worldPrefix);
            button.css(styleString);
            button.click(function () {
                var category = categories[index];
                currentCategory = category;
                paused = false;
                playRandomSong(currentCategory);
            });
            genresPanel.append(button);
        }
    });
}

$(document).ready(function () {

    //--Worlds Map Handle--//
    const worldsPrefixesMap = new Map([
        ['Fantasy', 'f_'],
        ['Vampire', 'v_'],
        ['Pirate', 'p_'],
        ['London 1888', 'l_'],
        ['Kult', 'k_'],
        ['Western', 'w_'],
        ['Action 80s', 'a_'],
        ['SPECIAL', 'S_']
    ]);

    let data;

    async function init() {
        const url = `${DATA_SOURCE}folder_structure.json`;

        console.log('USING: ', url);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
    }

    init().then(() => {
        console.log("Loaded data:", data);
        musicMap = new Map(Object.entries(data));
        categories = [...musicMap.keys()];
        generateGenreButtons(categories);
    }).catch(err => {
        console.error("Error while getting JSON:", err);
    });

    //--UI--//
    //--WORLDS PANEL--//
    var worldsPanel = $('#worldsPanel');
    var worldsButton = $('<button>').attr('id', 'worldsButton');
    var img = $('<img>').attr('src', `${DATA_SOURCE}worlds_button.png`).attr('alt', 'Toggle Icon');
    img.css("width", "60px");
    worldsButton.append(img);
    worldsPanel.append(worldsButton);
    $('#worldsButton').click(function () {
        if ($('#worldsPanel').css('left') === '-250px') {
            $('#worldsPanel').css('left', '0');
        } else {
            $('#worldsPanel').css('left', '-250px');
        }
    });

    $.each(worldsButtonsArray, function (index, name) {
        var button = $('<button>').text(name).attr('class', 'WorldButton');
        button.click(function () {
            worldPrefix = worldsPrefixesMap.get(worldsButtonsArray[index]);
            $('.GenreButton').remove();
            generateGenreButtons(categories);
            let songName = $("#songName");
            songName.css(styleMap.get(worldPrefix))
            songName.css('background-color', '#00000000');
        });
        worldsPanel.append(button);
    });

    //--EFFECTS PANEL--//
    const $effectsPanel = $('#effectsPanel');
    const $effectsButton = $('<button>', { id: 'effectsButton' });
    const $img = $('<img>', { src: `${DATA_SOURCE}effects_button.png`, alt: 'Toggle Icon' })
        .css('width', '60px');
    $effectsButton.append($img);
    $effectsPanel.append($effectsButton);
    $('#effectsButton').on('click', function () {
        if ($effectsPanel.css('right') === '0px') $effectsPanel.css('right', '-250px');
        else $effectsPanel.css('right', '0px');
    });

    // Rdzeń logiki: wykonuje crossfade na docelową pogodę (rain/thunder/storm/snowstorm),
    // niezależnie czy to jest zmiana pogody, czy zapętlenie TEJ SAMEJ pogody.
    function startRainCrossfade(weather) {
        const url = `${DATA_SOURCE}Audio/${weather}/${weather}.mp3`;

        var outgoingPlayer = currentRainPlayer;
        var incomingPlayer = (currentRainPlayer === rainAudioPlayer) ? tempRainAudioPlayer : rainAudioPlayer;

        // Usuwamy zaplanowane wcześniej sprawdzanie "końca utworu" z obu playerów,
        // żeby stare wywołania nie nawarstwiały się przy szybkiej zmianie pogody.
        outgoingPlayer.off('timeupdate.rainloop');
        incomingPlayer.off('timeupdate.rainloop');

        outgoingPlayer.stop(true);
        incomingPlayer.stop(true);

        outgoingPlayer.animate({ volume: 0 }, rainfadeDelay, function () {
            outgoingPlayer[0].pause();
        });

        incomingPlayer[0].src = url;
        incomingPlayer[0].volume = 0;
        incomingPlayer[0].play();
        incomingPlayer.animate({ volume: rainVolume }, rainfadeDelay);

        currentRainPlayer = incomingPlayer;
        currentWeather = weather;

        scheduleLoopCrossfade(incomingPlayer, weather);
    }

    // Nasłuchuje na bieżący czas odtwarzania i - gdy do końca pliku zostaje
    // dokładnie tyle, ile trwa fade (rainfadeDelay) - z WYPRZEDZENIEM odpala
    // crossfade na drugi player z tym samym plikiem. Dzięki temu pętla tego
    // samego dźwięku przenika się tak samo płynnie jak zmiana między pogodami,
    // zamiast czekać na 'ended' (czyli już PO fakcie, kiedy jest za późno na fade).
    function scheduleLoopCrossfade(player, weather) {
        var triggered = false;
        player.on('timeupdate.rainloop', function () {
            var audio = player[0];
            if (!audio.duration || isNaN(audio.duration)) return;
            var remainingMs = (audio.duration - audio.currentTime) * 1000;
            if (!triggered && remainingMs <= rainfadeDelay) {
                triggered = true;
                player.off('timeupdate.rainloop');
                // Tylko jeśli w międzyczasie użytkownik nie zmienił pogody na inną.
                if (currentWeather === weather) {
                    startRainCrossfade(weather);
                }
            }
        });
    }

    function playWeather(weather) {
        // "no" = cisza - wygaszamy to co aktualnie gra i przestajemy planować pętlę.
        if (weather === 'no') {
            currentWeather = 'no';
            rainAudioPlayer.off('timeupdate.rainloop');
            tempRainAudioPlayer.off('timeupdate.rainloop');
            currentRainPlayer.stop(true).animate({ volume: 0 }, rainfadeDelay, function () {
                currentRainPlayer[0].pause();
            });
            $('#songName').text('');
            return;
        }

        startRainCrossfade(weather);
    }

    var rainHolder = $('<div>', { id: 'rainHolder' });
    var weathers = ['no', 'rain', 'thunder', 'storm', 'snowstorm'];
    weathers.forEach(function (weather) {
        $('<button>', { class: 'RainButton' })
            .append($('<img>', { src: DATA_SOURCE + 'icon_' + weather + '.png' }))
            .appendTo(rainHolder)
            .on('click', function () {
                playWeather(weather);
            });
    });
    $effectsPanel.append(rainHolder);

    // === RAIN VOLUME SLIDER ===
    const $rainVolumeSlider = $('<input>', {
        type: 'range',
        id: 'brightnessSlider', // using same css as brightnessSlider
        min: 0,
        max: 100,
        value: 10,
        step: 1
    });

    $rainVolumeSlider.on('input', function () {
        const newVol = $(this).val() / 100;
        rainAudioPlayer[0].volume = newVol;
        tempRainAudioPlayer[0].volume = newVol;
        rainVolume = newVol;
    });

    $effectsPanel.append($('<div>').text('Rain volume').css('textAlign', 'center').append($rainVolumeSlider));

    if (ESP32_VERSION) {
        let selectedHue = 0;
        let selectedBrightness = 255;

        const $hueWrap = $('<div>').css({ textAlign: 'center', width: '100%' });
        const $briWrap = $('<div>').css({ textAlign: 'center', width: '100%' });

        const $hueLabel = $('<div>').text('Color').css({ marginBottom: '4px', color: '#fff' });
        const $hueSlider = $('<input>', { type: 'range', min: 0, max: 360, value: 0, id: 'colorSlider' })
            .css({ width: '90%', margin: '0 5%' });

        const $briLabel = $('<div>').text('Brightness').css({ marginBottom: '4px', color: '#fff' });
        const $briSlider = $('<input>', { type: 'range', min: 0, max: 255, value: 255, id: 'brightnessSlider' })
            .css({ width: '90%', margin: '0 5%' });

        $hueWrap.append($hueLabel, $hueSlider);
        $briWrap.append($briLabel, $briSlider);

        const $preview = $('<div>').css({
            width: '50px', height: '50px', margin: '10px auto',
            borderRadius: '8px', border: '1px solid #00000055', background: '#ff0000'
        });

        $effectsPanel.append($hueWrap, $briWrap, $preview);

        function hsvToRgb(h, s, v) {
            const c = v * s;
            const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
            const m = v - c;
            let r = 0, g = 0, b = 0;
            if (0 <= h && h < 60) { r = c; g = x; b = 0; }
            else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
            else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
            else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
            else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
            else { r = c; g = 0; b = x; }
            return {
                r: Math.round((r + m) * 255),
                g: Math.round((g + m) * 255),
                b: Math.round((b + m) * 255)
            };
        }
        function rgbToHex(r, g, b) { return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join(''); }

        function updatePreviewFromHSV() {
            const rgb = hsvToRgb(selectedHue, 1, 1);
            $preview.css('background', rgbToHex(rgb.r, rgb.g, rgb.b));
        }

        (function setHueSliderGradient(el) {
            const stops = [];
            for (let h = 0; h <= 360; h += 10) {
                const rgb = hsvToRgb(h, 1, 1);
                stops.push(`${rgbToHex(rgb.r, rgb.g, rgb.b)} ${(h / 360) * 100}%`);
            }
            el.style.background = `linear-gradient(to right, ${stops.join(',')})`;
        })($hueSlider[0]);

        function sendToEsp32() {
            const h8 = Math.round((selectedHue % 360) * 255 / 360);
            fetch(`/api/set?h=${h8}&br=${selectedBrightness}`).catch(e => console.warn(e));
        }

        $hueSlider.on('input', function () {
            selectedHue = +this.value;
            updatePreviewFromHSV();
        });
        $hueSlider.on('change', sendToEsp32);

        $briSlider.on('input', function () {
            selectedBrightness = +this.value;
        });
        $briSlider.on('change', sendToEsp32);

        updatePreviewFromHSV();
    }

    //--AUDIO CONTROLS--//
    var volumeSlider = $("#volume-slider");
    var playPauseButton = $('#playPauseButton');
    var stopButton = $('#stopButton');

    musicAudioPlayer = $("#audioPlayer");
    musicAudioPlayer[0].volume = 1;
    tempMusicAudioPlayer = $("#tempAudioPlayer");
    tempMusicAudioPlayer[0].volume = 1;

    rainAudioPlayer = $("#rainAudioPlayer");
    tempRainAudioPlayer = $("#tempRainAudioPlayer");
    currentRainPlayer = rainAudioPlayer;

    // Slider deszczu ma HTML "value" ustawiony domyślnie, ale to nie zmienia realnej
    // głośności audio - trzeba ją ustawić ręcznie na starcie, na OBU playerach deszczu.
    rainVolume = $rainVolumeSlider.val() / 100;
    rainAudioPlayer[0].volume = rainVolume;
    tempRainAudioPlayer[0].volume = rainVolume;

    currentMusicPlayer = musicAudioPlayer;
    volumeSlider.on("input", function () {
        musicAudioPlayer[0].volume = $(this).val();
        tempMusicAudioPlayer[0].volume = $(this).val();
        globalVolume = $(this).val();
        console.log(musicAudioPlayer[0].volume);
    });
    playPauseButton.click(function () {
        if (currentMusicPlayer[0].paused) {
            $("#playPauseButton").prop("disabled", true);
            currentMusicPlayer[0].play();
            currentMusicPlayer.animate({ volume: globalVolume }, fadeDelay, function () {
                $("#playPauseButton").prop("disabled", false);
            });
        }
        else {
            $("#playPauseButton").prop("disabled", true);
            currentMusicPlayer.animate({ volume: 0 }, fadeDelay, function () {
                currentMusicPlayer[0].pause();
                $("#playPauseButton").prop("disabled", false);
            });
        }
    });
    stopButton.click(function () {
        $("#playPauseButton").prop("disabled", true);
        $("#stopButton").prop("disabled", true);
        currentMusicPlayer.stop();
        currentMusicPlayer[0].volume = globalVolume;
        currentMusicPlayer.animate({ volume: 0 }, fadeDelay);
        currentMusicPlayer.animate({ volume: 0 }, fadeDelay, function () {
            currentMusicPlayer[0].pause();
            currentMusicPlayer[0].currentTime = 0;
            $("#playPauseButton").prop("disabled", false);
            $("#stopButton").prop("disabled", false);
        });
    });
    musicAudioPlayer.on('ended', function () {
        playRandomSong(currentCategory, musicAudioPlayer);
    });
    tempMusicAudioPlayer.on('ended', function () {
        playRandomSong(currentCategory, tempMusicAudioPlayer);
    });
});