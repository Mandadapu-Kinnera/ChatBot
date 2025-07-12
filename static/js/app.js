document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const fileUpload = document.getElementById('file-upload');
    const statusIndicator = document.getElementById('status-indicator');
    
    let currentFile = null;
    
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function addMessage(content, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${isUser ? 'user' : 'bot'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = `message-content ${isUser ? 'user-message' : 'bot-message'}`;
        messageContent.innerHTML = content;
        
        const timeSpan = document.createElement('div');
        timeSpan.className = 'message-time';
        timeSpan.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageContent.appendChild(timeSpan);
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        scrollToBottom();
    }
    
    function showTypingIndicator() {
        statusIndicator.style.display = 'flex';
        scrollToBottom();
    }
    
    function hideTypingIndicator() {
        statusIndicator.style.display = 'none';
    }
    
    fileUpload.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            currentFile = e.target.files[0];
            
            const filePreview = document.createElement('div');
            filePreview.className = 'file-preview';
            
            let fileIcon;
            switch (currentFile.type) {
                case 'application/pdf':
                    fileIcon = '<i class="fas fa-file-pdf"></i>';
                    break;
                case 'application/msword':
                case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                    fileIcon = '<i class="fas fa-file-word"></i>';
                    break;
                case 'image/jpeg':
                case 'image/png':
                    fileIcon = '<i class="fas fa-file-image"></i>';
                    break;
                case 'text/plain':
                    fileIcon = '<i class="fas fa-file-alt"></i>';
                    break;
                default:
                    fileIcon = '<i class="fas fa-file"></i>';
            }
            
            filePreview.innerHTML = `
                ${fileIcon}
                <div class="file-info">
                    <div class="file-name">${currentFile.name}</div>
                    <div class="file-size">${formatFileSize(currentFile.size)}</div>
                </div>
                <button class="remove-file">&times;</button>
            `;
            
            addMessage(filePreview.outerHTML, true);
            
            const removeBtn = filePreview.querySelector('.remove-file');
            removeBtn.addEventListener('click', function() {
                currentFile = null;
                fileUpload.value = '';
                filePreview.remove();
            });
        }
    });
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '' && !currentFile) return;
        
        if (message) {
            addMessage(message, true);
        }
        
        const formData = new FormData();
        if (message) formData.append('message', message);
        if (currentFile) formData.append('file', currentFile);
        
        userInput.value = '';
        currentFile = null;
        fileUpload.value = '';
        
        showTypingIndicator();
     
        fetch('/api/chat', {  
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            hideTypingIndicator();
            if (data.response) {
                addMessage(data.response, false);
            } else {
                addMessage('Sorry, I encountered an error processing your request.', false);
            }
        })
        .catch(error => {
            hideTypingIndicator();
            console.error('Error:', error);
            addMessage('Sorry, there was an error connecting to the server.', false);
        });
    }
    
    sendBtn.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    scrollToBottom();
});


