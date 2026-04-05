
// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDvWj4j1xJ4X1xJ4X1xJ4X1xJ4X1xJ4X1xJ4",
    authDomain: "mystery-chat-roulette.firebaseapp.com",
    projectId: "mystery-chat-roulette",
    storageBucket: "mystery-chat-roulette.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890abcdef"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Game state
let currentUser = null;
let currentRoom = null;
let currentLanguage = 'en';
let translations = {
    en: {
        main_menu_title: "Main Menu",
        create_room: "Create Room",
        join_room: "Join Room",
        change_language: "Change Language",
        // Add all other English translations
    },
    fr: {
        main_menu_title: "Menu Principal",
        create_room: "Créer une Salle",
        join_room: "Rejoindre une Salle",
        change_language: "Changer de Langue",
        // Add all other French translations
    }
};

// Initialize the app
function initApp() {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem('gameLanguage');
    if (savedLanguage) {
        currentLanguage = savedLanguage;
        showMainMenu();
    } else {
        document.getElementById('language-screen').classList.remove('hidden');
    }
    
    // Set up Firebase auth state listener
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            // User is signed in anonymously
        } else {
            // Sign in anonymously
            auth.signInAnonymously().catch((error) => {
                console.error("Anonymous sign-in error:", error);
            });
        }
    });
}

// Language functions
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('gameLanguage', lang);
    applyTranslations();
    showMainMenu();
}

function toggleLanguage() {
    const newLang = currentLanguage === 'en' ? 'fr' : 'en';
    setLanguage(newLang);
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });
}

// Screen navigation functions
function showMainMenu() {
    document.getElementById('language-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    applyTranslations();
}

function showCreateRoom() {
    // Implement create room logic
}

function showJoinRoom() {
    // Implement join room logic
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);