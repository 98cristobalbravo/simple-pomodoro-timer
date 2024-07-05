const PRESET_TIMES = [25, 50];
let timer;
let minutes = 0;
let seconds = 0;
let isRunning = false;

document.addEventListener('DOMContentLoaded', () => {
  const timerDisplay = document.getElementById('timer');
  const startButton = document.getElementById('start');
  const resetButton = document.getElementById('reset');
  const presetButtons = document.querySelectorAll('.preset-time');
  const customTimeButton = document.getElementById('custom-time-button');
  const customTimeInput = document.getElementById('custom-time');

  // Inicializar el temporizador a 00:00
  timerDisplay.textContent = '00:00';

  // Obtener el estado del temporizador
  chrome.storage.local.get(['minutes', 'seconds', 'isRunning'], (result) => {
    const minutes = result.minutes !== undefined ? result.minutes : 0;
    const seconds = result.seconds !== undefined ? result.seconds : 0;
    const isRunning = result.isRunning !== undefined ? result.isRunning : false;
    
    timerDisplay.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    if (isRunning) {
      startButton.textContent = 'Pause';
    }
  });

  startButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'start' });
    startButton.textContent = isRunning ? 'Start' : 'Pause';
  });

  resetButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'reset' });
    startButton.textContent = 'Start';
  });

  presetButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const presetTime = parseInt(event.target.getAttribute('data-time'));
      chrome.runtime.sendMessage({ action: 'setTime', time: presetTime });
      startButton.textContent = 'Start';
    });
  });

  customTimeButton.addEventListener('click', () => {
    const customTime = parseInt(customTimeInput.value);
    if (!isNaN(customTime) && customTime > 0) {
      chrome.runtime.sendMessage({ action: 'setTime', time: customTime });
      startButton.textContent = 'Start';
    }
  });

  // Escuchar actualizaciones del temporizador
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'update') {
      timerDisplay.textContent = message.time;
    }
  });
});