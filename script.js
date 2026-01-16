// Data Management
let activities = [];
let goals = [];
let categories = ['Work', 'Study', 'Exercise', 'Personal', 'Creative', 'Social'];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    updateDateInput();
    updateTimeInput();
    renderDashboard();
    
    // Handle window resize for mobile orientation changes
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            renderDashboard();
        }, 250);
    });
});

// Load data from localStorage
function loadData() {
    const savedActivities = localStorage.getItem('dashboardActivities');
    const savedGoals = localStorage.getItem('dashboardGoals');
    const savedCategories = localStorage.getItem('dashboardCategories');
    
    if (savedActivities) {
        activities = JSON.parse(savedActivities).map(activity => ({
            ...activity,
            date: new Date(activity.date)
        }));
    }
    
    if (savedGoals) {
        goals = JSON.parse(savedGoals);
    }
    
    if (savedCategories) {
        categories = JSON.parse(savedCategories);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('dashboardActivities', JSON.stringify(activities));
    localStorage.setItem('dashboardGoals', JSON.stringify(goals));
    localStorage.setItem('dashboardCategories', JSON.stringify(categories));
}

// Setup event listeners
function setupEventListeners() {
    // Modal controls
    document.getElementById('addDataBtn').addEventListener('click', () => openDataModal());
    document.getElementById('addGoalBtn').addEventListener('click', () => openGoalModal());
    document.getElementById('closeModal').addEventListener('click', closeDataModal);
    document.getElementById('cancelData').addEventListener('click', closeDataModal);
    document.getElementById('closeGoalModal').addEventListener('click', closeGoalModal);
    document.getElementById('cancelGoal').addEventListener('click', closeGoalModal);
    
    // Forms
    document.getElementById('dataForm').addEventListener('submit', handleAddActivity);
    document.getElementById('goalForm').addEventListener('submit', handleAddGoal);
    
    // Date range filter
    document.getElementById('dateRange').addEventListener('change', renderDashboard);
    
    // Chart controls
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const chartType = e.target.dataset.chart;
            const dataType = e.target.dataset.type;
            
            // Update active state
            e.target.parentElement.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            if (chartType === 'timeline') {
                renderTimelineChart(dataType);
            } else if (chartType === 'performance') {
                renderPerformanceChart(dataType);
            }
        });
    });
    
    // Search and filter
    document.getElementById('searchLog').addEventListener('input', renderActivityTable);
    document.getElementById('categoryFilter').addEventListener('change', renderActivityTable);
    
    // Close modal on outside click
    document.getElementById('dataModal').addEventListener('click', (e) => {
        if (e.target.id === 'dataModal') closeDataModal();
    });
    document.getElementById('goalModal').addEventListener('click', (e) => {
        if (e.target.id === 'goalModal') closeGoalModal();
    });
}

// Update date input to today
function updateDateInput() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('activityDate').value = today;
}

// Update time input to current time
function updateTimeInput() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('activityTime').value = `${hours}:${minutes}`;
}

// Open data modal
function openDataModal() {
    document.getElementById('dataModal').classList.add('active');
    updateDateInput();
    updateTimeInput();
    updateCategorySelect();
}

// Close data modal
function closeDataModal() {
    document.getElementById('dataModal').classList.remove('active');
    document.getElementById('dataForm').reset();
    updateDateInput();
    updateTimeInput();
}

// Update category select
function updateCategorySelect() {
    const select = document.getElementById('activityCategory');
    const currentValue = select.value;
    
    // Clear existing options except first
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Add categories
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
    
    if (currentValue && categories.includes(currentValue)) {
        select.value = currentValue;
    }
}

// Handle add activity
function handleAddActivity(e) {
    e.preventDefault();
    
    const date = document.getElementById('activityDate').value;
    const time = document.getElementById('activityTime').value;
    let category = document.getElementById('activityCategory').value;
    const newCategory = document.getElementById('newCategory').value.trim();
    const name = document.getElementById('activityName').value.trim();
    const duration = parseFloat(document.getElementById('activityDuration').value);
    const score = document.getElementById('activityScore').value ? parseInt(document.getElementById('activityScore').value) : null;
    const notes = document.getElementById('activityNotes').value.trim();
    
    // Handle new category
    if (newCategory && !categories.includes(newCategory)) {
        categories.push(newCategory);
        category = newCategory;
    }
    
    if (!category || !name || !duration || !time) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Combine date and time
    const dateTime = new Date(`${date}T${time}`);
    
    const activity = {
        id: Date.now(),
        date: dateTime,
        entryTime: time, // Store entry time separately
        category,
        name,
        duration,
        score,
        notes
    };
    
    activities.push(activity);
    activities.sort((a, b) => b.date - a.date);
    
    saveData();
    closeDataModal();
    renderDashboard();
}

// Handle add goal
function handleAddGoal(e) {
    e.preventDefault();
    
    const name = document.getElementById('goalName').value.trim();
    const target = parseFloat(document.getElementById('goalTarget').value);
    const unit = document.getElementById('goalUnit').value.trim() || 'hours';
    const category = document.getElementById('goalCategory').value;
    
    if (!name || !target) {
        alert('Please fill in all required fields');
        return;
    }
    
    const goal = {
        id: Date.now(),
        name,
        target,
        unit,
        category: category || null,
        createdAt: new Date().toISOString()
    };
    
    goals.push(goal);
    saveData();
    closeGoalModal();
    renderDashboard();
}

// Render entire dashboard
function renderDashboard() {
    const dateRange = document.getElementById('dateRange').value;
    const filteredActivities = getFilteredActivities(dateRange);
    
    updateMetrics(filteredActivities);
    renderTimelineChart('hours');
    renderPieChart(filteredActivities);
    renderPerformanceChart('weekly');
    renderBarChart(filteredActivities);
    renderGoals();
    renderActivityTable();
    renderInsights(filteredActivities);
    updateStats(filteredActivities);
    updateCategoryFilter();
}

// Get filtered activities by date range
function getFilteredActivities(range) {
    if (range === 'all') return activities;
    
    const days = parseInt(range);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return activities.filter(activity => activity.date >= cutoffDate);
}

// Update metrics
function updateMetrics(filteredActivities) {
    const total = activities.length;
    const completed = goals.filter(g => {
        const progress = calculateGoalProgress(g);
        return progress >= 100;
    }).length;
    const pending = total - completed;
    
    const totalHours = filteredActivities.reduce((sum, a) => sum + a.duration, 0);
    const avgHours = filteredActivities.length > 0 ? totalHours / filteredActivities.length : 0;
    
    // Calculate streak
    const streak = calculateStreak();
    
    // Calculate average score
    const scoredActivities = filteredActivities.filter(a => a.score !== null);
    const avgScore = scoredActivities.length > 0
        ? Math.round(scoredActivities.reduce((sum, a) => sum + a.score, 0) / scoredActivities.length)
        : 0;
    
    document.getElementById('goalsCompleted').textContent = completed;
    document.getElementById('totalHours').textContent = totalHours.toFixed(1);
    document.getElementById('activeStreak').textContent = streak;
    document.getElementById('averageScore').textContent = avgScore;
    
    // Update change indicators
    const prevPeriod = getFilteredActivities(parseInt(document.getElementById('dateRange').value) * 2);
    const prevHours = prevPeriod.reduce((sum, a) => sum + a.duration, 0);
    const hoursChange = totalHours - prevHours;
    document.getElementById('hoursChange').textContent = `${hoursChange >= 0 ? '+' : ''}${hoursChange.toFixed(1)} hrs`;
    document.getElementById('hoursChange').className = `metric-change ${hoursChange >= 0 ? 'positive' : 'negative'}`;
}

// Calculate streak
function calculateStreak() {
    if (activities.length === 0) return 0;
    
    const sortedDates = [...new Set(activities.map(a => 
        a.date.toISOString().split('T')[0]
    ))].sort().reverse();
    
    if (sortedDates.length === 0) return 0;
    
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date(today);
    
    for (let dateStr of sortedDates) {
        const date = new Date(dateStr);
        const diffDays = Math.floor((currentDate - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === streak) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    return streak;
}

// Render timeline chart
function renderTimelineChart(type) {
    const canvas = document.getElementById('timelineChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dateRange = document.getElementById('dateRange').value;
    const filteredActivities = getFilteredActivities(dateRange);
    
    // Get device pixel ratio for crisp rendering on mobile
    const dpr = window.devicePixelRatio || 1;
    const container = canvas.parentElement;
    const containerRect = container.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;
    
    // Set canvas CSS size first (this is what the browser uses for layout)
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    // Set actual canvas size (for drawing)
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    // Scale context to handle high DPI displays
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    if (filteredActivities.length === 0) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No data available', width / 2, height / 2);
        return;
    }
    
    // Group by date
    const dataMap = new Map();
    filteredActivities.forEach(activity => {
        const dateKey = activity.date.toISOString().split('T')[0];
        if (!dataMap.has(dateKey)) {
            dataMap.set(dateKey, { hours: 0, count: 0 });
        }
        const data = dataMap.get(dateKey);
        data.hours += activity.duration;
        data.count += 1;
    });
    
    const sortedDates = Array.from(dataMap.keys()).sort();
    const values = sortedDates.map(date => 
        type === 'hours' ? dataMap.get(date).hours : dataMap.get(date).count
    );
    
    const maxValue = Math.max(...values, 1);
    const padding = Math.min(60, width * 0.1); // Responsive padding
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const stepX = chartWidth / (sortedDates.length - 1 || 1);
    
    // Draw grid
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Draw line
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#2292A4');
    gradient.addColorStop(0.5, '#BDBF09');
    gradient.addColorStop(1, '#D96C06');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    values.forEach((value, index) => {
        const x = padding + stepX * index;
        const y = padding + chartHeight - (value / maxValue) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // Draw points
    ctx.fillStyle = '#2292A4';
    values.forEach((value, index) => {
        const x = padding + stepX * index;
        const y = padding + chartHeight - (value / maxValue) * chartHeight;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw labels
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    
    // X-axis labels (show some dates)
    const labelStep = Math.max(1, Math.floor(sortedDates.length / 5));
    sortedDates.forEach((date, index) => {
        if (index % labelStep === 0 || index === sortedDates.length - 1) {
            const x = padding + stepX * index;
            const dateObj = new Date(date);
            const label = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
            ctx.fillText(label, x, height - padding + 20);
        }
    });
    
    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * (5 - i);
        const value = (maxValue / 5) * i;
        ctx.fillText(value.toFixed(1), padding - 10, y + 4);
    }
}

// Render pie chart
function renderPieChart(filteredActivities) {
    const canvas = document.getElementById('pieChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Get device pixel ratio for crisp rendering on mobile
    const dpr = window.devicePixelRatio || 1;
    const container = canvas.parentElement;
    const containerRect = container.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;
    
    // Set canvas CSS size first
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    // Set actual canvas size
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    // Scale context to handle high DPI displays
    ctx.scale(dpr, dpr);
    
    ctx.clearRect(0, 0, width, height);
    
    if (filteredActivities.length === 0) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No data available', width / 2, height / 2);
        return;
    }
    
    // Group by category
    const categoryData = {};
    filteredActivities.forEach(activity => {
        if (!categoryData[activity.category]) {
            categoryData[activity.category] = 0;
        }
        categoryData[activity.category] += activity.duration;
    });
    
    const categories = Object.keys(categoryData);
    const values = Object.values(categoryData);
    const total = values.reduce((sum, v) => sum + v, 0);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;
    
    const colors = ['#2292A4', '#BDBF09', '#D96C06', '#2292A4', '#BDBF09', '#D96C06', '#2292A4'];
    let currentAngle = -Math.PI / 2;
    
    categories.forEach((category, index) => {
        const sliceAngle = (values[index] / total) * Math.PI * 2;
        
        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        
        // Draw label
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(category, labelX, labelY);
        
        // Draw percentage
        ctx.font = '10px sans-serif';
        ctx.fillText(`${((values[index] / total) * 100).toFixed(0)}%`, labelX, labelY + 14);
        
        currentAngle += sliceAngle;
    });
}

// Render performance chart
function renderPerformanceChart(type) {
    const canvas = document.getElementById('performanceChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dateRange = document.getElementById('dateRange').value;
    const filteredActivities = getFilteredActivities(dateRange);
    
    // Get device pixel ratio for crisp rendering on mobile
    const dpr = window.devicePixelRatio || 1;
    const container = canvas.parentElement;
    const containerRect = container.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;
    
    // Set canvas CSS size first
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    // Set actual canvas size
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    // Scale context to handle high DPI displays
    ctx.scale(dpr, dpr);
    
    ctx.clearRect(0, 0, width, height);
    
    const scoredActivities = filteredActivities.filter(a => a.score !== null);
    if (scoredActivities.length === 0) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No score data available', width / 2, height / 2);
        return;
    }
    
    // Group by period
    const dataMap = new Map();
    scoredActivities.forEach(activity => {
        let key;
        const date = activity.date;
        
        if (type === 'weekly') {
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().split('T')[0];
        } else {
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }
        
        if (!dataMap.has(key)) {
            dataMap.set(key, []);
        }
        dataMap.get(key).push(activity.score);
    });
    
    const sortedKeys = Array.from(dataMap.keys()).sort();
    const averages = sortedKeys.map(key => {
        const scores = dataMap.get(key);
        return scores.reduce((sum, s) => sum + s, 0) / scores.length;
    });
    
    const maxValue = 100;
    const padding = Math.min(50, width * 0.08);
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = chartWidth / sortedKeys.length * 0.7;
    const stepX = chartWidth / sortedKeys.length;
    
    // Draw bars
    averages.forEach((avg, index) => {
        const x = padding + stepX * index + (stepX - barWidth) / 2;
        const barHeight = (avg / maxValue) * chartHeight;
        const y = padding + chartHeight - barHeight;
        
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, '#2292A4');
        gradient.addColorStop(1, '#BDBF09');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw value
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(avg), x + barWidth / 2, y - 5);
    });
    
    // Draw labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    sortedKeys.forEach((key, index) => {
        const x = padding + stepX * index + stepX / 2;
        const label = type === 'weekly' 
            ? `W${index + 1}` 
            : new Date(key + '-01').toLocaleDateString('en-US', { month: 'short' });
        ctx.fillText(label, x, height - padding + 20);
    });
}

// Render bar chart
function renderBarChart(filteredActivities) {
    const canvas = document.getElementById('barChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Get device pixel ratio for crisp rendering on mobile
    const dpr = window.devicePixelRatio || 1;
    const container = canvas.parentElement;
    const containerRect = container.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;
    
    // Set canvas CSS size first
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    // Set actual canvas size
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    // Scale context to handle high DPI displays
    ctx.scale(dpr, dpr);
    
    ctx.clearRect(0, 0, width, height);
    
    if (filteredActivities.length === 0) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No data available', width / 2, height / 2);
        return;
    }
    
    // Group by activity name
    const activityData = {};
    filteredActivities.forEach(activity => {
        if (!activityData[activity.name]) {
            activityData[activity.name] = 0;
        }
        activityData[activity.name] += activity.duration;
    });
    
    // Get top 5
    const sorted = Object.entries(activityData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const maxValue = Math.max(...sorted.map(s => s[1]), 1);
    const padding = Math.min(50, width * 0.08);
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = chartWidth / sorted.length * 0.6;
    const stepX = chartWidth / sorted.length;
    
    sorted.forEach(([name, value], index) => {
        const x = padding + stepX * index + (stepX - barWidth) / 2;
        const barHeight = (value / maxValue) * chartHeight;
        const y = padding + chartHeight - barHeight;
        
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, '#BDBF09');
        gradient.addColorStop(1, '#D96C06');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw label
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.save();
        ctx.translate(x + barWidth / 2, height - padding + 10);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(name.length > 10 ? name.substring(0, 10) + '...' : name, 0, 0);
        ctx.restore();
        
        // Draw value
        ctx.fillStyle = '#ffffff';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(value.toFixed(1), x + barWidth / 2, y - 5);
    });
}

// Render goals
function renderGoals() {
    const container = document.getElementById('goalsList');
    container.innerHTML = '';
    
    if (goals.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 20px;">No goals set yet. Click "Add Goal" to create one!</div>';
        return;
    }
    
    goals.forEach(goal => {
        const progress = calculateGoalProgress(goal);
        const progressPercent = Math.min(progress, 100);
        
        const goalItem = document.createElement('div');
        goalItem.className = 'goal-item';
        goalItem.innerHTML = `
            <div class="goal-header">
                <span class="goal-name">${goal.name}</span>
                <span class="goal-progress-text">${progress.toFixed(1)}%</span>
            </div>
            <div class="goal-progress-bar">
                <div class="goal-progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            <div class="goal-footer">
                <span>Target: ${goal.target} ${goal.unit}</span>
                <button class="action-btn delete" onclick="deleteGoal(${goal.id})">Delete</button>
            </div>
        `;
        container.appendChild(goalItem);
    });
}

// Calculate goal progress
function calculateGoalProgress(goal) {
    const dateRange = document.getElementById('dateRange').value;
    const filteredActivities = getFilteredActivities(dateRange);
    
    let relevantActivities = filteredActivities;
    if (goal.category) {
        relevantActivities = filteredActivities.filter(a => a.category === goal.category);
    }
    
    const total = relevantActivities.reduce((sum, a) => sum + a.duration, 0);
    return (total / goal.target) * 100;
}

// Delete goal
function deleteGoal(id) {
    if (confirm('Are you sure you want to delete this goal?')) {
        goals = goals.filter(g => g.id !== id);
        saveData();
        renderDashboard();
    }
}

// Render activity table
function renderActivityTable() {
    const tbody = document.getElementById('activityTableBody');
    const searchTerm = document.getElementById('searchLog').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    let filtered = activities;
    
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(a => a.category === categoryFilter);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(a => 
            a.name.toLowerCase().includes(searchTerm) ||
            a.category.toLowerCase().includes(searchTerm) ||
            (a.notes && a.notes.toLowerCase().includes(searchTerm))
        );
    }
    
    tbody.innerHTML = '';
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No activities found</td></tr>';
        return;
    }
    
    filtered.forEach(activity => {
        const row = document.createElement('tr');
        const dateStr = activity.date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        const scoreBadge = activity.score !== null
            ? `<span class="score-badge ${getScoreClass(activity.score)}">${activity.score}</span>`
            : '-';
        
        row.innerHTML = `
            <td>${dateStr}</td>
            <td><span class="category-badge">${activity.category}</span></td>
            <td>${activity.name}</td>
            <td>${activity.duration} hrs</td>
            <td>${scoreBadge}</td>
            <td>
                <button class="action-btn delete" onclick="deleteActivity(${activity.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Get score class
function getScoreClass(score) {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
}

// Delete activity
function deleteActivity(id) {
    if (confirm('Are you sure you want to delete this activity?')) {
        activities = activities.filter(a => a.id !== id);
        saveData();
        renderDashboard();
    }
}

// Update category filter
function updateCategoryFilter() {
    const select = document.getElementById('categoryFilter');
    const currentValue = select.value;
    
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    const uniqueCategories = [...new Set(activities.map(a => a.category))].sort();
    uniqueCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
    
    if (currentValue && uniqueCategories.includes(currentValue)) {
        select.value = currentValue;
    }
}

// Render insights
function renderInsights(filteredActivities) {
    const container = document.getElementById('insightsContent');
    container.innerHTML = '';
    
    if (filteredActivities.length === 0) {
        container.innerHTML = '<div class="insight-item"><p>Add data to see personalized insights!</p></div>';
        return;
    }
    
    const insights = [];
    
    // Most active category
    const categoryHours = {};
    filteredActivities.forEach(a => {
        categoryHours[a.category] = (categoryHours[a.category] || 0) + a.duration;
    });
    const topCategory = Object.entries(categoryHours).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
        insights.push(`Your most active category is <strong>${topCategory[0]}</strong> with ${topCategory[1].toFixed(1)} hours.`);
    }
    
    // Average score trend
    const scoredActivities = filteredActivities.filter(a => a.score !== null);
    if (scoredActivities.length > 0) {
        const avgScore = scoredActivities.reduce((sum, a) => sum + a.score, 0) / scoredActivities.length;
        let trend = 'maintaining';
        if (avgScore >= 80) trend = 'excellent';
        else if (avgScore >= 70) trend = 'good';
        else if (avgScore >= 60) trend = 'fair';
        else trend = 'needs improvement';
        insights.push(`Your average performance score is <strong>${Math.round(avgScore)}</strong> - ${trend} performance!`);
    }
    
    // Activity frequency
    const daysWithActivity = new Set(filteredActivities.map(a => a.date.toISOString().split('T')[0])).size;
    const totalDays = parseInt(document.getElementById('dateRange').value) || 30;
    const frequency = (daysWithActivity / totalDays) * 100;
    if (frequency >= 70) {
        insights.push(`Great consistency! You've been active on ${daysWithActivity} out of the last ${totalDays} days.`);
    } else if (frequency >= 50) {
        insights.push(`You're making progress with activity on ${daysWithActivity} days. Try to increase frequency!`);
    } else {
        insights.push(`You've been active on ${daysWithActivity} days. Consider building a more consistent routine.`);
    }
    
    // Streak insight
    const streak = calculateStreak();
    if (streak > 0) {
        insights.push(`🔥 You're on a ${streak}-day streak! Keep it up!`);
    }
    
    insights.forEach(insight => {
        const item = document.createElement('div');
        item.className = 'insight-item';
        item.innerHTML = `<p>${insight}</p>`;
        container.appendChild(item);
    });
}

// Update stats
function updateStats(filteredActivities) {
    document.getElementById('totalEntries').textContent = filteredActivities.length;
    
    if (filteredActivities.length === 0) {
        document.getElementById('mostActiveDay').textContent = '-';
        document.getElementById('peakHour').textContent = '-';
        document.getElementById('bestCategory').textContent = '-';
        return;
    }
    
    // Most active day
    const dayCounts = {};
    filteredActivities.forEach(a => {
        const day = a.date.toLocaleDateString('en-US', { weekday: 'long' });
        dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const mostActiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
    document.getElementById('mostActiveDay').textContent = mostActiveDay;
    
    // Best category
    const categoryHours = {};
    filteredActivities.forEach(a => {
        categoryHours[a.category] = (categoryHours[a.category] || 0) + a.duration;
    });
    const bestCategory = Object.entries(categoryHours).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
    document.getElementById('bestCategory').textContent = bestCategory;
    
    // Peak hour - using entry time instead of date hour
    const hourCounts = {};
    filteredActivities.forEach(a => {
        // Use entryTime if available, otherwise fall back to date hour
        let hour;
        if (a.entryTime) {
            const [hours] = a.entryTime.split(':');
            hour = parseInt(hours);
        } else {
            hour = a.date.getHours();
        }
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    if (peakHour) {
        const hour = parseInt(peakHour[0]);
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        document.getElementById('peakHour').textContent = `${displayHour}:00 ${period}`;
    } else {
        document.getElementById('peakHour').textContent = '-';
    }
}

// Goal modal functions
function openGoalModal() {
    document.getElementById('goalModal').classList.add('active');
    document.getElementById('goalModalTitle').textContent = 'New Goal';
    document.getElementById('goalForm').reset();
}

function closeGoalModal() {
    document.getElementById('goalModal').classList.remove('active');
    document.getElementById('goalForm').reset();
}

// Make functions global for onclick handlers
window.deleteActivity = deleteActivity;
window.deleteGoal = deleteGoal;