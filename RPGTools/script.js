$(document).ready(function() {
    var buttonsArray = ["Fantasy", "Vampire", "Pirate"]; // Tablica nazw przycisków
    var sidePanel = $('#sidePanel');
    var centerPanel = $('#centerPanel');

    var button = $('<button>').text("TEST").attr('class', 'GenreButton').attr('id', 'playButton'); // Tworzenie przycisku
    button.click(function() {
        var audioUrl = "Audio/Action/Baldur's Gate OST - Attacked by Assassins.mp3";
        $("#audioPlayer").attr("src", audioUrl);
        $("#audioPlayer")[0].play();
    });
    centerPanel.append(button);

    // Tworzenie przycisków i dodawanie ich do sidePanel
    $.each(buttonsArray, function(index, name) {
        var button = $('<button>').text(name).attr('class', 'WorldButton'); // Tworzenie przycisku
        sidePanel.append(button); // Dodawanie przycisku do sidePanel
    });

    // Dodawanie przycisku toggleButton na koniec sidePanel z obrazkiem
    var toggleButton = $('<button>').attr('id', 'toggleButton');
    var img = $('<img>').attr('src', 'worlds_button.png').attr('alt', 'Toggle Icon'); // Dodanie obrazka
    img.css("width", "60px");
    toggleButton.append(img); // Dodanie obrazka do przycisku
    sidePanel.append(toggleButton);

    // Ustawienie event listenera dla toggleButton
    $('#toggleButton').click(function() {
        // Kod do wysuwania/ukrywania panelu
    });

    $('#toggleButton').click(function() {
        if ($('#sidePanel').css('left') === '-250px') {
            $('#sidePanel').css('left', '0'); // Wysuwaj panel
            $('#bottomPanel').css('left', '310px');
        } else {
            $('#sidePanel').css('left', '-250px'); // Schowaj panel
            $('#bottomPanel').css('left', '60px');
        }
    });

    
});
