/* =========================================
   POMODORO TIMER
========================================= */
/* =========================================
   TIMER SETTINGS
========================================= */
// Default settings required by roadmap.sh
let settings = {
  work: 25,
  shortBreak: 5,
  longBreak: 15
};
/* =========================================
   TIMER STATE
========================================= */
// Current session:
// "work"
// "shortBreak"
// "longBreak"
let currentSession = "work";
// How many seconds are left
let remainingSeconds = settings.work * 60;
// Total seconds in the current session
let totalSeconds = settings.work * 60;
// Number of completed work sessions
let completedWorkSessions = 0;
// Timer interval
let timerInterval = null;
// Is timer currently running?
let isRunning = false;
/* =========================================
   DOM ELEMENTS
========================================= */
const timerElement = document.getElementById("timer");
const sessionTypeElement =
  document.getElementById("session-type");
const startButton =
  document.getElementById("start-btn");
const resetButton =
  document.getElementById("reset-btn");
const sessionCountElement =
  document.getElementById("session-count");
const progressBar =
  document.getElementById("progress-bar");
const workInput =
  document.getElementById("work-duration");
const shortBreakInput =
  document.getElementById("short-break");
const longBreakInput =
  document.getElementById("long-break");
const applySettingsButton =
  document.getElementById("apply-settings");
const settingsMessage =
  document.getElementById("settings-message");
/* =========================================
   FORMAT TIME
========================================= */
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}
/* =========================================
   GET SESSION DURATION
========================================= */
function getSessionDuration() {
  if (currentSession === "work") {
    return settings.work * 60;
  }
  if (currentSession === "shortBreak") {
    return settings.shortBreak * 60;
  }
  return settings.longBreak * 60;
}
/* =========================================
   GET SESSION NAME
========================================= */
function getSessionName() {
  if (currentSession === "work") {
    return "Work";
  }
  if (currentSession === "shortBreak") {
    return "Short Break";
  }
  return "Long Break";
}
/* =========================================
   UPDATE TIMER DISPLAY
========================================= */
function updateDisplay() {
  // Update timer text
  timerElement.textContent =
    formatTime(remainingSeconds);
  // Update session name
  sessionTypeElement.textContent =
    getSessionName();
  // Calculate progress percentage
  const progress =
    (remainingSeconds / totalSeconds) * 100;
  progressBar.style.width = `${progress}%`;
  // Update accessibility label
  timerElement.setAttribute(
    "aria-label",
    `${formatTime(remainingSeconds)} remaining`
  );
  // Update completed sessions
  sessionCountElement.textContent =
    completedWorkSessions;
  // Update page title
  document.title =
    `${formatTime(remainingSeconds)} - ${getSessionName()}`;
}
/* =========================================
   START TIMER
========================================= */
function startTimer() {
  // Don't create multiple intervals
  if (isRunning) {
    return;
  }
  isRunning = true;
  startButton.textContent = "Pause";
  timerInterval = setInterval(() => {
    remainingSeconds--;
    updateDisplay();
    // Session finished
    if (remainingSeconds <= 0) {
      finishSession();
    }
  }, 1000);
}
/* =========================================
   PAUSE TIMER
========================================= */
function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  startButton.textContent = "Resume";
}
/* =========================================
   START / PAUSE BUTTON
========================================= */
startButton.addEventListener("click", () => {
  if (isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
});
/* =========================================
   RESET TIMER
========================================= */
function resetTimer() {
  // Stop the timer
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  // Reset current session
  remainingSeconds =
    getSessionDuration();
  totalSeconds =
    getSessionDuration();
  startButton.textContent = "Start";
  updateDisplay();
}
resetButton.addEventListener(
  "click",
  resetTimer
);
/* =========================================
   FINISH SESSION
========================================= */
function finishSession() {
  // Stop current timer
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  // Play notification sound
  playNotificationSound();
  /* -----------------------------------------
     WORK SESSION FINISHED
  ----------------------------------------- */
  if (currentSession === "work") {
    completedWorkSessions++;
    /*
      Every 4 completed work sessions:
      take a long break.
    */
    if (completedWorkSessions % 4 === 0) {
      currentSession = "longBreak";
    } else {
      currentSession = "shortBreak";
    }
  }
  /* -----------------------------------------
     BREAK FINISHED
  ----------------------------------------- */
  else {
    // After every break, return to work
    currentSession = "work";
  }
  // Set timer for new session
  totalSeconds =
    getSessionDuration();
  remainingSeconds =
    totalSeconds;
  startButton.textContent = "Start";
  updateDisplay();
}
/* =========================================
   NOTIFICATION SOUND
========================================= */
function playNotificationSound() {
  /*
    Web Audio API lets us create a small
    notification sound without downloading
    an external audio file.
  */
  const AudioContext =
    window.AudioContext ||
    window.webkitAudioContext;
  if (!AudioContext) {
    return;
  }
  const audioContext = new AudioContext();
  const oscillator =
    audioContext.createOscillator();
  const gainNode =
    audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.type = "sine";
  oscillator.frequency.value = 800;
  gainNode.gain.setValueAtTime(
    0.001,
    audioContext.currentTime
  );
  gainNode.gain.exponentialRampToValueAtTime(
    0.3,
    audioContext.currentTime + 0.02
  );
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + 0.6
  );
  oscillator.start();
  oscillator.stop(
    audioContext.currentTime + 0.6
  );
}
/* =========================================
   APPLY SETTINGS
========================================= */
applySettingsButton.addEventListener(
  "click",
  applySettings
);
function applySettings() {
  const newWork =
    Number(workInput.value);
  const newShortBreak =
    Number(shortBreakInput.value);
  const newLongBreak =
    Number(longBreakInput.value);
  // Validate values
  if (
    newWork < 1 ||
    newShortBreak < 1 ||
    newLongBreak < 1
  ) {
    settingsMessage.textContent =
      "Please enter values greater than 0.";
    return;
  }
  // Save new settings
  settings.work = newWork;
  settings.shortBreak =
    newShortBreak;
  settings.longBreak =
    newLongBreak;
  // Reset current timer
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  totalSeconds =
    getSessionDuration();
  remainingSeconds =
    totalSeconds;
  startButton.textContent = "Start";
  // Show success message
  settingsMessage.textContent =
    "Timer settings updated successfully.";
  updateDisplay();
  // Remove message after 3 seconds
  setTimeout(() => {
    settingsMessage.textContent = "";
  }, 3000);
}
/* =========================================
   INITIALIZE APPLICATION
========================================= */
updateDisplay();