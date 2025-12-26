// SIMPLE AI COACH - Working Version
const aiCoach = {
    moodHistory: [],
    patterns: {},
    interventions: [],
    workSessionStart: null,
    
    init: function() {
        console.log("✅ AI Coach initialized");
        this.loadHistory();
        this.startWorkSessionMonitoring();
    },
    
    logEntry: function(energy, mood, stressTags = []) {
        const entry = {
            timestamp: new Date().toLocaleTimeString(),
            energy: parseInt(energy),
            mood: parseInt(mood),
            stressTags: stressTags
        };
        
        this.moodHistory.push(entry);
        this.saveHistory();
        console.log("📝 Mood logged:", entry);
        
        // Award fuel for logging
        this.awardFuel(5);
        
        return entry;
    },
    
    awardFuel: function(amount) {
        const fuelDisplay = document.getElementById('fuel');
        if (fuelDisplay) {
            let currentFuel = parseInt(fuelDisplay.textContent) || 0;
            fuelDisplay.textContent = currentFuel + amount;
            localStorage.setItem('focusFuel_fuel', currentFuel + amount);
        }
    },
    
    loadHistory: function() {
        const saved = localStorage.getItem('focusFuel_moodHistory');
        if (saved) {
            this.moodHistory = JSON.parse(saved);
        }
        console.log("📊 Loaded history:", this.moodHistory.length, "entries");
    },
    
    saveHistory: function() {
        localStorage.setItem('focusFuel_moodHistory', JSON.stringify(this.moodHistory));
    },
    
    startWorkSessionMonitoring: function() {
        this.workSessionStart = new Date();
        console.log("⏱️ Work session started");
    },
    
    getSuggestions: function() {
        const latest = this.moodHistory[this.moodHistory.length - 1];
        if (!latest) return [];
        
        const suggestions = [];
        
        if (latest.energy < 4) {
            suggestions.push({
                name: "2-Minute Breathing",
                reason: "Low energy detected",
                duration: 120
            });
        }
        
        if (latest.mood < 4) {
            suggestions.push({
                name: "Quick Walk",
                reason: "Low mood detected",
                duration: 180
            });
        }
        
        if (latest.stressTags.length > 0) {
            suggestions.push({
                name: "Stress Relief",
                reason: "Stress factors identified",
                duration: 60
            });
        }
        
        return suggestions.slice(0, 2); // Max 2 suggestions
    }
};

// Initialize AI Coach when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        aiCoach.init();
    });
} else {
    aiCoach.init();
}

console.log("🤖 AI Coach ready");