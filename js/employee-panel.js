/**
 * HYNAOS — Employee Panel Main Controller
 * Hyna Studio Management System (Strict Personal Workspace Scoping)
 */

// Logged In Employee Personal Scoped Profile (Rohit V - EMP-008)
const CURRENT_EMPLOYEE = {
  id: "EMP-008",
  name: "Rohit V",
  email: "rohit@hynastudio.com",
  role: "employee",
  position: "Senior Developer",
  department: "Engineering",
  joiningDate: "2024-03-10",
  phone: "+91 98765 43210",
  status: "active",
  initials: "RV"
};

// Scoped Personal Assigned Projects
const MY_PROJECTS = [
  { id: "PRJ-101", name: "HYNAOS Core Platform", manager: "Dharshan J M", progress: 85, deadline: "2026-09-30", status: "active" },
  { id: "PRJ-102", name: "Hyna Studio Rebrand", manager: "Tharun Krishna", progress: 95, deadline: "2026-09-15", status: "active" },
  { id: "PRJ-105", name: "Mobile Workspace App", manager: "Rohit V", progress: 40, deadline: "2026-11-01", status: "active" }
];

// Scoped Personal Assigned Tasks
let myTasksList = [
  {
    id: "TSK-03",
    title: "Kanban Board Drag & Drop",
    project: "HYNAOS Core Platform",
    priority: "urgent",
    deadline: "2026-09-12",
    status: "In Progress",
    progress: 75,
    desc: "Build interactive task movement for Admin & Employee panels."
  },
  {
    id: "TSK-08",
    title: "Mobile Workspace Navigation",
    project: "Mobile Workspace App",
    priority: "high",
    deadline: "2026-09-20",
    status: "To Do",
    progress: 10,
    desc: "Implement responsive bottom navigation bar for mobile layout."
  },
  {
    id: "TSK-09",
    title: "Supabase Client Error Handling",
    project: "HYNAOS Core Platform",
    priority: "medium",
    deadline: "2026-09-14",
    status: "Review",
    progress: 90,
    desc: "Wrap auth exceptions and present clean toast alerts."
  }
];

// Scoped Personal Work Logs
let myWorkLogs = [
  { id: "WLOG-1", title: "Configured Employee Panel Security Scoping", project: "HYNAOS Core Platform", task: "Security Validation", date: "Today, 10:30 AM", status: "Submitted for Review" },
  { id: "WLOG-2", title: "Built Check-In Attendance Counter", project: "HYNAOS Core Platform", task: "Attendance Module", date: "Yesterday, 04:45 PM", status: "Approved" }
];

// Scoped Personal Leave Requests
let myLeaveRequests = [
  { id: "LV-1", type: "Sick Leave", dates: "Sep 10 - Sep 11", reason: "Medical Appointment", status: "Pending", comments: "Awaiting HR review" },
  { id: "LV-4", type: "Casual Leave", dates: "Aug 05 - Aug 06", reason: "Personal Work", status: "Approved", comments: "Approved by Asthamil" }
];

// Scoped Personal Attendance State
let attendanceState = {
  isCheckedIn: false,
  checkInTime: null,
  checkOutTime: null,
  workingSeconds: 0,
  timerInterval: null
};

// Page Lifecycle Initialization
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Verify Employee Access Security
  await verifyEmployeeAccess();

  // 2. Initialize Navigation Router
  initNavigation();

  // 3. Render Scoped Workspace Views
  renderMyTasks();
  renderMyProjects();
  renderMyWorkLogs();
  renderMyLeaves();
  renderMyProfile();

  // 4. Initialize Forms & Listeners
  initForms();

  // 5. Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});

/**
 * Verify Employee Security Access
 */
async function verifyEmployeeAccess() {
  const { getClient, isDemoMode } = window.HYNAOS_SUPABASE || {};

  if (isDemoMode() || !getClient()) {
    console.log("⚡ Employee Panel: Authorized (Demo Mode).");
    return;
  }

  try {
    const supabase = getClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = 'employee-login.html';
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || profile.role !== 'employee') {
      alert("Unauthorized Access: Employee credentials required.");
      window.location.href = 'employee-login.html';
    }
  } catch (err) {
    console.error("Security check failed:", err);
  }
}

/**
 * Navigation Router & Sidebar Controls
 */
function initNavigation() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  const navLinks = document.querySelectorAll('.sidebar-link');
  const tabContents = document.querySelectorAll('.tab-content');

  // Sidebar Collapse Toggle
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      sidebar.classList.toggle('mobile-open');
    });
  }

  // Tab Switching
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTabId = link.getAttribute('data-tab');

      if (!targetTabId) return;

      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      tabContents.forEach(tab => {
        tab.classList.remove('active');
        if (tab.id === `${targetTabId}Tab`) {
          tab.classList.add('active');
        }
      });

      if (window.innerWidth <= 1024) {
        sidebar.classList.remove('mobile-open');
      }
    });
  });

  // Notifications Toggle
  const notifBtn = document.getElementById('notifBtn');
  const notifDropdown = document.getElementById('notifDropdown');

  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      notifDropdown.classList.remove('show');
    });
  }
}

/**
 * Attendance Check In / Check Out Handler
 */
function toggleCheckIn() {
  const checkInBtn = document.getElementById('checkInBtn');
  const checkOutBtn = document.getElementById('checkOutBtn');
  const statusBadge = document.getElementById('attendanceStatusBadge');
  const timerBadge = document.getElementById('workingTimerBadge');
  const checkInTimeEl = document.getElementById('checkInTimeDisplay');
  const checkOutTimeEl = document.getElementById('checkOutTimeDisplay');

  if (!attendanceState.isCheckedIn) {
    // Perform Check In
    const now = new Date();
    attendanceState.isCheckedIn = true;
    attendanceState.checkInTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (checkInBtn) checkInBtn.disabled = true;
    if (checkOutBtn) checkOutBtn.disabled = false;
    if (statusBadge) {
      statusBadge.textContent = '🟢 Checked In';
      statusBadge.className = 'badge-status badge-active';
    }
    if (checkInTimeEl) checkInTimeEl.textContent = attendanceState.checkInTime;

    // Start Live Timer
    attendanceState.timerInterval = setInterval(() => {
      attendanceState.workingSeconds++;
      const hrs = String(Math.floor(attendanceState.workingSeconds / 3600)).padStart(2, '0');
      const mins = String(Math.floor((attendanceState.workingSeconds % 3600) / 60)).padStart(2, '0');
      const secs = String(attendanceState.workingSeconds % 60).padStart(2, '0');
      if (timerBadge) timerBadge.textContent = `${hrs}:${mins}:${secs}`;
    }, 1000);

  } else {
    // Perform Check Out
    const now = new Date();
    attendanceState.isCheckedIn = false;
    attendanceState.checkOutTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    clearInterval(attendanceState.timerInterval);

    if (checkInBtn) checkInBtn.disabled = true;
    if (checkOutBtn) checkOutBtn.disabled = true;
    if (statusBadge) {
      statusBadge.textContent = '🔴 Checked Out';
      statusBadge.className = 'badge-status badge-delayed';
    }
    if (checkOutTimeEl) checkOutTimeEl.textContent = attendanceState.checkOutTime;
  }
}

/**
 * Render Scoped Tasks
 */
function renderMyTasks() {
  const container = document.getElementById('myTasksContainer');
  if (!container) return;

  container.innerHTML = myTasksList.map(task => `
    <div class="task-item-card">
      <div class="task-header">
        <div>
          <span class="badge-priority priority-${task.priority}">${task.priority}</span>
          <h4 class="task-title" style="margin-top:0.4rem;">${task.title}</h4>
          <span style="font-size:0.775rem; color:var(--text-muted);">Project: ${task.project} • Deadline: ${task.deadline}</span>
        </div>
        <span class="badge-status badge-${task.status === 'Completed' ? 'active' : task.status === 'Review' ? 'planning' : 'onhold'}">
          ${task.status}
        </span>
      </div>
      <p class="task-desc">${task.desc}</p>
      
      <div class="task-controls">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="font-size:0.8rem; color:var(--text-sub);">Status:</span>
          <select class="status-select" onchange="updateTaskStatus('${task.id}', this.value)">
            <option value="To Do" ${task.status === 'To Do' ? 'selected' : ''}>To Do</option>
            <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Review" ${task.status === 'Review' ? 'selected' : ''}>Submit for Review</option>
            <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </div>

        <button class="btn-primary" style="padding:0.4rem 0.9rem; font-size:0.8rem;" onclick="submitTaskForReview('${task.id}')">
          <span>Submit Work</span>
        </button>
      </div>
    </div>
  `).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function updateTaskStatus(taskId, newStatus) {
  const task = myTasksList.find(t => t.id === taskId);
  if (task) {
    task.status = newStatus;
    renderMyTasks();
  }
}

function submitTaskForReview(taskId) {
  updateTaskStatus(taskId, 'Review');
  alert('Task submitted for Administrator Review successfully!');
}

/**
 * Render Scoped Assigned Projects
 */
function renderMyProjects() {
  const container = document.getElementById('myProjectsContainer');
  if (!container) return;

  container.innerHTML = MY_PROJECTS.map(prj => `
    <div class="panel-card" style="margin-bottom:1.25rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
        <h4>${prj.name}</h4>
        <span class="badge-status badge-${prj.status}">${prj.status}</span>
      </div>
      <p style="font-size:0.85rem; color:var(--text-sub); margin-bottom:1rem;">Manager: <strong>${prj.manager}</strong> • Deadline: ${prj.deadline}</p>
      <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-sub); margin-bottom:0.35rem;">
        <span>Project Progress</span>
        <span>${prj.progress}%</span>
      </div>
      <div style="height:8px; background:rgba(255,255,255,0.1); border-radius:999px; overflow:hidden;">
        <div style="height:100%; width:${prj.progress}%; background:linear-gradient(90deg, #2563eb, #3b82f6); border-radius:999px;"></div>
      </div>
    </div>
  `).join('');
}

/**
 * Render Work Log Submissions
 */
function renderMyWorkLogs() {
  const tbody = document.getElementById('workLogTableBody');
  if (!tbody) return;

  tbody.innerHTML = myWorkLogs.map(w => `
    <tr>
      <td><strong>${w.title}</strong></td>
      <td>${w.project}</td>
      <td>${w.date}</td>
      <td><span class="badge-status badge-planning">${w.status}</span></td>
    </tr>
  `).join('');
}

/**
 * Render Leave Requests
 */
function renderMyLeaves() {
  const tbody = document.getElementById('leaveTableBody');
  if (!tbody) return;

  tbody.innerHTML = myLeaveRequests.map(l => `
    <tr>
      <td><strong>${l.type}</strong></td>
      <td>${l.dates}</td>
      <td>${l.reason}</td>
      <td><span class="badge-status badge-${l.status.toLowerCase() === 'approved' ? 'active' : 'onhold'}">${l.status}</span></td>
      <td><span style="font-size:0.8rem; color:var(--text-sub);">${l.comments}</span></td>
    </tr>
  `).join('');
}

/**
 * Render Personal Profile Details
 */
function renderMyProfile() {
  const nameEl = document.getElementById('profileName');
  const emailEl = document.getElementById('profileEmail');
  const idEl = document.getElementById('profileId');
  const posEl = document.getElementById('profilePos');
  const deptEl = document.getElementById('profileDept');

  if (nameEl) nameEl.textContent = CURRENT_EMPLOYEE.name;
  if (emailEl) emailEl.textContent = CURRENT_EMPLOYEE.email;
  if (idEl) idEl.textContent = CURRENT_EMPLOYEE.id;
  if (posEl) posEl.textContent = CURRENT_EMPLOYEE.position;
  if (deptEl) deptEl.textContent = CURRENT_EMPLOYEE.department;
}

/**
 * Forms Event Listeners
 */
function initForms() {
  // Add Daily Work Log Form
  const workForm = document.getElementById('addWorkLogForm');
  if (workForm) {
    workForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('workTitleInput').value.trim();
      const project = document.getElementById('workProjectSelect').value;

      if (!title) return;

      const newLog = {
        id: `WLOG-${myWorkLogs.length + 1}`,
        title,
        project,
        task: "Daily Update",
        date: "Today, Just now",
        status: "Submitted for Review"
      };

      myWorkLogs.unshift(newLog);
      renderMyWorkLogs();
      workForm.reset();
      alert('Work update log submitted successfully!');
    });
  }

  // Submit Leave Request Form
  const leaveForm = document.getElementById('submitLeaveForm');
  if (leaveForm) {
    leaveForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const type = document.getElementById('leaveTypeSelect').value;
      const start = document.getElementById('leaveStartDate').value;
      const end = document.getElementById('leaveEndDate').value;
      const reason = document.getElementById('leaveReasonInput').value.trim();

      if (!start || !end || !reason) return;

      const newLeave = {
        id: `LV-${myLeaveRequests.length + 1}`,
        type,
        dates: `${start} to ${end}`,
        reason,
        status: "Pending",
        comments: "Awaiting HR review"
      };

      myLeaveRequests.unshift(newLeave);
      renderMyLeaves();
      leaveForm.reset();
      alert('Leave request submitted to HR successfully!');
    });
  }
}

// Global functions exports
window.toggleCheckIn = toggleCheckIn;
window.updateTaskStatus = updateTaskStatus;
window.submitTaskForReview = submitTaskForReview;
