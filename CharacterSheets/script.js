// Pobieranie hasła z pliku txt za pomocą Fetch API
function getPassword() {
    return fetch('password.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error('Problem z pobraniem hasła.');
            }
            return response.text();
        });
}

// Funkcja sprawdzająca hasło
function checkPassword() {
    var inputPassword = document.getElementById('password').value;

    getPassword().then(password => {
        if (inputPassword === password.trim()) {
            // Jeśli hasło jest poprawne, zapisz wybór z rozwijanej listy w localStorage
            var selectedOption = document.getElementById('passwordOptions').value;
            localStorage.setItem('selectedPdf', selectedOption);

            // Przekieruj użytkownika na podstronę
            window.location.href = 'CharacterSheets.html';
        } else {
            // Jeśli hasło jest niepoprawne, wyświetl komunikat o błędzie
            alert('Błędne hasło. Spróbuj ponownie.');
        }
    }).catch(error => {
        // Obsługa błędu pobierania hasła
        console.error('Wystąpił problem:', error);
        alert('Wystąpił problem z pobraniem hasła. Spróbuj ponownie później.');
    });
}

// Dodanie obsługi zdarzenia dla przycisku Submit
document.querySelector('button[type="submit"]').addEventListener('click', function(event) {
    event.preventDefault(); // Zapobieganie domyślnej akcji przycisku Submit (wysłanie formularza)
    checkPassword(); // Sprawdzanie hasła
});