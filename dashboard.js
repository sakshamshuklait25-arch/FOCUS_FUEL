// Dashboard Analytics
document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    initEnergyChart();
    initMoodChart();
    updateDashboardData();
    
    // Update every 30 seconds
    setInterval(updateDashboardData, 30000);
});

function initEnergyChart() {
    const ctx = document.getElementById('energyChart').getContext('2d');
    window.energyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM'],
            datasets: [{
                label: 'Energy Level',
                data: [8, 7, 6, 5, 4, 5, 6, 5],
                borderColor: '#00ff88',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    min: 0,
                    max: 10,
                    ticks: { stepSize: 2 }
                }
            }
        }
    });
}

function initMoodChart() {
    const ctx = document.getElementById('moodChart').getContext('2d');
    window.moodChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Average Mood',
                data: [7, 6, 8, 5, 7, 9, 8],
                backgroundColor: 'rgba(0, 212, 255, 0.7)',
                borderColor: '#00d4ff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    min: 0,
                    max: 10,
                    ticks: { stepSize: 2 }
                }
            }
        }
    });
}

function updateDashboardData() {
    if (typeof aiCoach === 'undefined') return;
    
    const report = aiCoach.getWeeklyReport();
    const patterns = aiCoach.analyzePatterns();
    
    // Update burnout risk
    const riskScore = Math.round(patterns.burnoutRisk || 25);
    document.getElementById('riskScore').textContent = riskScore + '%';
    
    const riskCircle = document.querySelector('.risk-circle');
    riskCircle.style.background = `conic-gradient(
        ${getRiskColor(riskScore)} ${riskScore * 3.6}deg,
        rgba(255,255,255,0.1) 0deg
    )`;
    
    // Update risk message
    const riskMessage = document.getElementById('riskMessage');
    const riskTips = document.getElementById('riskTips');
    
    if (riskScore > 70) {
        riskMessage.textContent = 'High risk - Consider taking a break!';
        riskMessage.style.color = '#ff4444';
        riskTips.innerHTML = `
            <p><i class="fas fa-exclamation"></i> Take a full day off</p>
            <p><i class="fas fa-exclamation"></i> Reduce work hours</p>
        `;
    } else if (riskScore > 40) {
        riskMessage.textContent = 'Moderate risk - Monitor energy levels';
        riskMessage.style.color = '#ffaa00';
        riskTips.innerHTML = `
            <p><i class="fas fa-check"></i> Schedule more breaks</p>
            <p><i class="fas fa-check"></i> Try mindfulness exercises</p>
        `;
    } else {
        riskMessage.textContent = 'Low risk - Keep maintaining balance!';
        riskMessage.style.color = '#00ff88';
        riskTips.innerHTML = `
            <p><i class="fas fa-check"></i> Regular breaks taken</p>
            <p><i class="fas fa-check"></i> Energy levels stable</p>
        `;
    }
    
    // Update energy chart
    if (window.energyChart && report.energyTrend.length > 0) {
        const recentEnergy = report.energyTrend.slice(-8); // Last 8 entries
        window.energyChart.data.datasets[0].data = recentEnergy;
        
        // Generate time labels
        const labels = [];
        const now = new Date();
        for (let i = 7; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60 * 60 * 1000);
            labels.push(time.getHours() + ':00');
        }
        window.energyChart.data.labels = labels;
        window.energyChart.update();
    }
    
    // Update productivity score
    document.getElementById('productivityScore').textContent = 
        Math.round(report.productivityScore);
    
    // Update recommendations
    const recContainer = document.getElementById('recommendations');
    if (report.recommendations && report.recommendations.length > 0) {
        recContainer.innerHTML = report.recommendations.map((rec, i) => `
            <div class="recommendation">
                <i class="fas fa-${i === 0 ? 'sun' : i === 1 ? 'walking' : 'moon'}"></i>
                <div>
                    <h4>${rec.split(' - ')[0] || rec}</h4>
                    <p>${rec.split(' - ')[1] || 'Based on your recent patterns'}</p>
                </div>
            </div>
        `).join('');
    }
    
    // Update other stats
    document.getElementById('peakHours').textContent = patterns.peakEnergyTime || '9-11 AM';
    document.getElementById('avgEnergy').textContent = patterns.avgEnergy ? 
        patterns.avgEnergy.toFixed(1) : '7.2';
}

function getRiskColor(score) {
    if (score > 70) return '#ff4444';
    if (score > 40) return '#ffaa00';
    return '#00ff88';
}