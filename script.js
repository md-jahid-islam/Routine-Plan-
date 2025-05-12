 document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const sections = document.querySelectorAll('main > section');
    const navButtons = document.querySelectorAll('nav button');
    const monthlyAttendanceCountDisplay = document.getElementById('monthly-attendance-count');
    const weeklyAttendanceCountDisplay = document.getElementById('weekly-attendance-count');
    const dailyAttendanceCountDisplay = document.getElementById('daily-attendance-count');

 // --- Helper Functions --- // 
    function saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function loadData(key) {
        try {
            const storedData = localStorage.getItem(key);
            return storedData ? JSON.parse(storedData) : null;
        } catch (error) {
            console.error("Error loading data:", error);
            return null;
        }
    }

    function showSection(sectionId) {
        sections.forEach(section => section.classList.remove('active-section'));
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active-section');
        }
    }

    function clearInput(inputId) {
        document.getElementById(inputId).value = '';
    }

    function hideElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('hidden');
        }
    }

    function showElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('hidden');
        }
    }

    function updateAttendanceCounts() {
        monthlyAttendanceCountDisplay.textContent = monthlyGoals.filter(goal => goal.attended).length;
        weeklyAttendanceCountDisplay.textContent = Object.values(weeklyRoutine)
            .flat()
            .filter(slot => slot.completed).length;
        dailyAttendanceCountDisplay.textContent = (dailyTasks.find(item => item.date === new Date().toLocaleDateString())?.tasks || [])
            .filter(task => task.completed).length;
    }

 // --- Navigation --- // 
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = button.getAttribute('data-section');
            showSection(sectionId);
        });
    });

 // --- Monthly Goals --- // 
    const monthlyGoalsList = document.getElementById('monthly-goals-list');
    const newMonthlyGoalInput = document.getElementById('new-monthly-goal');
    const addMonthlyGoalBtn = document.getElementById('add-monthly-goal-btn');
    let monthlyGoals = loadData('monthlyGoals') || [];

    function renderMonthlyGoals() {
        monthlyGoalsList.innerHTML = '';
        monthlyGoals.forEach((goal, index) => {
            const listItem = document.createElement('li');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = goal.attended || false;
            checkbox.addEventListener('change', () => {
                monthlyGoals[index].attended = checkbox.checked;
                saveData('monthlyGoals', monthlyGoals);
                renderMonthlyGoals();
                updateAttendanceCounts();
            });
            listItem.appendChild(checkbox);
            const goalTextSpan = document.createElement('span');
            goalTextSpan.textContent = goal.text;
            listItem.appendChild(goalTextSpan);
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => {
                monthlyGoals.splice(index, 1);
                saveData('monthlyGoals', monthlyGoals);
                renderMonthlyGoals();
                updateAttendanceCounts();
            });
            listItem.appendChild(deleteButton);
            monthlyGoalsList.appendChild(listItem);
        });
        updateAttendanceCounts();
    }

    addMonthlyGoalBtn.addEventListener('click', () => {
        const newGoalText = newMonthlyGoalInput.value.trim();
        if (newGoalText) {
            monthlyGoals.push({ text: newGoalText, attended: false });
            saveData('monthlyGoals', monthlyGoals);
            renderMonthlyGoals();
            clearInput('new-monthly-goal');
        }
    });

 // --- Weekly Routine --- // 
    const weeklyTimetable = document.getElementById('weekly-timetable');
    const addWeeklySlotBtn = document.getElementById('add-weekly-slot-btn');
    const weeklySlotForm = document.getElementById('weekly-slot-form');
    const saveWeeklySlotBtn = document.getElementById('save-weekly-slot-btn');
    const cancelWeeklySlotBtn = document.getElementById('cancel-weekly-slot-btn');
    const slotDayInput = document.getElementById('slot-day');
    const slotStartTimeInput = document.getElementById('slot-start-time');
    const slotEndTimeInput = document.getElementById('slot-end-time');
    const slotActivityInput = document.getElementById('slot-activity');
    let weeklyRoutine = loadData('weeklyRoutine') || {
        Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
    };

    function renderWeeklyRoutine() {
        weeklyTimetable.innerHTML = '';
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        daysOfWeek.forEach(day => {
            const header = document.createElement('div');
            header.classList.add('timetable-header');
            header.textContent = day;
            weeklyTimetable.appendChild(header);
            weeklyRoutine[day].forEach((slot, index) => {
                const slotDiv = document.createElement('div');
                slotDiv.classList.add('time-slot');
                const taskSpan = document.createElement('span');
                taskSpan.textContent = `${slot.startTime}-${slot.endTime}: ${slot.activity}`;
                slotDiv.appendChild(taskSpan);
                const completeCheckbox = document.createElement('input');
                completeCheckbox.type = 'checkbox';
                completeCheckbox.checked = slot.completed || false;
                completeCheckbox.addEventListener('change', () => {
                    weeklyRoutine[day][index].completed = completeCheckbox.checked;
                    saveData('weeklyRoutine', weeklyRoutine);
                    renderWeeklyRoutine();
                    updateAttendanceCounts();
                });
                slotDiv.appendChild(completeCheckbox);
                weeklyTimetable.appendChild(slotDiv);
            });
        });
        updateAttendanceCounts();
    }

    addWeeklySlotBtn.addEventListener('click', () => {
        showElement('weekly-slot-form');
    });

    cancelWeeklySlotBtn.addEventListener('click', () => {
        hideElement('weekly-slot-form');
        clearWeeklySlotForm();
    });

    saveWeeklySlotBtn.addEventListener('click', () => {
        const day = slotDayInput.value;
        const startTime = slotStartTimeInput.value;
        const endTime = slotEndTimeInput.value;
        const activity = slotActivityInput.value.trim();
        if (startTime && endTime && activity) {
            weeklyRoutine[day].push({ startTime, endTime, activity, completed: false });
            saveData('weeklyRoutine', weeklyRoutine);
            renderWeeklyRoutine();
            hideElement('weekly-slot-form');
            clearWeeklySlotForm();
        } else {
            alert('Please fill in all the fields for the weekly slot.');
        }
    });

    function clearWeeklySlotForm() {
        clearInput('slot-start-time');
        clearInput('slot-end-time');
        clearInput('slot-activity');
    }

 // --- Daily Schedule --- // 
    const dailyTimetable = document.getElementById('daily-timetable');
    const addDailyTaskBtn = document.getElementById('add-daily-task-btn');
    const dailyTaskForm = document.getElementById('daily-task-form');
    const saveDailyTaskBtn = document.getElementById('save-daily-task-btn');
    const cancelDailyTaskBtn = document.getElementById('cancel-daily-task-btn');
    const taskStartTimeInput = document.getElementById('task-start-time');
    const taskEndTimeInput = document.getElementById('task-end-time');
    const taskDescriptionInput = document.getElementById('task-description');
    let dailyTasks = loadData('dailyTasks') || []; 
    
 // --- renderDailySchedule --- //
    function renderDailySchedule() {
        dailyTimetable.innerHTML = '';
        const today = new Date().toLocaleDateString();
        const todaySchedule = dailyTasks.find(item => item.date === today);
        const dailyTasksToday = todaySchedule ? todaySchedule.tasks : [];

        dailyTasksToday.forEach((task, index) => {
            const taskDiv = document.createElement('div');
            taskDiv.classList.add('time-slot');
            const taskSpan = document.createElement('span');
            taskSpan.textContent = `${task.startTime}-${task.endTime}: ${task.description} (Task)`;
            taskDiv.appendChild(taskSpan);
            const completeCheckbox = document.createElement('input');
            completeCheckbox.type = 'checkbox';
            completeCheckbox.checked = task.completed || false;
            completeCheckbox.addEventListener('change', () => {
                const todayData = dailyTasks.find(item => item.date === today);
                if (todayData) {
                    todayData.tasks[index].completed = completeCheckbox.checked;
                    saveData('dailyTasks', dailyTasks);
                    renderDailySchedule();
                    updateAttendanceCounts();
                }
            });
            taskDiv.appendChild(completeCheckbox);
            dailyTimetable.appendChild(taskDiv);
        });

 // --- Display weekly routine for today --- //
        const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        weeklyRoutine[currentDayName]?.forEach(slot => {
            const slotDiv = document.createElement('div');
            slotDiv.classList.add('time-slot');
            slotDiv.textContent = `${slot.startTime}-${slot.endTime}: ${slot.activity} (Routine)`;
            dailyTimetable.appendChild(slotDiv);
        });
        updateAttendanceCounts();
    }

    addDailyTaskBtn.addEventListener('click', () => {
        showElement('daily-task-form');
    });

    cancelDailyTaskBtn.addEventListener('click', () => {
        hideElement('daily-task-form');
        clearDailyTaskForm();
    });

    saveDailyTaskBtn.addEventListener('click', () => {
        const startTime = taskStartTimeInput.value;
        const endTime = taskEndTimeInput.value;
        const description = taskDescriptionInput.value.trim();
        if (startTime && endTime && description) {
            const today = new Date().toLocaleDateString();
            let todayData = dailyTasks.find(item => item.date === today);
            if (todayData) {
                todayData.tasks.push({ startTime, endTime, description, completed: false });
            } else {
                dailyTasks.push({ date: today, tasks: [{ startTime, endTime, description, completed: false }] });
            }
            saveData('dailyTasks', dailyTasks);
            renderDailySchedule();
            hideElement('daily-task-form');
            clearDailyTaskForm();
        } else {
            alert('Please fill in all the fields for the daily task.');
        }
    });

    function clearDailyTaskForm() {
        clearInput('task-start-time');
        clearInput('task-end-time');
        clearInput('task-description');
    }

 // --- Theme Toggle --- //
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        const isDark = body.classList.contains('dark-theme');
        saveData('theme', isDark ? 'dark' : 'light');
    });

 // --- Initialization --- //
    const savedTheme = loadData('theme');
    if (savedTheme === 'dark') {
    body.classList.add('dark-theme');
    }
 // --- Initial update --- // 
    showSection('monthly-goals-section');
    renderMonthlyGoals();
    renderWeeklyRoutine();
    renderDailySchedule();
    updateAttendanceCounts(); 
 });
