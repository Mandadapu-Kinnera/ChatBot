document.addEventListener('DOMContentLoaded', function() {
    const voiceBtn = document.getElementById('voice-btn');
    const userInput = document.getElementById('user-input');
    let recognition;
    
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        voiceBtn.addEventListener('click', function() {
            if (voiceBtn.classList.contains('recording')) {
                recognition.stop();
                voiceBtn.classList.remove('recording');
                voiceBtn.innerHTML = '<img src="/static/icons/mic.svg" alt="Voice input">';
            } else {
                try {
                    recognition.start();
                    voiceBtn.classList.add('recording');
                    voiceBtn.innerHTML = '<i class="fas fa-circle" style="color: red;"></i>';
                } catch (e) {
                    console.error('Speech recognition error:', e);
                }
            }
        });
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            voiceBtn.classList.remove('recording');
            voiceBtn.innerHTML = '<img src="/static/icons/mic.svg" alt="Voice input">';
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error', event.error);
            voiceBtn.classList.remove('recording');
            voiceBtn.innerHTML = '<img src="/static/icons/mic.svg" alt="Voice input">';
        };
        
        recognition.onend = function() {
            if (voiceBtn.classList.contains('recording')) {
                voiceBtn.classList.remove('recording');
                voiceBtn.innerHTML = '<img src="/static/icons/mic.svg" alt="Voice input">';
            }
        };
    } else {
        voiceBtn.style.display = 'none';
        console.log('Speech recognition not supported');
    }
});