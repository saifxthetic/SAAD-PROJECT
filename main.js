const socket = io();

const clientsTotal = document.getElementById('client-total');
const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const imageInput = document.getElementById('image-input');
const typingDiv = document.getElementById('typing');

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage();
});

messageInput.addEventListener('input', () => {
  socket.emit('typing', { name: nameInput.value });
});

socket.on('clients-total', (data) => {
  clientsTotal.innerText = `Clients total: ${data}`;
});

socket.on('chat-message', (data) => {
  addMessageToUI(false, data);
  scrollToBottom();
});

socket.on('typing', (data) => {
  typingDiv.innerText = `${data.name} is typing...`;
  clearTimeout(typingDiv.timer);
  typingDiv.timer = setTimeout(() => {
    typingDiv.innerText = '';
  }, 2000);
});

socket.on('chat-history', (history) => {
  messageContainer.innerHTML = '';
  history.forEach((msg) => {
    addMessageToUI(false, msg);
  });
  scrollToBottom();
});

function sendMessage() {
  const message = messageInput.value.trim();
  const file = imageInput.files[0];

  if (!message && !file) return;

  const data = {
    name: nameInput.value || 'Anonymous',
    message: message,
  };

  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be smaller than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = function () {
      data.image = reader.result;
      socket.emit('message', data);
      addMessageToUI(true, data);
      scrollToBottom();
    };
    reader.readAsDataURL(file);
  } else {
    socket.emit('message', data);
    addMessageToUI(true, data);
    scrollToBottom();
  }

  messageInput.value = '';
  imageInput.value = '';
}

function addMessageToUI(isOwnMessage, data) {
  const imageTag = data.image
    ? `<img src="${data.image}" class="chat-image" />`
    : '';
  const element = `
    <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
      <p class="message">
        ${data.message}
        ${imageTag}
        <span>${data.name} • ${new Date().toLocaleTimeString()}</span>
      </p>
    </li>`;
  messageContainer.innerHTML += element;
}

function scrollToBottom() {
  messageContainer.scrollTop = messageContainer.scrollHeight;
}
