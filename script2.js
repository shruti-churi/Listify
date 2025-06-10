document.addEventListener('DOMContentLoaded', () => {
    // --- Constants ---
    const TASKS_STORAGE_KEY = 'dynamicToDoListTasks'; // Key for localStorage

    // --- DOM Elements ---
    const taskForm = document.getElementById('taskForm');
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescriptionTextarea = document.getElementById('taskDescription');
    const taskDueDateInput = document.getElementById('taskDueDate');
    // taskPrioritySelect removed
    const taskMessage = document.getElementById('taskMessage');

    const taskList = document.getElementById('taskList');
    const noTasksMessage = document.getElementById('noTasksMessage');
    const clearAllTasksBtn = document.getElementById('clearAllTasksBtn');

    const filterStatusSelect = document.getElementById('filterStatus');
    // filterPrioritySelect removed
    const sortOrderSelect = document.getElementById('sortOrder');

    // --- Helper Functions for localStorage ---

    /**
     * Retrieves tasks from localStorage.
     * @returns {Array} An array of task objects.
     */
    function getTasks() {
        try {
            const tasks = JSON.parse(localStorage.getItem(TASKS_STORAGE_KEY)) || [];
            // Ensure old tasks have necessary properties (e.g., 'completed' and 'createdAt')
            return tasks.map(task => ({
                id: task.id,
                title: task.title,
                description: task.description || '',
                dueDate: task.dueDate || '',
                completed: typeof task.completed === 'boolean' ? task.completed : false, // Ensure boolean
                createdAt: task.createdAt || new Date().toISOString() // Add createdAt if missing
            }));
        } catch (e) {
            console.error("Error parsing tasks from localStorage:", e);
            // Clear corrupted data or return empty array to prevent further errors
            localStorage.removeItem(TASKS_STORAGE_KEY);
            return [];
        }
    }

    /**
     * Saves the current array of tasks to localStorage.
     * @param {Array} tasks - The array of task objects to save.
     */
    function saveTasks(tasks) {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    }

    /**
     * Displays a temporary message to the user.
     * @param {string} messageText - The message to display.
     * @param {string} type - 'success' or 'error' for styling.
     */
    function showMessage(messageText, type) {
        taskMessage.textContent = messageText;
        taskMessage.className = `message ${type}`;
        taskMessage.classList.remove('hidden');
        setTimeout(() => {
            taskMessage.classList.add('hidden');
            taskMessage.textContent = '';
        }, 3000); // Hide message after 3 seconds
    }

    // --- Task Rendering and Filtering Logic ---

    /**
     * Renders tasks to the DOM based on current filters and sort order.
     */
    function renderTasks() {
        taskList.innerHTML = ''; // Clear existing tasks
        let tasks = getTasks();

        // Apply filters
        const statusFilter = filterStatusSelect.value;
        // priorityFilter removed

        if (statusFilter !== 'all') {
            tasks = tasks.filter(task =>
                statusFilter === 'completed' ? task.completed : !task.completed
            );
        }

        // Apply sorting
        const sortOrder = sortOrderSelect.value;
        tasks.sort((a, b) => {
            if (sortOrder === 'addedAsc') {
                return new Date(a.createdAt) - new Date(b.createdAt);
            } else if (sortOrder === 'addedDesc') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (sortOrder === 'dueDateAsc') {
                // Treat empty due dates as far future for sorting
                const dateA = a.dueDate ? new Date(a.dueDate) : new Date('2999-12-31');
                const dateB = b.dueDate ? new Date(b.dueDate) : new Date('2999-12-31');
                return dateA - dateB;
            } else if (sortOrder === 'dueDateDesc') {
                // Treat empty due dates as far past for sorting
                const dateA = a.dueDate ? new Date(a.dueDate) : new Date('1900-01-01');
                const dateB = b.dueDate ? new Date(b.dueDate) : new Date('1900-01-01');
                return dateB - dateA;
            }
            // Priority sorting removed
            return 0; // No change in order
        });


        if (tasks.length === 0) {
            noTasksMessage.classList.remove('hidden');
            clearAllTasksBtn.classList.add('hidden');
            return;
        } else {
            noTasksMessage.classList.add('hidden');
            clearAllTasksBtn.classList.remove('hidden');
        }

        tasks.forEach(task => {
            const listItem = document.createElement('li');
            listItem.setAttribute('data-id', task.id); // Store ID on the list item
            listItem.className = task.completed ? 'completed' : '';

            const dueDateText = task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date';
            const addedDateText = `Added: ${new Date(task.createdAt).toLocaleDateString()}`;

            listItem.innerHTML = `
                <div class="task-content">
                    <span class="task-title">${task.title}</span>
                    <p class="task-details">
                        <span>${dueDateText}</span>
                        <span>${addedDateText}</span>
                    </p>
                    ${task.description ? `<p>${task.description}</p>` : ''}
                </div>
                <div class="task-actions">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <button class="btn danger delete-task-btn">Delete</button>
                </div>
            `;
            taskList.appendChild(listItem);
        });
    }

    // --- Event Handlers ---

    // Handle adding a new task
    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent page reload

            const title = taskTitleInput.value.trim();
            const description = taskDescriptionTextarea.value.trim();
            const dueDate = taskDueDateInput.value; // YYYY-MM-DD format
            // priority removed

            if (title === '') {
                showMessage('Task title cannot be empty.', 'error');
                return;
            }

            const tasks = getTasks();
            const newTask = {
                id: Date.now(), // Simple unique ID based on timestamp
                title,
                description,
                dueDate,
                completed: false, // New tasks are initially not completed
                createdAt: new Date().toISOString() // Store creation timestamp for sorting
            };

            tasks.push(newTask);
            saveTasks(tasks);
            renderTasks(); // Re-render the list immediately

            // Clear the form fields
            taskForm.reset();
            showMessage('Task added successfully!', 'success');
        });
    }

    // Handle clicks within the task list (delegation)
    // This is more efficient as we only attach one listener to the parent
    // and can handle events from dynamically added children.
    if (taskList) {
        taskList.addEventListener('click', (e) => {
            const target = e.target;
            const listItem = target.closest('li[data-id]'); // Find the parent <li> with a data-id

            if (!listItem) return; // If clicked outside a task item, do nothing

            const taskId = parseInt(listItem.dataset.id); // Get the ID from the <li>

            // Handle delete button click
            if (target.classList.contains('delete-task-btn')) {
                if (confirm('Are you sure you want to delete this task?')) {
                    deleteTask(taskId);
                    showMessage('Task deleted.', 'success');
                }
            }

            // Handle checkbox change
            if (target.classList.contains('task-checkbox')) {
                toggleTaskCompletion(taskId, target.checked);
            }
        });
    }

    /**
     * Deletes a task from localStorage and re-renders the list.
     * @param {number} id - The ID of the task to delete.
     */
    function deleteTask(id) {
        let tasks = getTasks();
        tasks = tasks.filter(task => task.id !== id); // Filter out the task to be deleted
        saveTasks(tasks);
        renderTasks(); // Update the displayed list
    }

    /**
     * Toggles the completion status of a task.
     * @param {number} id - The ID of the task to toggle.
     * @param {boolean} isCompleted - The new completion status.
     */
    function toggleTaskCompletion(id, isCompleted) {
        const tasks = getTasks();
        const taskIndex = tasks.findIndex(task => task.id === id);

        if (taskIndex > -1) {
            tasks[taskIndex].completed = isCompleted;
            saveTasks(tasks);
            renderTasks(); // Re-render to apply 'completed' styling
        }
    }

    // Handle clearing all tasks
    if (clearAllTasksBtn) {
        clearAllTasksBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear ALL tasks? This action cannot be undone.')) {
                localStorage.removeItem(TASKS_STORAGE_KEY); // Clear all tasks
                renderTasks(); // Update the displayed list (will show "No tasks yet")
                showMessage('All tasks cleared.', 'success');
            }
        });
    }

    // Event listeners for filter and sort changes
    if (filterStatusSelect) {
        filterStatusSelect.addEventListener('change', renderTasks);
    }
    // filterPrioritySelect removed
    if (sortOrderSelect) {
        sortOrderSelect.addEventListener('change', renderTasks);
    }

    // --- Initial Render on Page Load ---
    renderTasks(); // Call renderTasks when the page first loads
});