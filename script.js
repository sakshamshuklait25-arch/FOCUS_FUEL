 
// === GLOBAL TIMER VARIABLES ===
window.timer = null;
window.timeLeft = 25 * 60;
window.isRunning = false;
window.currentMode = 'focus';
// ===== SIMPLE LOGIN SYSTEM =====
window.addEventListener('load', function() {
  const loginScreen = document.getElementById('loginScreen');
  const appContent = document.getElementById('appContent');
  const usernameInput = document.getElementById('usernameInput');
  const startAsGuest = document.getElementById('startAsGuest');
   console.log("=== FOCUSFUEL STARTING ===");

// Check if AI Coach is available
if (typeof aiCoach === 'undefined') {
    console.warn("⚠️ AI Coach not found - running in basic mode");
} else {
    console.log("✅ AI Coach loaded");
}
  // Check if user already logged in
  const savedUsername = localStorage.getItem('focusfuel_username');
  
  if (savedUsername) {
    // Already logged in, show app directly
    if (loginScreen) loginScreen.style.display = 'none';
    if (appContent) appContent.style.display = 'block';
    updateWelcomeMessage(savedUsername);
  } else {
    // Show login screen
    if (loginScreen) loginScreen.style.display = 'flex';
    if (appContent) appContent.style.display = 'none';
  }
  
  // Login button
  if (startAsGuest) {
    startAsGuest.addEventListener('click', function() {
      const username = usernameInput.value.trim() || 'Focus Warrior';
      localStorage.setItem('focusfuel_username', username);
      
      if (loginScreen) loginScreen.style.opacity = '0';
      if (appContent) appContent.style.display = 'block';
      
      setTimeout(() => {
        if (loginScreen) loginScreen.style.display = 'none';
        updateWelcomeMessage(username);
      }, 500);
      
      // Add to header
      const header = document.querySelector('header h1');
      if (header) {
        header.innerHTML = `⚡ Welcome, ${username}!`;
      }
    });
  }
});

function updateWelcomeMessage(username) {
  const welcomeElement = document.getElementById('welcomeMessage');
  if (!welcomeElement) {
    // Create welcome message
    const header = document.querySelector('header');
    if (header) {
      const welcome = document.createElement('p');
      welcome.id = 'welcomeMessage';
      welcome.style.marginTop = '10px';
      welcome.style.opacity = '0.8';
      welcome.textContent = `Hello, ${username}! Ready to focus?`;
      header.appendChild(welcome);
    }
  }
}

// Add logout button to footer
const footer = document.querySelector('footer');
if (footer) {
  const logoutBtn = document.createElement('button');
  logoutBtn.id = 'logoutBtn';
  logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Switch User';
  logoutBtn.style.marginTop = '10px';
  logoutBtn.style.padding = '8px 15px';
  logoutBtn.style.background = 'rgba(255,255,255,0.1)';
  logoutBtn.style.color = 'white';
  logoutBtn.style.border = 'none';
  logoutBtn.style.borderRadius = '5px';
  logoutBtn.style.cursor = 'pointer';
  
  logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('focusfuel_username');
    location.reload();
  });
  
  footer.appendChild(logoutBtn);
}

// DOM Elements

const fuelDisplay = document.getElementById('fuel');
const streakDisplay = document.getElementById('streak');
const sessionsDisplay = document.getElementById('sessions');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const modeButtons = document.querySelectorAll('.mode-btn');
const buyButtons = document.querySelectorAll('.buy-btn');
const completeSound = document.getElementById('completeSound');
const clickSound = document.getElementById('clickSound');

// Mood Tracker Elements
const energySlider = document.getElementById('energySlider');
const moodSlider = document.getElementById('moodSlider');
const energyValue = document.getElementById('energyValue');
const moodValue = document.getElementById('moodValue');
const recordBtn = document.getElementById('recordBtn');
const tags = document.querySelectorAll('.tag');
const voiceStatus = document.getElementById('voiceStatus');
 // ===== AI COACH ENGINE =====
const aiCoach = {
    moodHistory: [],
    
    logEntry: function(energy, mood, stressTags = [], note = '') {
        const entry = {
            timestamp: new Date().toISOString(),
            energy: parseInt(energy),
            mood: parseInt(mood),
            stressTags,
            note
        };
        
        this.moodHistory.push(entry);
        this.saveHistory();
        
        // Check if we should suggest intervention
        this.checkForSuggestions();
        
        return entry;
    },
    
    analyzePatterns: function() {
        if (this.moodHistory.length === 0) {
            return { burnoutRisk: 25, avgEnergy: 5, avgMood: 5 };
        }
        
        const today = new Date().toDateString();
        const todayEntries = this.moodHistory.filter(entry => 
            new Date(entry.timestamp).toDateString() === today
        );
        
        if (todayEntries.length === 0) {
            return { burnoutRisk: 25, avgEnergy: 5, avgMood: 5 };
        }
        
        const avgEnergy = todayEntries.reduce((sum, e) => sum + e.energy, 0) / todayEntries.length;
        const avgMood = todayEntries.reduce((sum, e) => sum + e.mood, 0) / todayEntries.length;
        
        const lowEnergyEntries = todayEntries.filter(e => e.energy <= 4).length;
        const stressedEntries = todayEntries.filter(e => e.stressTags.length > 0).length;
        
        let burnoutRisk = 25 + (lowEnergyEntries * 10) + (stressedEntries * 5);
        burnoutRisk = Math.min(burnoutRisk, 95);
        
        return {
            avgEnergy,
            avgMood,
            burnoutRisk,
            energyDips: lowEnergyEntries,
            stressFrequency: stressedEntries
        };
    },
    
    checkForSuggestions: function() {
        const patterns = this.analyzePatterns();
        
        // If energy is low or mood is low, show suggestion
        if (patterns.burnoutRisk > 60) {
            this.showSuggestion('high-stress');
        } else if (patterns.avgEnergy < 4) {
            this.showSuggestion('low-energy');
        } else if (patterns.avgMood < 4) {
            this.showSuggestion('low-mood');
        }
    },
    
    showSuggestion: function(type) {
        const suggestionsContainer = document.getElementById('suggestions');
        if (!suggestionsContainer) return;
        
        const suggestions = {
            'high-stress': {
                title: '2-Minute Breathing',
                description: 'You seem stressed. Try deep breathing to calm down.',
                icon: 'fas fa-wind'
            },
            'low-energy': {
                title: '3-Minute Walk',
                description: 'Your energy is low. A quick walk can boost it!',
                icon: 'fas fa-walking'
            },
            'low-mood': {
                title: 'Quick Stretch',
                description: 'Mood a bit low? Stretching can help!',
                icon: 'fas fa-child'
            }
        };
        
        const suggestion = suggestions[type] || suggestions['high-stress'];
        
        // Create or update suggestion element
        let suggestionElement = document.querySelector('.suggestion');
        if (!suggestionElement) {
            suggestionElement = document.createElement('div');
            suggestionElement.className = 'suggestion active';
            suggestionsContainer.innerHTML = ''; // Clear existing
            suggestionsContainer.appendChild(suggestionElement);
        }
        
        suggestionElement.innerHTML = `
            <i class="${suggestion.icon}"></i>
            <div>
                <h4>${suggestion.title}</h4>
                <p>${suggestion.description}</p>
            </div>
            <button class="start-intervention">Start</button>
        `;
        
        // Add click handler to start button
        suggestionElement.querySelector('.start-intervention').addEventListener('click', () => {
            this.startIntervention(suggestion.title);
        });
        
        // Show the AI interventions section
        const aiSection = document.querySelector('.ai-interventions');
        if (aiSection) {
            aiSection.style.display = 'block';
        }
    },
    
    startIntervention: function(interventionName) {
        alert(`Starting ${interventionName}... ⏱️\n\nClose this and the AI will start a timer.`);
        
        // Start a quick timer (2-3 minutes)
        const originalTime = timeLeft;
        const originalMode = currentMode;
        const originalRunning = isRunning;
        
        if (isRunning) pauseTimer();
        
        // Set up intervention timer
        currentMode = 'break';
        timeLeft = interventionName.includes('Breathing') ? 2 * 60 : 3 * 60;
        isRunning = true;
        
        // Update display
        updateTimerDisplay();
        if (startBtn) startBtn.disabled = true;
        if (pauseBtn) pauseBtn.disabled = false;
        
        // Start intervention timer
        const interventionTimer = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            
            if (timeLeft <= 0) {
                clearInterval(interventionTimer);
                isRunning = false;
                
                // Show completion
                alert(`✅ ${interventionName} complete! Feel better?`);
                
                // Restore original timer state
                currentMode = originalMode;
                if (originalRunning) {
                    initTimer();
                    startTimer();
                } else {
                    initTimer();
                }
                
                // Give reward
                addFuel(5);
            }
        }, 1000);
    },
    
    saveHistory: function() {
        localStorage.setItem('aiCoach_moodHistory', JSON.stringify(this.moodHistory));
    },
    
    loadHistory: function() {
        const saved = localStorage.getItem('aiCoach_moodHistory');
        if (saved) {
            this.moodHistory = JSON.parse(saved) || [];
        }
    }
};

// Load AI coach history
aiCoach.loadHistory();
// Timer variables
let timer;
let timeLeft;
let isRunning = false;
let currentMode = 'focus'; // 'focus' or 'break'
const focusTime = 25 * 60; // 25 minutes in seconds
const breakTime = 5 * 60;  // 5 minutes in seconds

// Game variables
let fuel = 0;
let streak = 0;
let sessionsToday = 0;
let upgrades = {
    coffee: false,
    music: false,
    streak: false
};

// Check if it's a new day
function checkNewDay() {
    const lastDate = localStorage.getItem('focusFuel_lastDate');
    const today = new Date().toDateString();
    
    if (lastDate !== today) {
        localStorage.setItem('focusFuel_lastDate', today);
        sessionsToday = 0;
        
        // Reset streak if no shield
        if (!upgrades.streak) {
            streak = 0;
        }
        updateDisplay();
    }
}

// Initialize timer
function initTimer() {
    timeLeft = currentMode === 'focus' ? focusTime : breakTime;
    updateTimerDisplay();
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    if (timerDisplay) {
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Color change warning
        if (timeLeft <= 60) { // Last minute
            timerDisplay.style.color = '#ff4444';
        } else if (currentMode === 'focus') {
            timerDisplay.style.color = '#00ff88';
        } else {
            timerDisplay.style.color = '#00d4ff';
        }
    }
}

// Start timer
function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    if (startBtn) startBtn.disabled = true;
    if (pauseBtn) pauseBtn.disabled = false;
    if (clickSound) clickSound.play().catch(e => console.log("Sound error:", e));
    
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        // Add fuel every minute
        if (timeLeft % 60 === 0 && timeLeft > 0) {
            addFuel(1 + (upgrades.coffee ? 2 : 0));
        }
        
        if (timeLeft <= 0) {
            completeSession();
        }
    }, 1000);
}

// Pause timer
function pauseTimer() {
    if (!isRunning) return;
    
    isRunning = false;
    clearInterval(timer);
    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;
    if (clickSound) clickSound.play().catch(e => console.log("Sound error:", e));
}

// Reset timer
function resetTimer() {
    pauseTimer();
    initTimer();
    if (clickSound) clickSound.play().catch(e => console.log("Sound error:", e));
}

// Complete session
function completeSession() {
    clearInterval(timer);
    isRunning = false;
    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;
    if (completeSound) completeSound.play().catch(e => console.log("Sound error:", e));
    
    // Add session bonus
    sessionsToday++;
    const bonusFuel = currentMode === 'focus' ? 10 : 5;
    addFuel(bonusFuel + (upgrades.coffee ? 2 : 0));
    
    // Update streak
    if (currentMode === 'focus') {
        const lastSessionDate = localStorage.getItem('focusFuel_lastSessionDate');
        const today = new Date().toDateString();
        
        if (lastSessionDate !== today) {
            localStorage.setItem('focusFuel_lastSessionDate', today);
            streak++;
            saveGame();
        }
    }
    
    // Switch mode
    currentMode = currentMode === 'focus' ? 'break' : 'focus';
    modeButtons.forEach(btn => {
        if (btn) btn.classList.toggle('active', btn.dataset.mode === currentMode);
    });
    
    // Notify
    showNotification(currentMode === 'focus' ? 'Time to focus! ⚡' : 'Break time! ☕');
    
    initTimer();
    updateDisplay();
}

// Add fuel
function addFuel(amount) {
    fuel += amount;
    if (fuelDisplay) fuelDisplay.textContent = fuel;
    saveGame();
}

// Buy upgrade
function buyUpgrade(upgradeId, cost) {
    if (fuel >= cost && !upgrades[upgradeId]) {
        fuel -= cost;
        upgrades[upgradeId] = true;
        
        // Update button
        const btn = document.querySelector(`[data-id="${upgradeId}"] .buy-btn`);
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Owned ✓';
            btn.style.background = '#00ff88';
            btn.style.color = 'black';
            
            // Special effects
            if (upgradeId === 'music') {
                showNotification('Lofi beats unlocked! 🎵');
            } else if (upgradeId === 'streak') {
                showNotification('Streak Shield activated! 🔥');
            }
        }
        
        updateDisplay();
        saveGame();
        if (clickSound) clickSound.play().catch(e => console.log("Sound error:", e));
    }
}

// Show notification
function showNotification(message) {
    alert(message);
}

// Update all displays
function updateDisplay() {
    if (fuelDisplay) fuelDisplay.textContent = fuel;
    if (streakDisplay) streakDisplay.textContent = streak;
    if (sessionsDisplay) sessionsDisplay.textContent = sessionsToday;
}

// Save game to localStorage
function saveGame() {
    const gameData = {
        fuel,
        streak,
        sessionsToday,
        upgrades,
        lastDate: new Date().toDateString()
    };
    localStorage.setItem('focusFuel_save', JSON.stringify(gameData));
}

// Load game from localStorage
function loadGame() {
    const saved = localStorage.getItem('focusFuel_save');
    if (saved) {
        try {
            const gameData = JSON.parse(saved);
            fuel = gameData.fuel || 0;
            streak = gameData.streak || 0;
            sessionsToday = gameData.sessionsToday || 0;
            upgrades = gameData.upgrades || { coffee: false, music: false, streak: false };
            
            // Update owned upgrades UI
            Object.keys(upgrades).forEach(id => {
                if (upgrades[id]) {
                    const btn = document.querySelector(`[data-id="${id}"] .buy-btn`);
                    if (btn) {
                        btn.disabled = true;
                        btn.textContent = 'Owned ✓';
                        btn.style.background = '#00ff88';
                        btn.style.color = 'black';
                    }
                }
            });
        } catch (e) {
            console.log("Error loading saved data:", e);
        }
    }
    checkNewDay();
    updateDisplay();
}

// ===== MOOD TRACKING FUNCTIONS =====

// Initialize mood tracking
function initMoodTracking() {
    if (energySlider && energyValue) {
        energySlider.addEventListener('input', () => {
            energyValue.textContent = energySlider.value;
        });
    }
    
    if (moodSlider && moodValue) {
        moodSlider.addEventListener('input', () => {
            moodValue.textContent = moodSlider.value;
        });
    }
    
    if (tags.length > 0) {
        tags.forEach(tag => {
            tag.addEventListener('click', () => {
                tag.classList.toggle('active');
            });
        });
    }
    
    // Log mood entry
    if (logMoodBtn) {
        logMoodBtn.addEventListener('click', () => {
            const energy = energySlider ? energySlider.value : 5;
            const mood = moodSlider ? moodSlider.value : 5;
            
            // Get selected stress tags
            const activeTags = [];
            document.querySelectorAll('.tag.active').forEach(tag => {
                if (tag.dataset.tag) activeTags.push(tag.dataset.tag);
            });
            
            // Save mood entry
            const moodEntry = {
                timestamp: new Date().toISOString(),
                energy: parseInt(energy),
                mood: parseInt(mood),
                stressTags: activeTags
            };
            
            // Save to localStorage
            let moodHistory = JSON.parse(localStorage.getItem('focusFuel_moodHistory') || '[]');
            moodHistory.push(moodEntry);
            localStorage.setItem('focusFuel_moodHistory', JSON.stringify(moodHistory));
            
            // Add fuel reward
            addFuel(5);
            
            // Show confirmation
            showNotification(`✅ Mood logged!\nEnergy: ${energy}/10\nMood: ${mood}/10\n+5 ⚡ Fuel added`);
            
            // Reset after 2 seconds
            setTimeout(() => {
                if (energySlider) energySlider.value = 5;
                if (moodSlider) moodSlider.value = 5;
                if (energyValue) energyValue.textContent = '5';
                if (moodValue) moodValue.textContent = '5';
                document.querySelectorAll('.tag.active').forEach(tag => {
                    tag.classList.remove('active');
                });
            }, 2000);
        });
    }
    
    // Voice recording
    if (recordBtn) {
        let isRecording = false;
        recordBtn.addEventListener('click', () => {
            if (!isRecording) {
                isRecording = true;
                recordBtn.classList.add('recording');
                recordBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
                if (voiceStatus) voiceStatus.textContent = 'Recording... (3 seconds)';
                
                // Simulate 3-second recording
                setTimeout(() => {
                    isRecording = false;
                    recordBtn.classList.remove('recording');
                    recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Record Note';
                    if (voiceStatus) voiceStatus.textContent = 'Note saved (simulated)';
                }, 3000);
            }
        });
    }
}

// ===== EVENT LISTENERS =====

// Initialize all event listeners
function initEventListeners() {
    // Timer controls
    if (startBtn) startBtn.addEventListener('click', startTimer);
    if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);
    
    // Mode buttons
    modeButtons.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                if (isRunning) return;
                currentMode = btn.dataset.mode;
                modeButtons.forEach(b => {
                    if (b) b.classList.remove('active');
                });
                btn.classList.add('active');
                if (clickSound) clickSound.play().catch(e => console.log("Sound error:", e));
                initTimer();
            });
        }
    });
    
    // Buy buttons
    buyButtons.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                const upgradeElement = btn.closest('.upgrade');
                if (upgradeElement) {
                    const upgradeId = upgradeElement.dataset.id;
                    const cost = parseInt(btn.dataset.cost) || 0;
                    buyUpgrade(upgradeId, cost);
                }
            });
        }
    });
    
    // Initialize mood tracking
    initMoodTracking();
}

// ===== INITIALIZATION =====

// Initialize everything when page loads
window.addEventListener('load', () => {
    console.log('⚡ FocusFuel AI Loading...');
    
    // Load saved data
    loadGame();
    
    // Initialize timer
    initTimer();
    
    // Setup event listeners
    initEventListeners();
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    console.log('✅ FocusFuel AI Ready!');
    
    // Auto-save every 30 seconds
    setInterval(saveGame, 30000);
}); // ===== DAILY QUOTES =====
const quotes = [
  "The future depends on what you do today. - Mahatma Gandhi",
  "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
  "Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort. - Paul J. Meyer",
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
  "It's not about having time, it's about making time. - Unknown",
  "Focus on being productive instead of busy. - Tim Ferriss",
  "The key is not to prioritize what's on your schedule, but to schedule your priorities. - Stephen Covey",
  "Energy and persistence conquer all things. - Benjamin Franklin",
  "Small daily improvements are the key to staggering long-term results. - Unknown",
  "You don't have to be great to start, but you have to start to be great. - Zig Ziglar",
  "The secret of getting ahead is getting started. - Mark Twain",
  "Don't be busy, be productive. - Unknown",
  "Your focus determines your reality. - George Lucas",
  "The way to get started is to quit talking and begin doing. - Walt Disney"
];

function getDailyQuote() {
  const today = new Date().toDateString();
  const quoteIndex = Math.abs(hashCode(today)) % quotes.length;
  return quotes[quoteIndex];
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// Initialize quote
document.addEventListener('DOMContentLoaded', function() {
  const quoteElement = document.getElementById('dailyQuote');
  const newQuoteBtn = document.getElementById('newQuoteBtn');
  
  if (quoteElement) {
    quoteElement.textContent = getDailyQuote();
  }
  
  if (newQuoteBtn) {
    newQuoteBtn.addEventListener('click', function() {
      if (quoteElement) {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        quoteElement.textContent = quotes[randomIndex];
      }
    });
  }
});// ===== QUICK FOCUS MODES =====
function setupQuickFocus() {
    const quickButtons = document.querySelectorAll('.quick-btn');
    
    quickButtons.forEach(button => {
        button.addEventListener('click', function() {
            const minutes = parseInt(this.dataset.minutes);
            setQuickFocus(minutes);
        });
    });
}

function setQuickFocus(minutes) {
    // If timer is running, ask for confirmation
    if (isRunning) {
        if (!confirm(`Switch to ${minutes} min focus? Current timer will reset.`)) {
            return;
        }
        pauseTimer();
    }
    
    // Update focus time
    focusTime = minutes * 60;
    currentMode = 'focus';
    
    // Update mode button text
    const focusBtn = document.querySelector('[data-mode="focus"]');
    if (focusBtn) {
        focusBtn.textContent = `Focus (${minutes}:00)`;
    }
    
    // Switch to focus mode if not already
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === 'focus') {
            btn.classList.add('active');
        }
    });
    
    // Re-initialize timer
    initTimer();
    
    // Show confirmation
    alert(`⚡ Set to ${minutes}-minute focus session! Ready to start?`);
}

// Initialize when page loads
window.addEventListener('load', function() {
    setupQuickFocus();
});// ===== QUICK FOCUS FIX =====

// Make sure focusTime is a LET variable (not const)


// Add this function to set quick focus
function setQuickFocus(minutes) {
    // Pause if running
    if (isRunning) {
        if (!confirm(`Switch to ${minutes} min focus? Current timer will reset.`)) {
            return;
        }
        pauseTimer();
    }
    
    // Update focus time
    focusTime = minutes * 60;
    currentMode = 'focus';
    
    // Update UI
    const focusBtn = document.querySelector('.mode-btn[data-mode="focus"]');
    if (focusBtn) {
        focusBtn.textContent = `Focus (${minutes}:00)`;
        focusBtn.classList.add('active');
    }
    
    const breakBtn = document.querySelector('.mode-btn[data-mode="break"]');
    if (breakBtn) breakBtn.classList.remove('active');
    
    // Reset timer
    timeLeft = focusTime;
    updateTimerDisplay();
    
    // Show message
    alert(`⚡ Set to ${minutes}-minute focus session!`);
}

// Initialize quick buttons
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for DOM to load completely
    setTimeout(() => {
        const quickButtons = document.querySelectorAll('.quick-btn');
        console.log('Found quick buttons:', quickButtons.length);
        
        quickButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const minutes = parseInt(this.getAttribute('data-minutes'));
                console.log('Quick focus clicked:', minutes);
                setQuickFocus(minutes);
            });
        });
    }, 500);
}); 
// ===== TO-DO LIST FUNCTIONALITY =====
console.log("📋 Setting up To-Do List...");

class TodoList {
    constructor() {
        this.todos = this.loadTodos();
        this.init();
    }
    
    init() {
        this.render();
        this.setupEventListeners();
        this.updateStats();
    }
    
    loadTodos() {
        try {
            const saved = localStorage.getItem('focusFuel_todos');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }
    
    saveTodos() {
        localStorage.setItem('focusFuel_todos', JSON.stringify(this.todos));
    }
    
    addTodo(text, type = 'focus') {
        if (!text.trim()) return;
        
        const todo = {
            id: Date.now(),
            text: text.trim(),
            type: type,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.todos.push(todo);
        this.saveTodos();
        this.render();
        this.updateStats();
        
        // Award fuel for adding task
        this.awardFuel(2);
        
        return todo;
    }
    
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
            this.updateStats();
            
            // Award fuel for completing task
            if (todo.completed) {
                this.awardFuel(5);
                this.showCompletionEffect(todo);
            }
        }
    }
    
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.render();
        this.updateStats();
    }
    
    clearCompleted() {
        this.todos = this.todos.filter(t => !t.completed);
        this.saveTodos();
        this.render();
        this.updateStats();
    }
    
    awardFuel(amount) {
        const fuelDisplay = document.getElementById('fuel');
        if (fuelDisplay) {
            let currentFuel = parseInt(fuelDisplay.textContent) || 0;
            fuelDisplay.textContent = currentFuel + amount;
            localStorage.setItem('focusFuel_fuel', currentFuel + amount);
        }
    }
    
    showCompletionEffect(todo) {
        // Visual feedback
        const todoElement = document.querySelector(`[data-id="${todo.id}"]`);
        if (todoElement) {
            todoElement.classList.add('completed');
            
            // Add celebration for focus tasks
            if (todo.type === 'focus') {
                const confetti = document.createElement('div');
                confetti.innerHTML = '🎉';
                confetti.style.position = 'absolute';
                confetti.style.fontSize = '2rem';
                confetti.style.animation = 'floatUp 1s forwards';
                todoElement.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 1000);
            }
        }
    }
    
    updateStats() {
        const totalTasks = this.todos.length;
        const completedTasks = this.todos.filter(t => t.completed).length;
        const focusTasks = this.todos.filter(t => t.type === 'focus' && !t.completed).length;
        
        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('focusTasks').textContent = focusTasks;
    }
    
    render() {
        const container = document.getElementById('todoList');
        if (!container) return;
        
        if (this.todos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No tasks yet. Add your first focus task!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.todos.map(todo => `
            <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <input type="checkbox" class="todo-checkbox" 
                       ${todo.completed ? 'checked' : ''}
                       onchange="todoList.toggleTodo(${todo.id})">
                
                <span class="todo-text ${todo.completed ? 'completed' : ''}">
                    ${todo.text}
                    <span class="task-type ${todo.type}">
                        ${this.getTypeIcon(todo.type)} ${todo.type}
                    </span>
                </span>
                
                <button class="delete-todo" onclick="todoList.deleteTodo(${todo.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
    
    getTypeIcon(type) {
        const icons = {
            'focus': '🎯',
            'break': '☕',
            'quick': '⚡'
        };
        return icons[type] || '📝';
    }
    
    setupEventListeners() {
        // Add task button
        const addBtn = document.getElementById('addTodoBtn');
        const input = document.getElementById('todoInput');
        const taskType = document.getElementById('taskType');
        
        if (addBtn && input) {
            addBtn.addEventListener('click', () => {
                this.addTodo(input.value, taskType.value);
                input.value = '';
                input.focus();
            });
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addTodo(input.value, taskType.value);
                    input.value = '';
                }
            });
        }
        
        // Clear completed button
        const clearBtn = document.getElementById('clearCompleted');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearCompleted());
        }
        
        // Focus mode button
        const focusBtn = document.getElementById('focusMode');
        if (focusBtn) {
            focusBtn.addEventListener('click', () => {
                const focusTasks = this.todos.filter(t => 
                    t.type === 'focus' && !t.completed
                );
                
                if (focusTasks.length > 0) {
                    alert(`🎯 Starting focus session with ${focusTasks.length} tasks!`);
                    // Start timer automatically
                    if (window.startTimer) {
                        startTimer();
                    }
                } else {
                    alert("No focus tasks to work on. Add some first!");
                }
            });
        }
    }
}

// Initialize Todo List
let todoList;
document.addEventListener('DOMContentLoaded', function() {
    todoList = new TodoList();
    window.todoList = todoList; // Make it available globally
});

console.log("✅ To-Do List ready");
// === QUICK START BUTTON FUNCTION ===
document.addEventListener('DOMContentLoaded', function() {
    const focusBtn = document.getElementById('focusMode');
    
    if (focusBtn) {
        focusBtn.addEventListener('click', function() {
            // Show duration selection popup
            const minutes = prompt(
                "⏰ QUICK START TIMER\n\n" +
                "Choose your focus duration:\n" +
                "• 2  (Quick Sprint)\n" +
                "• 5  (Short Break)\n" +
                "• 25 (Standard Focus)\n" +
                "• 45 (Deep Work)\n" +
                "• 50 (Study Session)\n\n" +
                "Or enter any number (1-120):",
                "25"
            );
            
            if (minutes && !isNaN(minutes)) {
                const mins = parseInt(minutes);
                
                if (mins >= 1 && mins <= 120) {
                    // Stop if timer is running
                    if (window.isRunning && window.pauseTimer) {
                        window.pauseTimer();
                    }
                    
                    // Set new time
                    window.timeLeft = mins * 60;
                    
                    // Update display
                    const timerDisplay = document.getElementById('timer');
                    if (timerDisplay && window.updateTimerDisplay) {
                        window.updateTimerDisplay();
                    }
                    
                    // Auto-select focus mode if >5 minutes
                    if (mins > 5) {
                        const focusModeBtn = document.querySelector('[data-mode="focus"]');
                        if (focusModeBtn) {
                            focusModeBtn.classList.add('active');
                            document.querySelector('[data-mode="break"]').classList.remove('active');
                            window.currentMode = 'focus';
                        }
                    }
                    
                    // Show success message
                    alert(`✅ Timer set to ${mins} minutes!\n\nClick "Start" button to begin.`);
                    
                } else {
                    alert("❌ Please enter 1-120 minutes.");
                }
            }
        });
        
        console.log("✅ Quick Start button ready");
    }
});
// ===== ANIMATION FUNCTIONS =====

class Animations {
    // 1. Fuel earned animation
    static fuelEarned(amount) {
        const fuelDisplay = document.getElementById('fuel');
        if (fuelDisplay) {
            fuelDisplay.classList.add('fuel-earned');
            setTimeout(() => {
                fuelDisplay.classList.remove('fuel-earned');
            }, 1500);
        }
        
        // Show floating number
        this.showFloatingNumber('+' + amount + '⚡', '#00ff88');
    }
    
    // 2. Show floating number/text
    static showFloatingNumber(text, color = '#00ff88') {
        const floatDiv = document.createElement('div');
        floatDiv.textContent = text;
        floatDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 3rem;
            font-weight: bold;
            color: ${color};
            z-index: 1000;
            pointer-events: none;
            animation: floatUp 1.5s ease-out forwards;
            text-shadow: 0 0 20px rgba(0,0,0,0.5);
        `;
        
        document.body.appendChild(floatDiv);
        setTimeout(() => floatDiv.remove(), 1500);
    }
    
    // 3. Button click effect
    static buttonClick(button) {
        if (!button) return;
        
        button.classList.add('glow-effect');
        setTimeout(() => {
            button.classList.remove('glow-effect');
        }, 1000);
    }
    
    // 4. Confetti celebration
    static confettiCelebration(count = 50) {
        const colors = ['#ff0000', '#00ff88', '#00d4ff', '#ffd700', '#9c27b0'];
        
        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = `
                left: ${Math.random() * 100}%;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                width: ${Math.random() * 10 + 5}px;
                height: ${Math.random() * 10 + 5}px;
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                animation-duration: ${Math.random() * 3 + 2}s;
                animation-delay: ${Math.random() * 1}s;
            `;
            
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 5000);
        }
    }
    
    // 5. Progress bar animation
    static animateProgress(elementId, from = 0, to = 100, duration = 2000) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.style.setProperty('--fill-width', to + '%');
        element.classList.add('fill-animation');
        
        setTimeout(() => {
            element.classList.remove('fill-animation');
        }, duration);
    }
    
    // 6. Shake element
    static shakeElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('shake-warning');
            setTimeout(() => {
                element.classList.remove('shake-warning');
            }, 500);
        }
    }
    
    // 7. Slide in element
    static slideIn(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('slide-in');
        }
    }
    
    // 8. Bounce notification
    static bounceNotification(message, type = 'info') {
        const colors = {
            info: '#00d4ff',
            success: '#00ff88',
            warning: '#ffaa00',
            error: '#ff4444'
        };
        
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0,0,0,0.8);
            color: ${colors[type] || '#fff'};
            padding: 15px 25px;
            border-radius: 10px;
            z-index: 1000;
            animation: bounce 0.5s, slideIn 0.5s;
            border-left: 5px solid ${colors[type] || '#fff'};
            max-width: 300px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100px)';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
    
    // 9. Timer countdown animation
    static timerPulse() {
        const timerDisplay = document.getElementById('timer');
        if (timerDisplay) {
            timerDisplay.classList.add('glow-effect');
            setTimeout(() => {
                timerDisplay.classList.remove('glow-effect');
            }, 1000);
        }
    }
    
    // 10. Mood log celebration
    static moodLoggedCelebration(energy, mood) {
        if (energy >= 7 && mood >= 7) {
            this.confettiCelebration(30);
            this.bounceNotification('🎉 Great energy and mood! Keep it up!', 'success');
        } else if (energy <= 3 || mood <= 3) {
            this.bounceNotification('💙 Take care of yourself. Try a break.', 'info');
        }
    }
}

// ===== ADD ANIMATIONS TO EXISTING FUNCTIONS =====

// 1. Animate fuel increase
function animateFuelIncrease(oldFuel, newFuel) {
    if (newFuel > oldFuel) {
        Animations.fuelEarned(newFuel - oldFuel);
    }
}

// 2. Animate task completion
function animateTaskCompletion(taskText) {
    Animations.showFloatingNumber('✅ ' + taskText, '#00ff88');
    Animations.buttonClick(event?.target);
    
    if (Math.random() > 0.7) { // 30% chance for confetti
        setTimeout(() => Animations.confettiCelebration(20), 500);
    }
}

// 3. Animate timer start
function animateTimerStart() {
    Animations.buttonClick(document.getElementById('startBtn'));
    Animations.timerPulse();
}

// 4. Animate mood logging
function animateMoodLogging(energy, mood) {
    Animations.buttonClick(document.getElementById('logMoodBtn'));
    Animations.moodLoggedCelebration(energy, mood);
}

// ===== QUICK TEST FUNCTIONS =====
window.testAnimations = function() {
    console.log("Testing animations...");
    
    // Test fuel animation
    Animations.fuelEarned(10);
    
    // Test notification
    Animations.bounceNotification('✨ Animation test successful!', 'success');
    
    // Test confetti
    setTimeout(() => Animations.confettiCelebration(30), 1000);
    
    // Test shake
    setTimeout(() => Animations.shakeElement('timer'), 1500);
};

console.log("🎬 Animation system ready!");
// ===== ANIMATION ENHANCEMENTS - JUST ADD THIS =====

// 1. ANIMATE FUEL INCREASES
const originalFuelDisplay = document.getElementById('fuel');
if (originalFuelDisplay) {
    // Watch for fuel changes
    let lastFuel = parseInt(originalFuelDisplay.textContent) || 0;
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'characterData' || mutation.type === 'childList') {
                const newFuel = parseInt(originalFuelDisplay.textContent) || 0;
                if (newFuel > lastFuel) {
                    // Fuel increased - animate!
                    originalFuelDisplay.classList.add('fuel-earned');
                    setTimeout(() => {
                        originalFuelDisplay.classList.remove('fuel-earned');
                    }, 1500);
                    
                    // Show floating number
                    const floatDiv = document.createElement('div');
                    floatDiv.textContent = '+' + (newFuel - lastFuel) + '⚡';
                    floatDiv.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        font-size: 3rem;
                        font-weight: bold;
                        color: #00ff88;
                        z-index: 1000;
                        pointer-events: none;
                        animation: floatUp 1.5s ease-out forwards;
                        text-shadow: 0 0 20px rgba(0,0,0,0.5);
                    `;
                    document.body.appendChild(floatDiv);
                    setTimeout(() => floatDiv.remove(), 1500);
                }
                lastFuel = newFuel;
            }
        });
    });
    
    observer.observe(originalFuelDisplay, {
        childList: true,
        characterData: true,
        subtree: true
    });
}

// 2. ANIMATE BUTTON CLICKS
document.querySelectorAll('.btn, .tag, .buy-btn, .mode-btn').forEach(button => {
    button.addEventListener('click', function() {
        this.classList.add('glow-effect');
        setTimeout(() => {
            this.classList.remove('glow-effect');
        }, 1000);
    });
});

// 3. ANIMATE TIMER
const timerDisplay = document.getElementById('timer');
if (timerDisplay) {
    // Pulse every minute
    setInterval(() => {
        if (window.isRunning) {
            timerDisplay.classList.add('glow-effect');
            setTimeout(() => {
                timerDisplay.classList.remove('glow-effect');
            }, 500);
        }
    }, 60000); // Every minute
    
    // Pulse on start
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            timerDisplay.classList.add('glow-effect');
            setTimeout(() => {
                timerDisplay.classList.remove('glow-effect');
            }, 2000);
        });
    }
}

// 4. ANIMATE TASK COMPLETION
if (typeof todoList !== 'undefined') {
    // Override toggleTodo to add animation
    const originalToggleTodo = window.toggleTodo;
    if (originalToggleTodo) {
        window.toggleTodo = function(id) {
            // Find task text before toggling
            const taskElement = document.querySelector(`[data-id="${id}"]`);
            const taskText = taskElement ? taskElement.querySelector('.todo-text').textContent : '';
            
            // Call original function
            originalToggleTodo(id);
            
            // Check if it's now completed
            setTimeout(() => {
                const updatedElement = document.querySelector(`[data-id="${id}"]`);
                if (updatedElement && updatedElement.classList.contains('completed')) {
                    // Task completed - animate!
                    updatedElement.classList.add('float-up');
                    
                    // Show celebration
                    const floatDiv = document.createElement('div');
                    floatDiv.textContent = '✅ ' + taskText.split(' ')[0];
                    floatDiv.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        font-size: 2rem;
                        font-weight: bold;
                        color: #00ff88;
                        z-index: 1000;
                        pointer-events: none;
                        animation: floatUp 1.5s ease-out forwards;
                    `;
                    document.body.appendChild(floatDiv);
                    setTimeout(() => floatDiv.remove(), 1500);
                }
            }, 100);
        };
    }
}

// 5. ANIMATE MOOD LOGGING
const logMoodBtn = document.getElementById('logMoodBtn');
if (logMoodBtn) {
    const originalClick = logMoodBtn.onclick;
    logMoodBtn.addEventListener('click', function(e) {
        // Get energy and mood values
        const energySlider = document.getElementById('energySlider');
        const moodSlider = document.getElementById('moodSlider');
        const energy = energySlider ? energySlider.value : 5;
        const mood = moodSlider ? moodSlider.value : 5;
        
        // Show animation based on mood
        setTimeout(() => {
            if (energy >= 7 && mood >= 7) {
                // Good mood - confetti
                for (let i = 0; i < 30; i++) {
                    setTimeout(() => {
                        const confetti = document.createElement('div');
                        confetti.style.cssText = `
                            position: fixed;
                            top: -10px;
                            left: ${Math.random() * 100}%;
                            width: ${Math.random() * 10 + 5}px;
                            height: ${Math.random() * 10 + 5}px;
                            background: ${['#ff0000', '#00ff88', '#00d4ff', '#ffd700', '#9c27b0'][Math.floor(Math.random() * 5)]};
                            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                            animation: confetti-fall ${Math.random() * 3 + 2}s linear forwards;
                            z-index: 1000;
                        `;
                        document.body.appendChild(confetti);
                        setTimeout(() => confetti.remove(), 5000);
                    }, i * 50);
                }
            }
        }, 500);
    });
}

// 6. AUTO-SLIDE IN ELEMENTS ON LOAD
document.addEventListener('DOMContentLoaded', function() {
    // Slide in main sections
    const sections = ['timer', 'mood-tracker', 'todo-section', 'shop'];
    sections.forEach((id, index) => {
        const element = document.getElementById(id);
        if (element) {
            setTimeout(() => {
                element.classList.add('slide-in');
            }, index * 200);
        }
    });
});

// 7. ADD CONFETTI ANIMATION CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes confetti-fall {
        0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
    
    @keyframes floatUp {
        0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -150px) scale(1.5);
            opacity: 0;
        }
    }
    
    .fuel-earned {
        animation: pulse 0.5s ease-in-out 3;
    }
    
    .glow-effect {
        animation: glow 2s;
    }
    
    .slide-in {
        animation: slideIn 0.5s ease-out;
    }
    
    .float-up {
        animation: floatUp 1s ease-out forwards;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.3); }
        100% { transform: scale(1); }
    }
    
    @keyframes glow {
        0%, 100% { 
            box-shadow: 0 0 5px rgba(0, 255, 136, 0.5);
        }
        50% { 
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.8), 
                       0 0 30px rgba(0, 255, 136, 0.4);
        }
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

console.log("✨ Animations added successfully!");