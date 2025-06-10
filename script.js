document.addEventListener('DOMContentLoaded', () => {
    // --- Theme switching logic ---
    const body = document.body;
    const lightModeBtn = document.getElementById('lightModeBtn');
    const darkModeBtn = document.getElementById('darkModeBtn');

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.className = savedTheme;
        if (lightModeBtn && darkModeBtn) { // Check if buttons exist on the page
            if (savedTheme === 'dark-mode') {
                darkModeBtn.classList.add('active');
                lightModeBtn.classList.remove('active');
            } else {
                lightModeBtn.classList.add('active');
                darkModeBtn.classList.remove('active');
            }
        }
    } else {
        // Default to light mode if no theme is saved
        body.classList.add('light-mode');
        if (lightModeBtn) {
            lightModeBtn.classList.add('active');
        }
    }

    if (lightModeBtn) {
        lightModeBtn.addEventListener('click', () => {
            body.classList.replace('dark-mode', 'light-mode');
            lightModeBtn.classList.add('active');
            darkModeBtn.classList.remove('active');
            localStorage.setItem('theme', 'light-mode');
        });
    }

    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', () => {
            body.classList.replace('light-mode', 'dark-mode');
            darkModeBtn.classList.add('active');
            lightModeBtn.classList.remove('active');
            localStorage.setItem('theme', 'dark-mode');
        });
    }

    // --- Task Management (using localStorage for simplicity) ---
    const TASKS_STORAGE_KEY = 'vastToDoTasks';

    function getTasks() {
        return JSON.parse(localStorage.getItem(TASKS_STORAGE_KEY)) || [];
    }

    function saveTasks(tasks) {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    }

    // Add Task Page Logic (`add-task.html`)
    const taskForm = document.getElementById('taskForm');
    const taskMessage = document.getElementById('taskMessage');
    const taskListForDeletion = document.getElementById('taskListForDeletion');
    const deleteAllTasksBtn = document.getElementById('deleteAllTasksBtn');

    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('taskTitle').value.trim();
            const description = document.getElementById('taskDescription').value.trim();
            const dueDate = document.getElementById('taskDueDate').value;
            const priority = document.getElementById('taskPriority').value;

            if (title) {
                const tasks = getTasks();
                const newTask = {
                    id: Date.now(), // Simple unique ID
                    title,
                    description,
                    dueDate,
                    priority,
                    completed: false,
                    createdAt: new Date().toISOString()
                };
                tasks.push(newTask);
                saveTasks(tasks);

                // *** CRUCIAL CHANGE HERE: Redirect to view-tasks.html ***
                // This will force view-tasks.html to reload and display the new task
                window.location.href = 'view-tasks.html';

                // The following lines will not be reached because of the redirect
                // taskForm.reset();
                // taskMessage.textContent = 'Task added successfully!';
                // taskMessage.className = 'message success';
                // setTimeout(() => taskMessage.textContent = '', 3000); // Clear message
                // renderTasksForDeletion(); // Update deletion list on add-task page
            } else {
                taskMessage.textContent = 'Task title cannot be empty.';
                taskMessage.className = 'message error';
            }
        });
    }

    function renderTasksForDeletion() {
        if (!taskListForDeletion) return; // Exit if not on the correct page

        taskListForDeletion.innerHTML = '';
        const tasks = getTasks();

        if (tasks.length === 0) {
            taskListForDeletion.innerHTML = '<li class="message">No tasks to delete.</li>';
            if (deleteAllTasksBtn) deleteAllTasksBtn.style.display = 'none';
            return;
        }

        if (deleteAllTasksBtn) deleteAllTasksBtn.style.display = 'block';

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="task-details">
                    <span class="task-title">${task.title}</span>
                    <p class="task-meta">Due: ${task.dueDate || 'N/A'} | Priority: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</p>
                </div>
                <button class="delete-task-btn" data-id="${task.id}">Delete</button>
            `;
            taskListForDeletion.appendChild(li);
        });

        taskListForDeletion.querySelectorAll('.delete-task-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.dataset.id);
                deleteTask(taskId);
            });
        });
    }

    function deleteTask(id) {
        let tasks = getTasks();
        tasks = tasks.filter(task => task.id !== id);
        saveTasks(tasks);
        // Only re-render deletion list if on that page
        if (taskListForDeletion) renderTasksForDeletion();
        // Always re-render all tasks list, as deletion impacts it
        if (allTasksList) renderAllTasks();
    }

    if (deleteAllTasksBtn) {
        deleteAllTasksBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete ALL tasks? This action cannot be undone.')) {
                localStorage.removeItem(TASKS_STORAGE_KEY);
                renderTasksForDeletion();
                renderAllTasks(); // Update view all tasks page
                if (taskMessage) {
                    taskMessage.textContent = 'All tasks deleted.';
                    taskMessage.className = 'message success';
                    setTimeout(() => taskMessage.textContent = '', 3000);
                }
            }
        });
    }

    // View All Tasks Page Logic (`view-tasks.html`)
    const allTasksList = document.getElementById('allTasksList');
    const noTasksMessage = document.getElementById('noTasksMessage');
    const filterPriority = document.getElementById('filterPriority');
    const sortOrder = document.getElementById('sortOrder');

    function renderAllTasks() {
        if (!allTasksList) return; // Exit if not on the correct page

        allTasksList.innerHTML = ''; // Clear existing tasks before rendering
        let tasks = getTasks();

        if (tasks.length === 0) {
            if (noTasksMessage) noTasksMessage.style.display = 'block';
            return;
        } else {
            if (noTasksMessage) noTasksMessage.style.display = 'none';
        }

        // Filtering
        const currentFilter = filterPriority ? filterPriority.value : 'all';
        if (currentFilter !== 'all') {
            tasks = tasks.filter(task => task.priority === currentFilter);
        }

        // Sorting
        const currentSortOrder = sortOrder ? sortOrder.value : 'dueDateAsc';
        tasks.sort((a, b) => {
            if (currentSortOrder === 'dueDateAsc') {
                const dateA = a.dueDate ? new Date(a.dueDate) : new Date(8640000000000000); // Max Date for N/A
                const dateB = b.dueDate ? new Date(b.dueDate) : new Date(8640000000000000); // Max Date for N/A
                return dateA - dateB;
            } else if (currentSortOrder === 'dueDateDesc') {
                const dateA = a.dueDate ? new Date(a.dueDate) : new Date(-8640000000000000); // Min Date for N/A
                const dateB = b.dueDate ? new Date(b.dueDate) : new Date(-8640000000000000); // Min Date for N/A
                return dateB - dateA;
            } else if (currentSortOrder === 'priorityAsc') {
                const priorityOrder = { 'low': 1, 'medium': 2, 'high': 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            } else if (currentSortOrder === 'priorityDesc') {
                const priorityOrder = { 'low': 1, 'medium': 2, 'high': 3 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            return 0;
        });


        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = task.completed ? 'completed' : ''; // Add 'completed' class for styling
            li.innerHTML = `
                <div class="task-details">
                    <span class="task-title">${task.title}</span>
                    <p class="task-meta">
                        <span>Due: ${task.dueDate || 'N/A'}</span>
                        <span>Priority: <strong class="priority-${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</strong></span>
                        <span>Added: ${new Date(task.createdAt).toLocaleDateString()}</span>
                    </p>
                    ${task.description ? `<p>${task.description}</p>` : ''}
                </div>
                <div>
                    <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
                    <button class="delete-task-btn" data-id="${task.id}">Delete</button>
                </div>
            `;
            allTasksList.appendChild(li);
        });

        // Add event listeners for checkboxes and delete buttons on the "View All Tasks" page
        allTasksList.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = parseInt(e.target.dataset.id);
                toggleTaskCompletion(taskId, e.target.checked);
            });
        });

        allTasksList.querySelectorAll('.delete-task-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.dataset.id);
                deleteTask(taskId); // Reusing the deleteTask function
            });
        });
    }

    function toggleTaskCompletion(id, completed) {
        let tasks = getTasks();
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex > -1) {
            tasks[taskIndex].completed = completed;
            saveTasks(tasks);
            renderAllTasks(); // Re-render to update UI (line-through, etc.)
        }
    }

    if (filterPriority) {
        filterPriority.addEventListener('change', renderAllTasks);
    }
    if (sortOrder) {
        sortOrder.addEventListener('change', renderAllTasks);
    }

    // Initial render based on the current page
    const currentPagePath = window.location.pathname;
    // console.log('Current Page Path:', currentPagePath); // Uncomment for debugging
    if (currentPagePath.includes('add-task.html')) {
        // console.log('On add-task.html, calling renderTasksForDeletion.'); // Uncomment for debugging
        renderTasksForDeletion();
    } else if (currentPagePath.includes('view-tasks.html')) {
        // console.log('On view-tasks.html, calling renderAllTasks.'); // Uncomment for debugging
        renderAllTasks();
    }
});