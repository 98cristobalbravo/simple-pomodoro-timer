let timer;
let minutes = 0;
let seconds = 0;
let isRunning = false;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ minutes: 0, seconds: 0, isRunning: false });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'start') {
    chrome.storage.local.get(['isRunning'], (result) => {
      isRunning = result.isRunning;
      if (!isRunning) {
        isRunning = true;
        chrome.storage.local.set({ isRunning: true });
        timer = setInterval(updateTimer, 1000);
      } else {
        isRunning = false;
        chrome.storage.local.set({ isRunning: false });
        clearInterval(timer);
      }
    });
  } else if (message.action === 'reset') {
    clearInterval(timer);
    chrome.storage.local.get('presetTime', (result) => {
      minutes = result.presetTime !== undefined ? result.presetTime : 0;
      seconds = 0;
      isRunning = false;
      chrome.storage.local.set({ minutes: minutes, seconds: 0, isRunning: false });
      chrome.runtime.sendMessage({ action: 'update', time: `${minutes < 10 ? '0' : ''}${minutes}:00` });
      chrome.action.setBadgeText({ text: '' });
    });
  } else if (message.action === 'setTime') {
    clearInterval(timer);
    minutes = message.time;
    seconds = 0;
    isRunning = false;
    chrome.storage.local.set({ minutes: minutes, seconds: 0, isRunning: false, presetTime: minutes });
    chrome.runtime.sendMessage({ action: 'update', time: `${minutes < 10 ? '0' : ''}${minutes}:00` });
    chrome.action.setBadgeText({ text: '' });
  }
});

function updateTimer() {
  chrome.storage.local.get(['minutes', 'seconds'], (result) => {
    minutes = result.minutes;
    seconds = result.seconds;

    if (seconds === 0) {
      if (minutes === 0) {
        clearInterval(timer);
        isRunning = false;
        chrome.storage.local.set({ isRunning: false });
        chrome.runtime.sendMessage({ action: 'update', time: '00:00' });
        chrome.action.setBadgeText({ text: '' });
        alert("Time's up!");
        return;
      } else {
        minutes--;
        seconds = 59;
      }
    } else {
      seconds--;
    }

    const time = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    chrome.storage.local.set({ minutes: minutes, seconds: seconds });

    // Actualizar el badge del ícono
    const badgeText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    chrome.action.setBadgeText({ text: badgeText });

    chrome.runtime.sendMessage({ action: 'update', time: time });
  });
}