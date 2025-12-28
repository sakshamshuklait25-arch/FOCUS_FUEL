// ===== GLOBAL VARIABLES =====
let timer;
let timeLeft;
let isRunning = false;
let currentMode = 'focus';
let fuel = 0;
let streak = 0;
let sessionsToday = 0;
let upgrades = {
    coffee: false,
    music: false,
    streak: false
};

// Default times
const DEFAULT_FOCUS_TIME = 25 * 60;
const DEFAULT_BREAK_TIME = 5 * 60;
let focusTime = DEFAULT_FOCUS_TIME;
let breakTime = DEFAULT_BREAK_TIME;

// DOM Elements
let timerDisplay;
let startBtn;
let pauseBtn;
let resetBtn;
let fuelDisplay;
let streakDisplay;
let sessionsDisplay;
let modeButtons;
let buyButtons;
let quickStartButtons;
let completeSound;
let clickSound;

// Mood Tracker Elements
let energySlider;
let moodSlider;
let energyValue;
let moodValue;
let logMoodBtn;
let recordBtn;
let tags;
let voiceStatus;

// ===== SIMPLE LOGIN SYSTEM =====
window.addEventListener('load', function() {
    console.log("=== FOCUSFUEL STARTING ===");
    
    // Initialize DOM elements
    initDOMElements();
    
    // Check login
    const loginScreen = document.getElementById('loginScreen');
    const appContent = document.getElementById('appContent');
    const usernameInput = document.getElementById('usernameInput');
    const startAsGuest = document.getElementById('startAsGuest');
    
    const savedUsername = localStorage.getItem('focusfuel_username');
    
    if (savedUsername) {
        loginScreen.style.display = 'none';
        appContent.style.display = 'block';
        updateWelcomeMessage(savedUsername);
        initializeApp();
    } else {
        loginScreen.style.display = 'flex';
        appContent.style.display = 'none';
    }
    
    if (startAsGuest) {
        startAsGuest.addEventListener('click', function() {
            const username = usernameInput.value.trim() || 'Focus Warrior';
            localStorage.setItem('focusfuel_username', username);
            
            loginScreen.style.opacity = '0';
            appContent.style.display = 'block';
            
            setTimeout(() => {
                loginScreen.style.display = 'none';
                updateWelcomeMessage(username);
                initializeApp();
            }, 500);
        });
    }
});

function initDOMElements() {
    // Timer elements
    timerDisplay = document.getElementById('timer');
    startBtn = document.getElementById('startBtn');
    pauseBtn = document.getElementById('pauseBtn');
    resetBtn = document.getElementById('resetBtn');
    fuelDisplay = document.getElementById('fuel');
    streakDisplay = document.getElementById('streak');
    sessionsDisplay = document.getElementById('sessions');
    modeButtons = document.querySelectorAll('.mode-btn');
    buyButtons = document.querySelectorAll('.buy-btn');
    quickStartButtons = document.querySelectorAll('.quick-btn');
    completeSound = document.getElementById('completeSound');
    clickSound = document.getElementById('clickSound');
    
    // Mood tracker elements
    energySlider = document.getElementById('energySlider');
    moodSlider = document.getElementById('moodSlider');
    energyValue = document.getElementById('energyValue');
    moodValue = document.getElementById('moodValue');
    logMoodBtn = document.getElementById('logMoodBtn');
    recordBtn = document.getElementById('recordBtn');
    tags = document.querySelectorAll('.tag');
    voiceStatus = document.getElementById('voiceStatus');
}

function updateWelcomeMessage(username) {
    const header = document.querySelector('header h1');
    if (header) {
        header.innerHTML = `<i class="fas fa-bolt"></i> Welcome, ${username}!`;
    }
}

// ===== INITIALIZE APP =====
function initializeApp() {
    console.log('⚡ FocusFuel AI Loading...');
    
    // Load saved data
    loadGame();
    
    // Initialize timer
    initTimer();
    
    // Setup event listeners
    initEventListeners();
    
    // Initialize mood tracking
    initMoodTracking();
    
    // Initialize Todo List
    initTodoList();
    
    // Initialize daily quote
    initDailyQuote();
    
    // Setup quick start buttons (FIXED)
    setupQuickStartButtons();
    
    // Auto-save
    setInterval(saveGame, 30000);
    
    console.log('✅ FocusFuel AI Ready!');
}

// ===== QUICK START BUTTONS FIX =====
function setupQuickStartButtons() {
    console.log('Setting up Quick Start buttons:', quickStartButtons.length);
    
    if (!quickStartButtons || quickStartButtons.length === 0) {
        console.error('No quick start buttons found!');
        return;
    }
    
    quickStartButtons.forEach(button => {
        // Remove any existing event listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add fresh event listener
        newButton.addEventListener('click', function() {
            console.log('Quick button clicked');
            playClickSound();
            
            const minutes = parseInt(this.getAttribute('data-minutes'));
            if (!isNaN(minutes) && minutes > 0) {
                setQuickFocus(minutes);
            }
        });
    });
}

function setQuickFocus(minutes) {
    console.log(`Setting quick focus to ${minutes} minutes`);
    
    // Stop timer if running
    if (isRunning) {
        if (!confirm(`Switch to ${minutes} min focus? Current timer will reset.`)) {
            return;
        }
        pauseTimer();
    }
    
    // Update focus time
    focusTime = minutes * 60;
    currentMode = 'focus';
    timeLeft = focusTime;
    
    // Update UI
    const focusBtn = document.querySelector('.mode-btn[data-mode="focus"]');
    const breakBtn = document.querySelector('.mode-btn[data-mode="break"]');
    
    if (focusBtn) {
        focusBtn.textContent = `Focus (${minutes}:00)`;
        focusBtn.classList.add('active');
    }
    if (breakBtn) {
        breakBtn.classList.remove('active');
    }
    
    // Update timer display
    updateTimerDisplay();
    
    // Reset timer buttons
    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;
    
    // Show confirmation
    alert(`⚡ Timer set to ${minutes}-minute focus session!\nClick "Start" to begin.`);
}

// ===== TIMER FUNCTIONS =====
function initTimer() {
    timeLeft = currentMode === 'focus' ? focusTime : breakTime;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    if (!timerDisplay) return;
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Color change warning
    if (timeLeft <= 60) {
        timerDisplay.style.color = '#ff4444';
    } else if (currentMode === 'focus') {
        timerDisplay.style.color = '#00ff88';
    } else {
        timerDisplay.style.color = '#00d4ff';
    }
}

function startTimer() {
    if (isRunning) return;
    
    playClickSound();
    isRunning = true;
    
    if (startBtn) startBtn.disabled = true;
    if (pauseBtn) pauseBtn.disabled = false;
    
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

function pauseTimer() {
    if (!isRunning) return;
    
    playClickSound();
    isRunning = false;
    clearInterval(timer);
    
    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;
}

function resetTimer() {
    playClickSound();
    pauseTimer();
    initTimer();
}

function completeSession() {
    clearInterval(timer);
    isRunning = false;
    
    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;
    
    if (completeSound) {
        try {
            completeSound.currentTime = 0;
            completeSound.play();
        } catch (e) {
            console.log("Sound error:", e);
        }
    }
    
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
    
    // Update mode buttons
    if (modeButtons) {
        modeButtons.forEach(btn => {
            if (btn) {
                btn.classList.remove('active');
                if (btn.dataset.mode === currentMode) {
                    btn.classList.add('active');
                }
            }
        });
    }
    
    // Notify
    alert(currentMode === 'focus' ? 'Time to focus! ⚡' : 'Break time! ☕');
    
    // Update timer for new mode
    if (currentMode === 'focus') {
        timeLeft = focusTime;
    } else {
        timeLeft = breakTime;
    }
    
    updateTimerDisplay();
    updateDisplay();
}

// ===== GAME FUNCTIONS =====
function addFuel(amount) {
    fuel += amount;
    updateDisplay();
    saveGame();
}

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
                alert('Lofi beats unlocked! 🎵');
            } else if (upgradeId === 'streak') {
                alert('Streak Shield activated! 🔥');
            }
        }
        
        updateDisplay();
        saveGame();
        playClickSound();
    }
}

function updateDisplay() {
    if (fuelDisplay) fuelDisplay.textContent = fuel;
    if (streakDisplay) streakDisplay.textContent = streak;
    if (sessionsDisplay) sessionsDisplay.textContent = sessionsToday;
}

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
            
            updateDisplay();
        } catch (e) {
            console.log("Error loading saved data:", e);
        }
    }
    
    // Check for new day
    checkNewDay();
}

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

// ===== MOOD TRACKING =====
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
    
    if (tags && tags.length > 0) {
        tags.forEach(tag => {
            tag.addEventListener('click', () => {
                tag.classList.toggle('active');
            });
        });
    }
    
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
            alert(`✅ Mood logged!\nEnergy: ${energy}/10\nMood: ${mood}/10\n+5 ⚡ Fuel added`);
            
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
function initEventListeners() {
    // Timer controls
    if (startBtn) {
        startBtn.addEventListener('click', startTimer);
    }
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', pauseTimer);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetTimer);
    }
    
    // Mode buttons
    if (modeButtons) {
        modeButtons.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    if (isRunning) {
                        alert('Stop the timer first to change mode!');
                        return;
                    }
                    
                    playClickSound();
                    currentMode = btn.dataset.mode;
                    
                    modeButtons.forEach(b => {
                        if (b) b.classList.remove('active');
                    });
                    btn.classList.add('active');
                    
                    initTimer();
                });
            }
        });
    }
    
    // Buy buttons
    if (buyButtons) {
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
    }
}

// ===== HELPER FUNCTIONS =====
function playClickSound() {
    if (clickSound) {
        try {
            clickSound.currentTime = 0;
            clickSound.play();
        } catch (e) {
            console.log("Sound error:", e);
        }
    }
}

// ===== DAILY QUOTE =====
function initDailyQuote() {
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
    
    const quoteElement = document.getElementById('dailyQuote');
    const newQuoteBtn = document.getElementById('newQuoteBtn');
    
    if (quoteElement) {
        const today = new Date().toDateString();
        const quoteIndex = Math.abs(hashCode(today)) % quotes.length;
        quoteElement.textContent = quotes[quoteIndex];
    }
    
    if (newQuoteBtn) {
        newQuoteBtn.addEventListener('click', function() {
            if (quoteElement) {
                const randomIndex = Math.floor(Math.random() * quotes.length);
                quoteElement.textContent = quotes[randomIndex];
                playClickSound();
            }
        });
    }
    
    function hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return hash;
    }
}

// ===== TO-DO LIST =====
let todoList;

function initTodoList() {
    todoList = {
        todos: [],
        
        init: function() {
            this.loadTodos();
            this.setupEventListeners();
            this.render();
        },
        
        loadTodos: function() {
            try {
                const saved = localStorage.getItem('focusFuel_todos');
                this.todos = saved ? JSON.parse(saved) : [];
            } catch (e) {
                this.todos = [];
            }
        },
        
        saveTodos: function() {
            localStorage.setItem('focusFuel_todos', JSON.stringify(this.todos));
        },
        
        addTodo: function(text, type = 'focus') {
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
            
            // Award fuel
            addFuel(2);
            
            return todo;
        },
        
        toggleTodo: function(id) {
            const todo = this.todos.find(t => t.id === id);
            if (todo) {
                todo.completed = !todo.completed;
                this.saveTodos();
                this.render();
                this.updateStats();
                
                if (todo.completed) {
                    addFuel(5);
                }
            }
        },
        
        deleteTodo: function(id) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.render();
            this.updateStats();
        },
        
        clearCompleted: function() {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveTodos();
            this.render();
            this.updateStats();
        },
        
        updateStats: function() {
            const totalTasks = this.todos.length;
            const completedTasks = this.todos.filter(t => t.completed).length;
            const focusTasks = this.todos.filter(t => t.type === 'focus' && !t.completed).length;
            
            document.getElementById('totalTasks').textContent = totalTasks;
            document.getElementById('completedTasks').textContent = completedTasks;
            document.getElementById('focusTasks').textContent = focusTasks;
        },
        
        render: function() {
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
                           onclick="window.todoList.toggleTodo(${todo.id})">
                    
                    <span class="todo-text ${todo.completed ? 'completed' : ''}">
                        ${todo.text}
                        <span class="task-type ${todo.type}">
                            ${this.getTypeIcon(todo.type)} ${todo.type}
                        </span>
                    </span>
                    
                    <button class="delete-todo" onclick="window.todoList.deleteTodo(${todo.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
        },
        
        getTypeIcon: function(type) {
            const icons = {
                'focus': '🎯',
                'break': '☕',
                'quick': '⚡'
            };
            return icons[type] || '📝';
        },
        
        setupEventListeners: function() {
            const addBtn = document.getElementById('addTodoBtn');
            const input = document.getElementById('todoInput');
            const taskType = document.getElementById('taskType');
            
            if (addBtn && input) {
                addBtn.addEventListener('click', () => {
                    this.addTodo(input.value, taskType.value);
                    input.value = '';
                    input.focus();
                    playClickSound();
                });
                
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.addTodo(input.value, taskType.value);
                        input.value = '';
                    }
                });
            }
            
            const clearBtn = document.getElementById('clearCompleted');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    this.clearCompleted();
                    playClickSound();
                });
            }
            
            const focusBtn = document.getElementById('focusMode');
            if (focusBtn) {
                focusBtn.addEventListener('click', () => {
                    const focusTasks = this.todos.filter(t => 
                        t.type === 'focus' && !t.completed
                    );
                    
                    if (focusTasks.length > 0) {
                        alert(`🎯 Starting focus session with ${focusTasks.length} tasks!`);
                        if (window.startTimer) {
                            startTimer();
                        }
                    } else {
                        alert("No focus tasks to work on. Add some first!");
                    }
                    playClickSound();
                });
            }
        }
    };
    
    todoList.init();
    window.todoList = todoList;
}

// ===== AI COACH =====
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
        this.checkForSuggestions();
        
        return entry;
    },
    
    saveHistory: function() {
        localStorage.setItem('aiCoach_moodHistory', JSON.stringify(this.moodHistory));
    },
    
    loadHistory: function() {
        const saved = localStorage.getItem('aiCoach_moodHistory');
        if (saved) {
            this.moodHistory = JSON.parse(saved) || [];
        }
    },
    
    checkForSuggestions: function() {
        // Simple suggestion logic
        if (this.moodHistory.length > 0) {
            const latest = this.moodHistory[this.moodHistory.length - 1];
            
            if (latest.energy < 4) {
                this.showSuggestion('low-energy');
            } else if (latest.mood < 4) {
                this.showSuggestion('low-mood');
            } else if (latest.stressTags.length > 0) {
                this.showSuggestion('high-stress');
            }
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
        
        suggestionsContainer.innerHTML = `
            <div class="suggestion active">
                <i class="${suggestion.icon}"></i>
                <div>
                    <h4>${suggestion.title}</h4>
                    <p>${suggestion.description}</p>
                </div>
                <button class="start-intervention">Start</button>
            </div>
        `;
        
        // Add click handler
        suggestionsContainer.querySelector('.start-intervention').addEventListener('click', () => {
            alert(`Starting ${suggestion.title}... ⏱️\n\nClose this and the AI will start a timer.`);
        });
    }
};

// Load AI coach history
aiCoach.loadHistory();
