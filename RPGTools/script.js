var musicMap;
var currentCategory = "";
var musicAudioPlayer;
var tempMusicAudioPlayer;
var currentMusicPlayer;
var globalVolume = 1.0;
var fadeDelay = 1500;
var worldsPrefixesMap = new Map();
var worldPrefix = "f_";
var worldsButtonsArray = ["Fantasy", "Vampire", "Pirate", "London 1888", "Mandela Catalogue", "SPECIAL"];

function playRandomSong(category)
{   
    var newSongName;
    var randomIndex;
    var songName = $("#songName");
    
    var firstTry = true;
    do
    {
        if(!firstTry) console.log(`Same! = ${songName.text()}`);
        firstTry = false;
        randomIndex = Math.floor(Math.random() * musicMap.get(category).length);
        newSongName = (musicMap.get(category)[randomIndex]).replace('.mp3', '');
        if (musicMap.get(category).length == 1) break;
    } while(songName.text() == newSongName);

    songName.text((musicMap.get(category)[randomIndex]).replace('.mp3', ''));
    var audioUrl = `Audio/${category.replace(worldPrefix, "")}/${musicMap.get(category)[randomIndex]}`;

    if(musicAudioPlayer[0].paused){
        currentMusicPlayer = musicAudioPlayer;
        tempMusicAudioPlayer.animate({volume: 0}, fadeDelay, function() {
            tempMusicAudioPlayer[0].pause();
        });
        musicAudioPlayer[0].src = audioUrl;
        musicAudioPlayer[0].play();
        musicAudioPlayer[0].volume = 0;
        musicAudioPlayer.animate({volume: globalVolume}, fadeDelay);
        return;
    }

    if(tempMusicAudioPlayer[0].paused){
        currentMusicPlayer = tempMusicAudioPlayer;
        musicAudioPlayer.animate({volume: 0}, fadeDelay, function() {
            musicAudioPlayer[0].pause();
        });
        tempMusicAudioPlayer[0].src = audioUrl;
        tempMusicAudioPlayer[0].play();
        tempMusicAudioPlayer[0].volume = 0;
        tempMusicAudioPlayer.animate({volume: globalVolume}, fadeDelay);
        return;
    }
}

var styleMap = new Map();
styleMap.set(`f_`, {'border-color': 'gold','background-color': 'rgb(252, 255, 70)','color': 'gold'});
styleMap.set(`v_`, {'border-color': 'red','background-color': '#630000','color': 'red'});
styleMap.set(`p_`, {'border-color': '#4390DA','background-color': '#053B6F','color': '#4390DA'});
styleMap.set(`S_`, {'border-color': 'gray','background-color': '#CFCFCF','color': 'silver'});
styleMap.set(`l_`, {'border-color': '#46CE46','background-color': '#90EE90','color': '#46CE46'});
styleMap.set(`m_`, {'border-color': 'red','background-color': '#630000','color': 'red'});


function generateGenreButtons(categories)
{
    var genresPanel = $('#genresPanel');
    $.each(categories, function(index, name) { //tworzenie przycisków i dodawanie do genresPanel
        if(name.includes(worldPrefix))
        {
            var button = $('<button>').text(name.replace(worldPrefix, "")).attr('class', 'GenreButton'); // Tworzenie przycisku
            let styleString = styleMap.get(worldPrefix);
            button.css(styleString);
            button.click(function() { //obsługa zdarzenia onlick
                var category = categories[index];
                currentCategory = category;
                paused = false;
                playRandomSong(currentCategory);
            });
            genresPanel.append(button);
        }
    });
}

$(document).ready(function() {
    //--Worlds Map Handle--//
    worldsPrefixesMap.set('Fantasy', 'f_');
    worldsPrefixesMap.set('Vampire', 'v_');
    worldsPrefixesMap.set('Pirate', 'p_');
    worldsPrefixesMap.set('SPECIAL', 'S_');
    worldsPrefixesMap.set('London 1888', 'l_');
    worldsPrefixesMap.set('Mandela Catalogue', 'm_');

    //--JSON handle--//
    const data = JSON.parse(folderStructureJSONString);
    musicMap = new Map(Object.entries(data));
    const categories = [...musicMap.keys()];

    //--UI--//
    var worldsPanel = $('#worldsPanel');
    var worldsButton = $('<button>').attr('id', 'worldsButton'); // Dodawanie przycisku worldsButton na koniec worldsPanel z obrazkiem
    var img = $('<img>').attr('src', 'worlds_button.png').attr('alt', 'Toggle Icon'); // Dodanie obrazka
    img.css("width", "60px");
    worldsButton.append(img); // Dodanie obrazka do przycisku
    worldsPanel.append(worldsButton);
    $('#worldsButton').click(function() {
        if ($('#worldsPanel').css('left') === '-250px') {
            $('#worldsPanel').css('left', '0'); // Wysuwaj panel
        } else {
            $('#worldsPanel').css('left', '-250px'); // Schowaj panel
        }
    });
    $.each(worldsButtonsArray, function(index, name) {// Tworzenie przycisków i dodawanie ich do worldsPanel
        var button = $('<button>').text(name).attr('class', 'WorldButton');
        button.click(function() { //obsługa zdarzenia onlick
            worldPrefix = worldsPrefixesMap.get(worldsButtonsArray[index]);
            $('.GenreButton').remove();
            generateGenreButtons(categories);
            let songName = $("#songName");
            songName.css(styleMap.get(worldPrefix))
            songName.css('background-color' , '#00000000');
        });
        worldsPanel.append(button);
    });

    generateGenreButtons(categories);

    var volumeSlider = $("#volume-slider");
    var playPauseButton = $('#playPauseButton');
    var stopButton = $('#stopButton');

    //--Audio--//
    musicAudioPlayer = $("#audioPlayer");
    musicAudioPlayer[0].volume = 1;
    tempMusicAudioPlayer = $("#tempAudioPlayer");
    tempMusicAudioPlayer[0].volume = 1;
    currentMusicPlayer = musicAudioPlayer;
    volumeSlider.on("input", function(){
        musicAudioPlayer[0].volume = $(this).val();
        tempMusicAudioPlayer[0].volume = $(this).val();
        globalVolume = $(this).val();
        console.log(musicAudioPlayer[0].volume);
    });
    playPauseButton.click(function() {
        if(currentMusicPlayer[0].paused)
        {
            $("#playPauseButton").prop("disabled", true);
            currentMusicPlayer[0].play();
            currentMusicPlayer.animate({volume: globalVolume}, fadeDelay, function() {
                $("#playPauseButton").prop("disabled", false);
            });
        }
        else
        {
            $("#playPauseButton").prop("disabled", true);
            currentMusicPlayer.animate({volume: 0}, fadeDelay, function() {
                currentMusicPlayer[0].pause();
                $("#playPauseButton").prop("disabled", false);
            });
        }
    });
    stopButton.click(function() {
        $("#playPauseButton").prop("disabled", true);
        $("#stopButton").prop("disabled", true);
        currentMusicPlayer.stop();
        currentMusicPlayer[0].volume = globalVolume;
        currentMusicPlayer.animate({volume: 0}, fadeDelay); 
        currentMusicPlayer.animate({volume: 0}, fadeDelay, function() {
            currentMusicPlayer[0].pause();
            currentMusicPlayer[0].currentTime = 0;
            $("#playPauseButton").prop("disabled", false);
            $("#stopButton").prop("disabled", false);
        });
    });
    musicAudioPlayer.on('ended', function() { //po zakończeniu utworu zrób...
        playRandomSong(currentCategory, musicAudioPlayer);
    });
    tempMusicAudioPlayer.on('ended', function() { //po zakończeniu utworu zrób...
        playRandomSong(currentCategory, tempMusicAudioPlayer);
    });
});

var folderStructureJSONString = `{
    "TEST": [
        "badumts.mp3",
        "badudu.mp3"
    ],
    "f_Action": [
        "19 - The Witcher 2 Score - Easier Said Than Killed (Extended).mp3",
        "30 - The Witcher 2 Score - Violence (Extended).mp3",
        "37 - The Witcher 2 Score - The Assassin Looms (Extended).mp3",
        "52 - The Witcher 2 Score - The Scent of Battle (Extended).mp3",
        "Baldur's Gate OST -  Main Theme.mp3",
        "Baldur's Gate OST - Attacked by Assassins.mp3",
        "Baldur's Gate OST - Bandit Melee.mp3",
        "Baldur's Gate OST - From Out of the Storm.mp3",
        "Baldur's Gate OST - Gorion's Battle.mp3",
        "Blood on the Cobblestones.mp3",
        "City of Intrigues.mp3",
        "Commanding The Fury.mp3",
        "Final Fantasy Tactics OST - Battle on the Bridge.mp3",
        "Forged in Fire.mp3",
        "Guild Wars 2 Living Story Season 2 OST - Shadow of the Dragon.mp3",
        "Guild Wars 2 OST - 02. The Seraph.mp3",
        "Guild Wars 2 OST - 2009 Teaser Trailer music edit.mp3",
        "Guild Wars 2 OST - 41. Blighted Battleground.mp3",
        "Guild Wars 2 OST - 47. The Saga of the Norn.mp3",
        "Guild Wars 2 OST - 60. The Charr Triumphant.mp3",
        "Guild Wars 2 OST - 67. The Pact.mp3",
        "Guild Wars 2 OST - 69. The Hammer Falls.mp3",
        "Guild Wars 2 OST - 74. March of the Legions.mp3",
        "Guild Wars 2 OST - 75. Here be Dragons.mp3",
        "Guild Wars 2 OST - 76. Scales of Issormir.mp3",
        "Guild Wars 2 OST - Battle on the Breachmaker (Scarlet Briar).mp3",
        "Guild Wars 2 OST - Here be Dragons (Game Version).mp3",
        "Hunt or Be Hunted.mp3",
        "Igni.mp3",
        "On the Champs Desoles.mp3",
        "Pillars of Eternity Soundtrack 20 - Combat B (Justin Bell).mp3",
        "Pillars of Eternity Soundtrack 23 - Combat E (Justin Bell).mp3",
        "TES V Skyrim Soundtrack - Blood and Steel.mp3",
        "TES V Skyrim Soundtrack - Dragonborn (Theme) (2).mp3",
        "TES V Skyrim Soundtrack - One They Fear.mp3",
        "TES V Skyrim Soundtrack - Watch the Skies.mp3",
        "The Beast of Beauclair.mp3",
        "The House Of The Borsodis.mp3",
        "The Hunt is Coming.mp3",
        "The Witcher 2 Assassins of Kings - Battle Music.mp3",
        "The Shrieker Contract.mp3",
        "Widow maker.mp3",
        "Sousou no Frieren OST -  Zoltraak  by Evan Call.mp3"
    ],
    "f_Fear": [
        "03 - Dark Discovery - James Horner - Aliens.mp3",
        "04 - LV 426 - James Horner - Aliens.mp3",
        "06 - The Complex - James Horner - Aliens.mp3",
        "12 - Face Huggers - James Horner - Aliens.mp3",
        "14 - Newt Is Taken - James Horner - Aliens.mp3",
        "Baldur's Gate OST - Down to the Sewers.mp3",
        "Baldur's Gate OST - Even Deeper.mp3",
        "Gothic 2 Soundtrack - 01 Titel Theme.mp3",
        "Gothic 2 Soundtrack - 04 Ingame Music.mp3",
        "Gothic 2 Soundtrack - 26 Fish Food.mp3",
        "Gothic 3 -- OST 03 'Xardas Tower Indoor'.mp3",
        "Gothic 3 -- OST 27 'Death Valley'.mp3",
        "Gothic 3 -- OST 29 'Beliar'.mp3",
        "Gothic 3 -- OST 35 'Spooky'.mp3",
        "Gothic 3 -- OST 37 'Dungeon'.mp3",
        "Gothic 3 -- OST 40 'Ominous Woods at Night'.mp3",
        "Guild Wars 2 Living Story Season 2 OST - Meeting the Asura.mp3",
        "Guild Wars 2 Living Story Season 2 OST - The Priory Archives.mp3",
        "Guild Wars 2 OST - 33. Smodur the Unflinching.mp3",
        "Guild Wars 2 OST - 35. Change Versus Comfort.mp3",
        "Guild Wars 2 OST - 52. Almora's Revelation.mp3",
        "Guild Wars 2 OST - 68. Adelbern's Ghost.mp3",
        "Guild Wars 2 OST - 70. The Heart of Rata Sum.mp3",
        "Guild Wars 2 OST - 72. Malchor's Leap.mp3",
        "In The Giant's Shadow.mp3",
        "Pillars of Eternity Soundtrack 11 - Heritage Hill (Justin Bell).mp3",
        "Pillars of Eternity Soundtrack 12 - Engwithan Ruins (Justin Bell).mp3",
        "Seeking Resonance.mp3",
        "TES V Skyrim Soundtrack - Caught off Guard.mp3",
        "TES V Skyrim Soundtrack - Death in the Darkness.mp3",
        "TES V Skyrim Soundtrack - Night without Stars.mp3",
        "TES V Skyrim Soundtrack - Shattered Shields.mp3",
        "What Lies Unseen.mp3",
        "Whatsoever A Man Soweth.mp3"
    ],
    "f_Glory": [
        "Guild Wars 2 Living Story Season 2 OST - The Gathering of the Pact.mp3",
        "Guild Wars 2 Living Story Season 2 OST - The World Summit.mp3",
        "Guild Wars 2 OST - 01. Overture.mp3",
        "Guild Wars 2 OST - Dragon Bash Main Theme.mp3",
        "Guild Wars 2 OST - Sanctum Sprint (Bazaar of the Four Winds).mp3"
    ],
    "f_Inn": [
        "Divinity Original Sin 2 OST   18 Amber Ale.mp3",
        "Divinity Original Sin 2 OST   26 Sebilles Theme.mp3",
        "Gothic 3 -- OST 25 'Ishtar'.mp3",
        "Gothic 3 -- OST 44 'Trelis at Night'.mp3",
        "Guild Wars 2 OST - Dragon Bash Bash the Dragon.mp3",
        "Guild Wars 2 OST - Dragon Bash Spawn the Dragon.mp3",
        "Guild Wars 2 OST - Maklain the Minstrel.mp3",
        "Human Tavern Music.mp3",
        "Irish tavern music by Gaelic Storm.mp3",
        "KRCMA U PAVOUKA  - MEDIEVAL TAVERN IN PRAGUE.mp3",
        "Merchants of Novigrad.mp3",
        "Pillars of Eternity Soundtrack 17 - Inn A (Justin Bell).mp3",
        "Pillars of Eternity Soundtrack 18 - Inn B (Justin Bell).mp3",
        "Pirate Tavern Music.mp3",
        "Tavern music.mp3",
        "TES V Skyrim Soundtrack - Around the Fire.mp3",
        "TES V Skyrim Soundtrack - Out of the Cold.mp3",
        "TES V Skyrim Soundtrack - The Bannered Mare.mp3",
        "The Mandragora.mp3",
        "The Musty Scent of Fresh Pate.mp3",
        "The Witcher OST - Evening in the Tavern (extended).mp3",
        "The Witcher Soundtrack - Tavern at the End of World.mp3",
        "The Wolven Storm (English).mp3",
        "Warcraft Tavern Songs- Thunderbrew.mp3",
        "Sousou no Frieren A Well-Earned Celebration.mp3",
        "Sousou no Frieren Grassy Turtles and Seed Rats.mp3",
        "Sousou no Frieren OST -  A Well-Earned Celebration  by Evan Call.mp3",
        "Sousou no Frieren OST -  Grassy Turtles and Seed Rats  by Evan Call.mp3",
        "Sousou no Frieren Time Flows Ever Onward.mp3",
        "Sousou no Frieren Zoltraak_Tavern.mp3"
    ],
    "f_Mysterious": [
        "Bad News Ahead Full.mp3",
        "Baldur's Gate OST - Stealth in the Bandit Camp.mp3",
        "Baldur's Gate OST - The Dream.mp3",
        "Divinity Original Sin 2 OST   28 Embrace of the Deathfog.mp3",
        "Divinity Original Sin 2 OST   29 Fanes Theme.mp3",
        "Family Matters.mp3",
        "Go Back Whence You Came.mp3",
        "Gothic 2 Soundtrack - 02 Installation Theme.mp3",
        "Gothic 2 Soundtrack - 09 Lesters Valley.mp3",
        "Gothic 3 -- OST 06 'Xardas Tower Surrounding'.mp3",
        "Guild Wars 2 Living Story Season 2 OST -  The Nightmare Court.mp3",
        "Guild Wars 2 Living Story Season 2 OST - Arid Vista 2.mp3",
        "Guild Wars 2 Living Story Season 2 OST - The Fall of the Zephyrites.mp3",
        "Guild Wars 2 Living Story Season 2 OST - The Mordrem.mp3",
        "Guild Wars 2 OST - 17. Ventari's Legacy.mp3",
        "Guild Wars 2 OST - 28. Straits of Devastation.mp3",
        "Guild Wars 2 OST - 29. Kormir's Whispers.mp3",
        "Guild Wars 2 OST - 31. Zojja and Mr. Sparkles.mp3",
        "Guild Wars 2 OST - 45. Melandru's Calm.mp3",
        "Guild Wars 2 OST - 51. Bandits' Expanse.mp3",
        "Guild Wars 2 OST - 63. Journey to the Mists.mp3",
        "Guild Wars 2 OST - 65. Of Tides and Quaggan.mp3",
        "Guild Wars 2 OST - 73. Sparkfly Fen.mp3",
        "Guild Wars 2 OST - Labyrinthine Cliffs (Bazaar of the Four Winds).mp3",
        "Pillars of Eternity Soundtrack 10 - Encampment (Justin Bell).mp3",
        "Pillars of Eternity Soundtrack 13 - Temple of Skaen (Justin Bell).mp3",
        "Pillars of Eternity Soundtrack 14 - Temple of Woedica (Justin Bell).mp3",
        "Pillars of Eternity Soundtrack 15 - Od Nua A (Justin Bell).mp3",
        "Pillars of Eternity Soundtrack 16 - Od Nua B (Justin Bell).mp3",
        "Witch Hunters.mp3"
    ],
    "f_Mystic": [
        "Baldur's Gate OST - The Lady's House.mp3",
        "Divinity Original Sin 2 OST   38 Mysterious Trails.mp3",
        "Fanfares and Flowers.mp3",
        "Gothic 2 Soundtrack - 07 Lobards Farm.mp3",
        "Gothic 3 -- OST 51 'Soultravel'.mp3",
        "Guild Wars 2 Living Story Season 2 OST - Rebuilding of Lion's Arch.mp3",
        "Guild Wars 2 Living Story Season 2 OST - The Newly Awakened.mp3",
        "Guild Wars 2 OST - 18. Tears of Stars.mp3",
        "Guild Wars 2 OST - 22. Farahr.mp3",
        "Guild Wars 2 OST - 24. Zhaitan.mp3",
        "Guild Wars 2 OST - 36. A Land Restored.mp3",
        "Guild Wars 2 OST - 40. Sunrise Over Astorea.mp3",
        "Guild Wars 2 OST - 56. Promenade of the Gods.mp3",
        "Guild Wars 2 OST - 57. Hope Falls.mp3",
        "Guild Wars 2 OST - 58. The Vaults of the Priory.mp3",
        "I Name Thee Dea And Embrace Thee As My Daughter.mp3",
        "Lady of the Lake.mp3",
        "Pillars of Eternity Soundtrack 05 - Oldsong (Justin Bell).mp3",
        "Pillars of Eternity Soundtrack 09 - Elmshore (Justin Bell).mp3",
        "Skellige Isle Ambient Music 1.mp3",
        "TES V Skyrim Soundtrack - Before the Storm.mp3",
        "TES V Skyrim Soundtrack - Beneath the Ice.mp3",
        "TES V Skyrim Soundtrack - Unbound.mp3",
        "TES V Skyrim Soundtrack - Wind Guide You.mp3",
        "The Temple Of Lilvani.mp3",
        "Trial Of The Grasses.mp3",
        "Words On Wind.mp3"
    ],
    "f_Peaceful": [
        "Ard Skellig Village.mp3",
        "Assassin's Creed IV Black Flag OST - 26 - Confrontation.mp3",
        "Baldur's Gate OST - Safe in Beregost.mp3",
        "Bonnie At Morn Instrumental.mp3",
        "Divinity Original Sin 2 OST   14 Power of Innocence 2017.mp3",
        "Divinity Original Sin 2 OST   15 Reapers Coast.mp3",
        "Divinity Original Sin 2 OST   16 Rivellon Light.mp3",
        "Divinity Original Sin 2 OST   19 Driftwood.mp3",
        "Divinity Original Sin 2 OST   20 Path of the Godwoken.mp3",
        "Divinity Original Sin 2 OST   22 Path of the Godwoken Bansuri.mp3",
        "Divinity Original Sin 2 OST   23 Path of the Godwoken Oud.mp3",
        "Divinity Original Sin 2 OST   24 Path of the Godwoken Cello.mp3",
        "Divinity Original Sin 2 OST   27 Divines Lament.mp3",
        "Divinity Original Sin 2 OST   32 Red Prince.mp3",
        "Divinity Original Sin 2 OST   34 Sins and Gods Strings.mp3",
        "Divinity Original Sin 2 OST   39 Quirky Bones Murky.mp3",
        "Divinity Original Sin 2 OST   41 Sins and Gods Revelation.mp3",
        "Divinity Original Sin 2 OST   43 Your Tale Awaits You Down the Road.mp3",
        "Final Fantasy Tactics OST - Algus.mp3",
        "Final Fantasy Tactics OST - Alma's Theme.mp3",
        "Final Fantasy Tactics OST - Antidote.mp3",
        "Final Fantasy Tactics OST - Bland Logo - Title Back.mp3",
        "Gothic 3 -- OST 04 'Vista Point'.mp3",
        "Gothic 3 -- OST 33 'Idyllic'.mp3",
        "Guild Wars 2 Living Story Season 2 OST - Camp Resolve.mp3",
        "Guild Wars 2 Living Story Season 2 OST - Crystal Oasis Redux.mp3",
        "Guild Wars 2 Living Story Season 2 OST - Drytop.mp3",
        "Guild Wars 2 Living Story Season 2 OST - The Arid Sands.mp3",
        "Guild Wars 2 Living Story Season 2 OST - The Golden Cave.mp3",
        "Guild Wars 2 Living Story Season 2 OST - The Silverwastes.mp3",
        "Guild Wars 2 OST - 03. Bear's Spirit.mp3",
        "Guild Wars 2 OST - 05. Out of the Dream.mp3",
        "Guild Wars 2 OST - 08. Eir's Solitude.mp3",
        "Guild Wars 2 OST - 11. The Sea of Sorrows.mp3",
        "Guild Wars 2 OST - 15. Farren's Theme.mp3",
        "Guild Wars 2 OST - 16. Ruins of an Empire.mp3",
        "Guild Wars 2 OST - 23. The Tengu Wall.mp3",
        "Guild Wars 2 OST - 25. Lornar's Pass.mp3",
        "Guild Wars 2 OST - 26. Dawn in Shaemoor.mp3",
        "Guild Wars 2 OST - 38. The Shiverpeaks.mp3",
        "Guild Wars 2 OST - 44. Journey Through Caledon.mp3",
        "Guild Wars 2 OST - 46. The Stars Shine on Kryta.mp3",
        "Guild Wars 2 OST - 48. The Last Great City of Men.mp3",
        "Guild Wars 2 OST - 77. Trahearne's Reverie.mp3",
        "Guild Wars 2 OST - Pale Tree Chamber.mp3",
        "Guild Wars 2 OST - Pale Tree Elevator.mp3",
        "Kaer Morhen.mp3",
        "Pillars of Eternity Soundtrack 02 - Dyrford (Justin Bell).mp3",
        "Pillars of Eternity Soundtrack 04 - Gilded Vale (Justin Bell).mp3",
        "Pillars of Eternity Soundtrack 06 - Ondra's Gift (Justin Bell).mp3",
        "Pillars of Eternity Soundtrack 07 - Twin Elms (Justin Bell).mp3",
        "Spikeroog.mp3",
        "TES V Skyrim Soundtrack - A Chance Meeting.mp3",
        "TES V Skyrim Soundtrack - Ancient Stones.mp3",
        "TES V Skyrim Soundtrack - From Past to Present.mp3",
        "The Banks of the Sansretour.mp3",
        "The Fields of Ard Skellig.mp3",
        "The Moon over Mount Gorgon.mp3",
        "The Slopes of the Blessure.mp3",
        "The Vagabond.mp3",
        "The Tree When We Sat Once.mp3",
        "When No Man Has Gone Before.mp3",
        "Whispers of Oxenfurt Instrumental.mp3",
        "Yes, I Do.mp3",
        "Sousou no Frieren OST -  Departures  by Evan Call.mp3",
        "Sousou no Frieren OST -  Farewell, My Friend  by Evan Call.mp3",
        "Sousou no Frieren OST -  For 1000 Years  by Evan Call.mp3",
        "Sousou no Frieren OST -  One Last Adventure  by Evan Call.mp3",
        "Sousou no Frieren OST -  The End of One Journey  by Evan Call.mp3",
        "Sousou no Frieren OST -  Time Flows Ever Onward  by Evan Call.mp3",
        "Sousou no Frieren OST -  Where the Blue-Moon Weed Grows  by Evan Call.mp3"
    ],
    "f_Sad": [
        "Frédéric Chopin - Prelude in E-Minor (op.28 no. 4).mp3",
        "Guild Wars 2 OST - Fear Not This Night (Full Piano Version).mp3",
        "Mozart - Lacrimosa.mp3",
        "Remo Giazotto - Adagio In G Minor For Strings And Organ..mp3",
        "Sad Violin.mp3",
        "Tchaikovsky - None But The Lonely Hearts.mp3"
    ],
    "v_Action": [
        "19 - The Witcher 2 Score - Easier Said Than Killed (Extended).mp3",
        "30 - The Witcher 2 Score - Violence (Extended).mp3",
        "37 - The Witcher 2 Score - The Assassin Looms (Extended).mp3",
        "52 - The Witcher 2 Score - The Scent of Battle (Extended).mp3",
        "Baldur's Gate OST -  Main Theme.mp3",
        "Baldur's Gate OST - Attacked by Assassins.mp3",
        "Baldur's Gate OST - Bandit Melee.mp3",
        "Baldur's Gate OST - From Out of the Storm.mp3",
        "Baldur's Gate OST - Gorion's Battle.mp3",
        "Blood on the Cobblestones.mp3",
        "City of Intrigues.mp3",
        "Commanding The Fury.mp3",
        "Final Fantasy Tactics OST - Battle on the Bridge.mp3",
        "Forged in Fire.mp3",
        "Guild Wars 2 Living Story Season 2 OST - Shadow of the Dragon.mp3",
        "Guild Wars 2 OST - 02. The Seraph.mp3",
        "Guild Wars 2 OST - 2009 Teaser Trailer music edit.mp3",
        "Guild Wars 2 OST - 41. Blighted Battleground.mp3",
        "Guild Wars 2 OST - 47. The Saga of the Norn.mp3",
        "Guild Wars 2 OST - 60. The Charr Triumphant.mp3",
        "Guild Wars 2 OST - 67. The Pact.mp3",
        "Guild Wars 2 OST - 69. The Hammer Falls.mp3",
        "Guild Wars 2 OST - 74. March of the Legions.mp3",
        "Guild Wars 2 OST - 75. Here be Dragons.mp3",
        "Guild Wars 2 OST - 76. Scales of Issormir.mp3",
        "Guild Wars 2 OST - Battle on the Breachmaker (Scarlet Briar).mp3",
        "Guild Wars 2 OST - Here be Dragons (Game Version).mp3",
        "Hunt or Be Hunted.mp3",
        "Igni.mp3",
        "On the Champs Desoles.mp3",
        "Pillars of Eternity Soundtrack 20 - Combat B (Justin Bell).mp3",
        "Pillars of Eternity Soundtrack 23 - Combat E (Justin Bell).mp3",
        "TES V Skyrim Soundtrack - Blood and Steel.mp3",
        "TES V Skyrim Soundtrack - Dragonborn (Theme) (2).mp3",
        "TES V Skyrim Soundtrack - One They Fear.mp3",
        "TES V Skyrim Soundtrack - Watch the Skies.mp3",
        "The Beast of Beauclair.mp3",
        "The House Of The Borsodis.mp3",
        "The Hunt is Coming.mp3",
        "The Witcher 2 Assassins of Kings - Battle Music.mp3",
        "The Shrieker Contract.mp3",
        "Widow maker.mp3"
    ],
    "v_Fear": [
        "03 - Dark Discovery - James Horner - Aliens.mp3",
        "04 - LV 426 - James Horner - Aliens.mp3",
        "06 - The Complex - James Horner - Aliens.mp3",
        "12 - Face Huggers - James Horner - Aliens.mp3",
        "14 - Newt Is Taken - James Horner - Aliens.mp3",
        "Baldur's Gate OST - Down to the Sewers.mp3",
        "Baldur's Gate OST - Even Deeper.mp3",
        "Gothic 2 Soundtrack - 01 Titel Theme.mp3",
        "Gothic 2 Soundtrack - 04 Ingame Music.mp3",
        "Gothic 2 Soundtrack - 26 Fish Food.mp3",
        "Gothic 3 -- OST 03 'Xardas Tower Indoor'.mp3",
        "Gothic 3 -- OST 27 'Death Valley'.mp3",
        "Gothic 3 -- OST 29 'Beliar'.mp3",
        "Gothic 3 -- OST 35 'Spooky'.mp3",
        "Gothic 3 -- OST 37 'Dungeon'.mp3",
        "Gothic 3 -- OST 40 'Ominous Woods at Night'.mp3",
        "Guild Wars 2 Living Story Season 2 OST - Meeting the Asura.mp3",
        "Guild Wars 2 Living Story Season 2 OST - The Priory Archives.mp3",
        "Guild Wars 2 OST - 33. Smodur the Unflinching.mp3",
        "Guild Wars 2 OST - 35. Change Versus Comfort.mp3",
        "Guild Wars 2 OST - 52. Almora's Revelation.mp3",
        "Guild Wars 2 OST - 68. Adelbern's Ghost.mp3",
        "Guild Wars 2 OST - 70. The Heart of Rata Sum.mp3",
        "Guild Wars 2 OST - 72. Malchor's Leap.mp3",
        "In The Giant's Shadow.mp3",
        "Pillars of Eternity Soundtrack 11 - Heritage Hill (Justin Bell).mp3",
        "Pillars of Eternity Soundtrack 12 - Engwithan Ruins (Justin Bell).mp3",
        "Seeking Resonance.mp3",
        "TES V Skyrim Soundtrack - Caught off Guard.mp3",
        "TES V Skyrim Soundtrack - Death in the Darkness.mp3",
        "TES V Skyrim Soundtrack - Night without Stars.mp3",
        "TES V Skyrim Soundtrack - Shattered Shields.mp3",
        "What Lies Unseen.mp3",
        "Whatsoever A Man Soweth.mp3"
    ],
    "v_Glory": [
        "Guild Wars 2 Living Story Season 2 OST - The Gathering of the Pact.mp3",
        "Guild Wars 2 Living Story Season 2 OST - The World Summit.mp3",
        "Guild Wars 2 OST - 01. Overture.mp3",
        "Guild Wars 2 OST - Dragon Bash Main Theme.mp3",
        "Guild Wars 2 OST - Sanctum Sprint (Bazaar of the Four Winds).mp3"
    ],
    "v_Inn": [
        "Allegro.mp3",
        "Clementi.mp3",
        "Jomelli.mp3",
        "Larghetto.mp3",
        "Muzio.mp3",
        "Rutini.mp3"
    ],
    "v_Mysterious": [
        "Bad News Ahead Full.mp3",
        "Baldur's Gate OST - The Dream.mp3",
        "Dark Vampiric Music - The Last Vampire.mp3",
        "Family Matters.mp3",
        "Go Back Whence You Came.mp3",
        "Lulaby1.mp3",
        "Lulaby10.mp3",
        "Lulaby2.mp3",
        "Lulaby3.mp3",
        "Lulaby4.mp3",
        "Lulaby5.mp3",
        "Lulaby6.mp3",
        "Lulaby7.mp3",
        "Lulaby8.mp3",
        "Lulaby9.mp3",
        "myszy.mp3",
        "Pillars of Eternity Soundtrack 10 - Encampment (Justin Bell).mp3",
        "Pillars of Eternity Soundtrack 14 - Temple of Woedica (Justin Bell).mp3",
        "Pillars of Eternity Soundtrack 15 - Od Nua A (Justin Bell).mp3",
        "Pillars of Eternity Soundtrack 16 - Od Nua B (Justin Bell).mp3",
        "Toccata and Fugue in D Minor.mp3",
        "Vampire Calm.mp3",
        "Vampire Calm2.mp3",
        "Vampire Mystery.mp3",
        "Witch Hunters.mp3"
    ],
    "v_Mystic": [
        "Baldur's Gate OST - The Lady's House.mp3",
        "Divinity Original Sin 2 OST   38 Mysterious Trails.mp3",
        "Fanfares and Flowers.mp3",
        "Gothic 2 Soundtrack - 07 Lobards Farm.mp3",
        "Gothic 3 -- OST 51 'Soultravel'.mp3",
        "Guild Wars 2 Living Story Season 2 OST - Rebuilding of Lion's Arch.mp3",
        "Guild Wars 2 Living Story Season 2 OST - The Newly Awakened.mp3",
        "Guild Wars 2 OST - 18. Tears of Stars.mp3",
        "Guild Wars 2 OST - 22. Farahr.mp3",
        "Guild Wars 2 OST - 24. Zhaitan.mp3",
        "Guild Wars 2 OST - 36. A Land Restored.mp3",
        "Guild Wars 2 OST - 40. Sunrise Over Astorea.mp3",
        "Guild Wars 2 OST - 56. Promenade of the Gods.mp3",
        "Guild Wars 2 OST - 57. Hope Falls.mp3",
        "Guild Wars 2 OST - 58. The Vaults of the Priory.mp3",
        "I Name Thee Dea And Embrace Thee As My Daughter.mp3",
        "Lady of the Lake.mp3",
        "Pillars of Eternity Soundtrack 05 - Oldsong (Justin Bell).mp3",
        "Pillars of Eternity Soundtrack 09 - Elmshore (Justin Bell).mp3",
        "Skellige Isle Ambient Music 1.mp3",
        "TES V Skyrim Soundtrack - Before the Storm.mp3",
        "TES V Skyrim Soundtrack - Beneath the Ice.mp3",
        "TES V Skyrim Soundtrack - Unbound.mp3",
        "TES V Skyrim Soundtrack - Wind Guide You.mp3",
        "The Temple Of Lilvani.mp3",
        "Trial Of The Grasses.mp3",
        "Words On Wind.mp3"
    ],
    "v_Peaceful": [
        "Ard Skellig Village.mp3",
        "Assassin's Creed IV Black Flag OST - 26 - Confrontation.mp3",
        "Baldur's Gate OST - Safe in Beregost.mp3",
        "Bonnie At Morn Instrumental.mp3",
        "Divinity Original Sin 2 OST   14 Power of Innocence 2017.mp3",
        "Divinity Original Sin 2 OST   15 Reapers Coast.mp3",
        "Divinity Original Sin 2 OST   16 Rivellon Light.mp3",
        "Divinity Original Sin 2 OST   19 Driftwood.mp3",
        "Divinity Original Sin 2 OST   20 Path of the Godwoken.mp3",
        "Divinity Original Sin 2 OST   22 Path of the Godwoken Bansuri.mp3",
        "Divinity Original Sin 2 OST   23 Path of the Godwoken Oud.mp3",
        "Divinity Original Sin 2 OST   24 Path of the Godwoken Cello.mp3",
        "Divinity Original Sin 2 OST   27 Divines Lament.mp3",
        "Divinity Original Sin 2 OST   32 Red Prince.mp3",
        "Divinity Original Sin 2 OST   34 Sins and Gods Strings.mp3",
        "Divinity Original Sin 2 OST   39 Quirky Bones Murky.mp3",
        "Divinity Original Sin 2 OST   41 Sins and Gods Revelation.mp3",
        "Divinity Original Sin 2 OST   43 Your Tale Awaits You Down the Road.mp3",
        "Final Fantasy Tactics OST - Algus.mp3",
        "Final Fantasy Tactics OST - Alma's Theme.mp3",
        "Final Fantasy Tactics OST - Antidote.mp3",
        "Final Fantasy Tactics OST - Bland Logo - Title Back.mp3",
        "Gothic 3 -- OST 04 'Vista Point'.mp3",
        "Gothic 3 -- OST 33 'Idyllic'.mp3",
        "Guild Wars 2 Living Story Season 2 OST - Camp Resolve.mp3",
        "Guild Wars 2 Living Story Season 2 OST - Crystal Oasis Redux.mp3",
        "Guild Wars 2 Living Story Season 2 OST - Drytop.mp3",
        "Guild Wars 2 Living Story Season 2 OST - The Arid Sands.mp3",
        "Guild Wars 2 Living Story Season 2 OST - The Golden Cave.mp3",
        "Guild Wars 2 Living Story Season 2 OST - The Silverwastes.mp3",
        "Guild Wars 2 OST - 03. Bear's Spirit.mp3",
        "Guild Wars 2 OST - 05. Out of the Dream.mp3",
        "Guild Wars 2 OST - 08. Eir's Solitude.mp3",
        "Guild Wars 2 OST - 11. The Sea of Sorrows.mp3",
        "Guild Wars 2 OST - 15. Farren's Theme.mp3",
        "Guild Wars 2 OST - 16. Ruins of an Empire.mp3",
        "Guild Wars 2 OST - 23. The Tengu Wall.mp3",
        "Guild Wars 2 OST - 25. Lornar's Pass.mp3",
        "Guild Wars 2 OST - 26. Dawn in Shaemoor.mp3",
        "Guild Wars 2 OST - 38. The Shiverpeaks.mp3",
        "Guild Wars 2 OST - 44. Journey Through Caledon.mp3",
        "Guild Wars 2 OST - 46. The Stars Shine on Kryta.mp3",
        "Guild Wars 2 OST - 48. The Last Great City of Men.mp3",
        "Guild Wars 2 OST - 77. Trahearne's Reverie.mp3",
        "Guild Wars 2 OST - Pale Tree Chamber.mp3",
        "Guild Wars 2 OST - Pale Tree Elevator.mp3",
        "Kaer Morhen.mp3",
        "Pillars of Eternity Soundtrack 02 - Dyrford (Justin Bell).mp3",
        "Pillars of Eternity Soundtrack 04 - Gilded Vale (Justin Bell).mp3",
        "Pillars of Eternity Soundtrack 06 - Ondra's Gift (Justin Bell).mp3",
        "Pillars of Eternity Soundtrack 07 - Twin Elms (Justin Bell).mp3",
        "Spikeroog.mp3",
        "TES V Skyrim Soundtrack - A Chance Meeting.mp3",
        "TES V Skyrim Soundtrack - Ancient Stones.mp3",
        "TES V Skyrim Soundtrack - From Past to Present.mp3",
        "The Banks of the Sansretour.mp3",
        "The Fields of Ard Skellig.mp3",
        "The Moon over Mount Gorgon.mp3",
        "The Slopes of the Blessure.mp3",
        "The Vagabond.mp3",
        "The Tree When We Sat Once.mp3",
        "When No Man Has Gone Before.mp3",
        "Whispers of Oxenfurt Instrumental.mp3",
        "Yes, I Do.mp3"
    ],
    "v_Sad": [
        "Frédéric Chopin - Prelude in E-Minor (op.28 no. 4).mp3",
        "Guild Wars 2 OST - Fear Not This Night (Full Piano Version).mp3",
        "Mozart - Lacrimosa.mp3",
        "Remo Giazotto - Adagio In G Minor For Strings And Organ..mp3",
        "Sad Violin.mp3",
        "Tchaikovsky - None But The Lonely Hearts.mp3"
    ],
    "p_Action": [
        "Assassin's Creed IV Black Flag Main Theme Epic.mp3",
        "Assassin's Creed IV Black Flag OST - 02 - Pyrates Beware.mp3",
        "Assassin's Creed IV Black Flag OST - 04 - The High Seas.mp3",
        "Assassin's Creed IV Black Flag OST - 22 - Batten Down the Hatches.mp3",
        "Assassin's Creed IV Black Flag OST - 27 - Prizes Plunder and Adventure-00.mp3",
        "Assassin's Creed IV Black Flag OST - 27 - Prizes Plunder and Adventure-01.mp3",
        "Assassin's Creed IV Black Flag OST - 32 - Ships of Legend.mp3",
        "LEGO Pirates of the Caribbean Music - Action 1 Evil.mp3",
        "LEGO Pirates of the Caribbean Music - Action 1 Heroic.mp3",
        "LEGO Pirates of the Caribbean Music - Action 1.mp3",
        "LEGO Pirates of the Caribbean Music - Action 2 Evil.mp3",
        "LEGO Pirates of the Caribbean Music - Action 2 Heroic.mp3",
        "LEGO Pirates of the Caribbean Music - Dutchman Escape.mp3",
        "LEGO Pirates of the Caribbean Music - London.mp3",
        "LEGO Pirates of the Caribbean Music - Pelegosto.mp3",
        "LEGO Pirates of the Caribbean Music - Ponce de Leon Battle.mp3",
        "LEGO Pirates of the Caribbean Music - Singapore Battle.mp3",
        "LEGO Pirates of the Caribbean Music - The Maelstrom.mp3",
        "Pirates of the Caribbean - Soundtr 05 - Swords Crossed.mp3",
        "Pirates of the Caribbean - Will and Elizabeth.mp3"
    ],
    "p_Fear": [
        "LEGO Pirates of the Caribbean Music - Isla de Muerta.mp3",
        "LEGO Pirates of the Caribbean Music - Jack's Island 2.mp3",
        "LEGO Pirates of the Caribbean Music - Up River.mp3"
    ],
    "p_Glory": [
        "Guild Wars 2 Living Story Season 2 OST - The Gathering of the Pact.mp3",
        "Guild Wars 2 Living Story Season 2 OST - The World Summit.mp3",
        "Guild Wars 2 OST - 01. Overture.mp3",
        "Guild Wars 2 OST - Dragon Bash Main Theme.mp3",
        "Guild Wars 2 OST - Sanctum Sprint (Bazaar of the Four Winds).mp3"
    ],
    "p_Inn": [
        "Guild Wars 2 OST - Dragon Bash Bash the Dragon.mp3",
        "Human Tavern Music.mp3",
        "Irish tavern music by Gaelic Storm.mp3",
        "LEGO Pirates of the Caribbean Music - Tortuga.mp3",
        "LEGO Pirates of the Caribbean Music - Two Horn Pipes.mp3",
        "Pirate Tavern Music.mp3",
        "Tavern music.mp3"
    ],
    "p_Mysterious": [
        "Assassin's Creed Black Flag.mp3",
        "Assassin's Creed IV Black Flag OST - 11 - The Buccaneers.mp3",
        "Assassin's Creed IV Black Flag OST - 29 - Into the Jungle.mp3",
        "Divinity Original Sin 2 OST   09 Dancing with the Source.mp3",
        "Divinity Original Sin 2 OST   12 Dancing with the Source Bansuri.mp3",
        "Divinity Original Sin 2 OST  13 Dancing with the Source Oud.mp3",
        "LEGO Pirates of the Caribbean Music - Shipwreck Cove.mp3",
        "LEGO Pirates of the Caribbean Music - The Locker.mp3",
        "LEGO Pirates of the Caribbean Music - White Cap.mp3"
    ],
    "p_Mystic": [
        "Tribal Instrumental Music-01.mp3",
        "Tribal Instrumental Music-02.mp3",
        "Tribal Instrumental Music-03.mp3",
        "Tribal Instrumental Music-04.mp3",
        "Tribal Instrumental Music-05.mp3",
        "Tribal Instrumental Music-06.mp3",
        "Tribal Instrumental Music-07.mp3",
        "Tribal Instrumental Music-08.mp3",
        "Tribal Instrumental Music-09.mp3",
        "Tribal Instrumental Music-10.mp3"
    ],
    "p_Peaceful": [
        "Assassin's Creed IV Black Flag Main Theme.mp3",
        "Assassin's Creed IV Black Flag OST - 06 - In This World or the One Below.mp3",
        "Assassin's Creed IV Black Flag OST - 10 - Fare Thee Well.mp3",
        "Assassin's Creed IV Black Flag OST - 11 - The Buccaneers.mp3",
        "Assassin's Creed IV Black Flag OST - 13 - Last Goodbyes.mp3",
        "Assassin's Creed IV Black Flag OST - 21 - The British Empire.mp3",
        "Assassin's Creed IV Black Flag OST - 24 - A Merry Life and a Short One.mp3",
        "Assassin's Creed IV Black Flag OST - 28 - Meet the Sage.mp3",
        "Assassin's Creed IV Black Flag OST - 30 - The Spanish Empire.mp3",
        "Divinity Original Sin 2 OST   05 Welcome to Fort Joy.mp3",
        "Divinity Original Sin 2 OST   06 A Single Drop of Magic.mp3",
        "Divinity Original Sin 2 OST   07 Reflections from the Past.mp3",
        "Divinity Original Sin 2 OST   08 Quirky Bones.mp3",
        "Divinity Original Sin 2 OST   10 Dancing with the Source Cello.mp3",
        "Divinity Original Sin 2 OST   11 Dancing with the Source Tambura.mp3",
        "Divinity Original Sin 2 OST   21 Path of the Godwoken Tambura.mp3",
        "Heroes Orchestra - COVE - #HOWeek 3 7   4K.mp3",
        "I see dead people in boats.mp3",
        "LEGO Pirates of the Caribbean Music - Jack's Island 1.mp3",
        "LEGO Pirates of the Caribbean Music - Loading.mp3",
        "LEGO Pirates of the Caribbean Music - Ponce de Leon.mp3",
        "LEGO Pirates of the Caribbean Music - Singapore.mp3",
        "LEGO Pirates of the Caribbean Music - Uneasy.mp3",
        "Pirates Of The Caribbean (Calm Ambient Mix by Syneptic)   Episode V-00.mp3",
        "Pirates Of The Caribbean (Calm Ambient Mix by Syneptic)   Episode V-01.mp3",
        "Pirates Of The Caribbean (Calm Ambient Mix by Syneptic)   Episode V-02.mp3",
        "Pirates Of The Caribbean (Calm Ambient Mix by Syneptic)   Episode V-03.mp3",
        "Pirates Of The Caribbean (Calm Ambient Mix by Syneptic)   Episode V-04.mp3",
        "Pirates Of The Caribbean (Calm Ambient Mix by Syneptic)   Episode V-05.mp3",
        "Pirates Of The Caribbean (Calm Ambient Mix by Syneptic)   Episode V-06.mp3",
        "To the pirates cove.mp3"
    ],
    "p_Sad": [
        "Frédéric Chopin - Prelude in E-Minor (op.28 no. 4).mp3",
        "Guild Wars 2 OST - Fear Not This Night (Full Piano Version).mp3",
        "Mozart - Lacrimosa.mp3",
        "Remo Giazotto - Adagio In G Minor For Strings And Organ..mp3",
        "Sad Violin.mp3",
        "Tchaikovsky - None But The Lonely Hearts.mp3"
    ],
    "l_Action":[
        "Assassin's Creed IV Black Flag OST - 22 - Batten Down the Hatches.mp3",
        "Assassin's Creed IV Black Flag OST - 27 - Prizes Plunder and Adventure-00.mp3",
        "Assassin's Creed IV Black Flag OST - 27 - Prizes Plunder and Adventure-01.mp3",
        "Assassin's Creed IV Black Flag OST - 32 - Ships of Legend.mp3",
        "Franek313 - Sherlock Action.mp3"
    ],
    "l_Mysterious": [
        "Victorian London - Mansion.mp3",
        "Victorian London - Murder Mystery.mp3",
        "Victorian London - Mystery.mp3"
    ],
    "m_Action":[
        "Kill Bill OST - Battle Without Honor Or Humanity.mp3",
        "Scarface - Push It To The Limit.mp3"
    ],
    "m_Peaceful" : [
        "Cyndi Lauper - Time After Time.mp3",
        "Berlin - Take My Breath Away.mp3",
        "The Cars - Drive.mp3",
        "Pet Shop Boys - West End Girls.mp3",
        "Tears For Fears - Shout.mp3",
        "Madonna - Borderline.mp3",
        "Phil Collins - In The Air Tonight.mp3",
        "Eurythmics - Sweet Dreams.mp3",
        "True Colors - Instrumental.mp3",
        "Bronski Beat - Smalltown Boy.mp3",
        "David Bowie - Fame.mp3",
        "Tears For Fears - Everybody Wants To Rule The World.mp3",
        "The Police - Every Breath You Take.mp3"
    ],
    "m_Fear" : [
        "Mandela Catalogue - Ambient_2.mp3",
        "Mandela Catalogue - Hello, Adam.mp3",
        "Mandela Catalogue - My Guardian Angel.mp3",
        "Mandela Catalogue - Repass.mp3",
        "XFiles - Forest Search.mp3",
        "XFiles - Night Forest.mp3",
        "XFiles - Weather Balloons.mp3",
        "XFiles - Ain't Dead Yet.mp3",
        "XFiles - Buttoning Up.mp3",
        "XFiles - Confrontation.mp3"
    ],
    "m_Glory" : [
        "Mandela Catalogue - Marines Hymn.mp3"
    ],
    "m_Mysterious" : [
        "Mandela Catalogue - Dear Ruth.mp3",
        "Mandela Catalogue - The Two of Us.mp3",
        "XFiles - UFO Technology.mp3",
        "XFiles - Attached.mp3",
        "XFiles - Bug Tales.mp3",
        "XFiles - Arrival In Town.mp3"
    ],
    "m_Mystic" : [
        "XFiles - Aerial Burial.mp3",
        "XFiles - Another X-File.mp3"
    ],
    "S_Alternate":[
        "Mandela Catalogue - Ambient_1.mp3",
        "Mandela Catalogue - Thatcher's Theme.mp3",
        "Mandela Catalogue - Afraid of Your own Reflection.mp3",
        "Mandela Catalogue - Face Studio 2.mp3",
        "Mandela Catalogue - Alternate Sounds.mp3"
    ],
    "S_Dagan": [
        "Tonal Chaos Trailers - Toccata (Dagan Theme).mp3"
    ],
    "S_Kraken": [
        "kraken_theme.mp3"
    ],
    "S_Pucci": [
        "JJBA Pucci Theme - Epic.mp3"
    ],
    "S_Transformation": [
        "Shrek - Transformation.mp3"
    ],
    "S_Utena": [
        "GOMG - Kakattekinasai - Extended Ver.mp3",
        "GOMG - Nyanyashichau.mp3"
    ],
    "S_Vordt": [
        "Dark Souls III OST - Vordt of the Boreal Valley [Phase 2 Extended].mp3"
    ],
    "S_Zepelli": [
        "JJBA Phantom Blood - Zepelli Theme.mp3"
    ],
    "S_Zoltraak": [
        "Frieren OST — Zoltraak Extended Ver.mp3"
    ],
    "S_Mortal Combat": [
        "Techno Syndrome (Mortal Kombat) Song by The Immortals.mp3"
    ]
}`;