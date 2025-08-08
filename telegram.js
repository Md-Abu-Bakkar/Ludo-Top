// Telegram WebApp integration
const tg = window.Telegram.WebApp;

function initTelegramApp() {
    // Expand the WebApp to full view
    tg.expand();
    
    // Get user data from Telegram
    const user = tg.initDataUnsafe.user;
    
    if (user) {
        // Update player info with Telegram user data
        const playerInfo = document.getElementById('playerInfo');
        playerInfo.innerHTML = `
            <p>Welcome, ${user.first_name} ${user.last_name || ''}</p>
            <p>Username: @${user.username || 'no_username'}</p>
        `;
        
        // In a real game, we would use this user info for the player
        // and potentially match them with other players
    }
    
    // Handle theme changes
    tg.onEvent('themeChanged', updateTheme);
    updateTheme();
    
    // Handle viewport changes
    tg.onEvent('viewportChanged', updateViewport);
    updateViewport();
    
    // Back button handling
    tg.onEvent('backButtonClicked', () => {
        tg.close();
    });
    
    // Show back button
    tg.BackButton.show();
}

function updateTheme() {
    document.body.className = tg.colorScheme; // 'light' or 'dark'
}

function updateViewport() {
    // Adjust UI based on available viewport size
    console.log('Viewport height:', tg.viewportHeight);
}

// Initialize Telegram integration when ready
if (tg.initDataUnsafe) {
    initTelegramApp();
} else {
    tg.ready();
    tg.onEvent('mainButtonClicked', initTelegramApp);
}
