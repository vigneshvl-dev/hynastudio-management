// Logged In Employee Personal Scoped Profile (Default fallback)
let CURRENT_EMPLOYEE = {
  id: "EMP-008",
  name: "Rohit V",
  email: "rohit@hynastudio.com",
  role: "employee",
  position: "Full Stack Developer",
  department: "Engineering",
  joiningDate: "2024-03-10",
  phone: "+91 98765 43210",
  status: "active",
  initials: "RV"
};

// Dynamically Load User Profile from Session / LocalStorage
function loadUserFromStorage() {
  try {
    const stored = localStorage.getItem('hynaos_current_user');
    if (stored) {
      const u = JSON.parse(stored);
      const name = u.full_name || u.name || "Employee";
      const parts = name.trim().split(' ').filter(Boolean);
      let initials = "HE";
      if (parts.length > 1) {
        initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      } else if (parts[0]) {
        initials = parts[0].substring(0, 2).toUpperCase();
      }

      const empId = u.employee_id || u.id || "EMP-008";
      const savedAvatar = localStorage.getItem('hynaos_profile_avatar_' + empId) || u.avatar_url || u.avatar || null;

      CURRENT_EMPLOYEE = {
        id: empId,
        name: name,
        email: u.email || "",
        role: u.role || "employee",
        position: u.position || "Team Member",
        department: u.department || "Hyna Studio",
        joiningDate: u.joining_date || "2024-03-10",
        phone: u.phone || "+91 98765 43210",
        status: u.status || "active",
        initials: initials,
        avatarUrl: savedAvatar
      };
      console.log("👤 Loaded Logged In Employee Profile:", CURRENT_EMPLOYEE);
    }
  } catch(e) {
    console.warn("Failed to parse stored user profile:", e);
  }
}

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
  // 0. Load Dynamic Logged In User Profile
  loadUserFromStorage();

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
  updateEmployeeDashboardStatCards();

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

function loadAllProjects() {
  try {
    const stored = localStorage.getItem('hynaos_projects_list');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch(e) {
    console.warn("Failed to load projects from storage:", e);
  }
  return [
    { id: "PRJ-101", name: "HYNAOS Core Platform", manager: "Dharshan J M", lead: "Dharshan J M", assignedMembers: ["Dharshan J M", "Rohit V", "Thivan", "Anzarutheen"], progress: 85, deadline: "2026-09-30", status: "active", description: "Core enterprise platform for Hyna Studio." },
    { id: "PRJ-102", name: "Hyna Studio Rebrand", manager: "Tharun Krishna", lead: "Tharun Krishna", assignedMembers: ["Tharun Krishna", "Linciya", "Mohamed Arshiya"], progress: 95, deadline: "2026-09-15", status: "active", description: "Visual identity design update and brand system." },
    { id: "PRJ-103", name: "Growth Engine & CRM", manager: "Muhammed Zarif", lead: "Muhammed Zarif", assignedMembers: ["Muhammed Zarif", "Linciya", "New Appointment"], progress: 60, deadline: "2026-10-15", status: "active", description: "Generative AI marketing copy suite." },
    { id: "PRJ-104", name: "Product Design System", manager: "Mohamed Arshiya", lead: "Mohamed Arshiya", assignedMembers: ["Mohamed Arshiya", "Tharun Krishna"], progress: 100, deadline: "2026-08-30", status: "completed", description: "Design token library and Web UI assets." },
    { id: "PRJ-105", name: "Mobile Workspace App", manager: "Rohit V", lead: "Rohit V", assignedMembers: ["Rohit V", "Akshaya", "Thivan"], progress: 40, deadline: "2026-11-01", status: "active", description: "Mobile application for field attendance and tasks." }
  ];
}

/**
 * Render Scoped Assigned Projects
 */
function renderMyProjects() {
  const container = document.getElementById('myProjectsContainer');
  if (!container) return;

  const allProjects = loadAllProjects();
  const userName = (CURRENT_EMPLOYEE.name || "").toLowerCase().trim();
  const userId = (CURRENT_EMPLOYEE.id || "").toLowerCase().trim();

  // Filter projects where logged-in user is Lead or listed in assignedMembers
  const myProjects = allProjects.filter(prj => {
    const lead = (prj.lead || prj.manager || "").toLowerCase().trim();
    const members = (prj.assignedMembers || []).map(m => String(m).toLowerCase().trim());

    const isLead = lead && (lead === userName || lead.includes(userName) || userName.includes(lead));
    const isMember = members.some(m => m === userName || m.includes(userName) || userName.includes(m) || (userId && m === userId));

    return isLead || isMember;
  });

  // Update Stat Count Card
  const statCount = document.getElementById('statMyProjectsCount');
  if (statCount) {
    statCount.textContent = String(myProjects.length).padStart(2, '0');
  }

  if (myProjects.length === 0) {
    container.innerHTML = `
      <div class="panel-card" style="text-align:center; padding: 2.5rem 1rem;">
        <i data-lucide="folder-x" size="40" style="color:var(--text-muted); margin-bottom:0.75rem;"></i>
        <h4 style="color:var(--text-muted); font-weight:600;">No Projects Assigned</h4>
        <p style="font-size:0.85rem; color:var(--text-sub); margin-top:0.3rem;">You have not been assigned to any project yet by the Administrator.</p>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  container.innerHTML = myProjects.map(prj => {
    const leadName = prj.lead || prj.manager || "Unassigned";
    const members = prj.assignedMembers || [leadName];
    const membersTags = members.map(m => `<span style="display:inline-block; font-size:0.75rem; background:rgba(255,255,255,0.06); padding:0.2rem 0.5rem; border-radius:4px; margin-right:0.35rem; margin-top:0.25rem; border:1px solid rgba(255,255,255,0.1);">👤 ${m}</span>`).join('');

    return `
      <div class="panel-card" style="margin-bottom:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
          <div>
            <h4 style="font-size:1.1rem; color:var(--text-white); font-weight:700;">${prj.name}</h4>
            <span style="font-size:0.75rem; color:var(--text-muted); display:block; margin-top:0.2rem;">Deadline: ${prj.deadline || 'No deadline'}</span>
          </div>
          <span class="badge-status badge-${prj.status}">${prj.status}</span>
        </div>

        <p style="font-size:0.85rem; color:var(--text-sub); margin-bottom:0.75rem;">${prj.description || ''}</p>

        <div style="margin-bottom:0.75rem;">
          <span style="font-size:0.775rem; background:rgba(234, 179, 8, 0.15); color: #fde047; padding: 0.25rem 0.6rem; border-radius: 999px; font-weight: 600; border: 1px solid rgba(234, 179, 8, 0.3);">👑 Lead: ${leadName}</span>
        </div>

        <div style="margin-bottom:1rem;">
          <label style="font-size:0.725rem; color:var(--text-muted); text-transform:uppercase; font-weight:700; display:block; margin-bottom:0.25rem;">Assigned Team Members</label>
          <div>${membersTags}</div>
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-sub); margin-bottom:0.35rem;">
            <span>Project Completion</span>
            <strong>${prj.progress || 0}%</strong>
          </div>
          <div style="height:8px; background:rgba(255,255,255,0.1); border-radius:999px; overflow:hidden;">
            <div style="height:100%; width:${prj.progress || 0}%; background:linear-gradient(90deg, #2563eb, #3b82f6); border-radius:999px;"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
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

  // Header Avatar & Details
  const topAvatar = document.querySelector('.user-profile-badge .user-avatar');
  const topName = document.querySelector('.user-profile-badge .name');
  const topRole = document.querySelector('.user-profile-badge .role');
  
  if (topName) topName.textContent = CURRENT_EMPLOYEE.name;
  if (topRole) topRole.textContent = CURRENT_EMPLOYEE.position;

  if (topAvatar) {
    if (CURRENT_EMPLOYEE.avatarUrl) {
      topAvatar.innerHTML = `<img src="${CURRENT_EMPLOYEE.avatarUrl}" alt="${CURRENT_EMPLOYEE.name}">`;
    } else {
      topAvatar.textContent = CURRENT_EMPLOYEE.initials;
    }
  }

  // Dashboard Greeting Title
  const dashWelcome = document.querySelector('#dashboardTab .page-title-group h2');
  if (dashWelcome) dashWelcome.textContent = `Good Morning, ${CURRENT_EMPLOYEE.name} 👋`;

  // Profile Tab Circle Avatar
  const profileAvatar = document.getElementById('profileAvatarCircle');
  const removeBtn = document.getElementById('btnRemovePhoto');

  if (profileAvatar) {
    if (CURRENT_EMPLOYEE.avatarUrl) {
      profileAvatar.innerHTML = `<img src="${CURRENT_EMPLOYEE.avatarUrl}" alt="${CURRENT_EMPLOYEE.name}">`;
      if (removeBtn) removeBtn.style.display = 'inline-flex';
    } else {
      profileAvatar.textContent = CURRENT_EMPLOYEE.initials;
      if (removeBtn) removeBtn.style.display = 'none';
    }
  }
}

/**
 * Handle Profile Image Upload
 */
function handleProfileImageUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file (PNG, JPG, JPEG, WebP).');
    return;
  }

  // Limit file size to 5MB
  if (file.size > 5 * 1024 * 1024) {
    alert('Image file size should be less than 5MB.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    CURRENT_EMPLOYEE.avatarUrl = dataUrl;

    // Persist in localStorage
    try {
      localStorage.setItem('hynaos_profile_avatar_' + CURRENT_EMPLOYEE.id, dataUrl);
      
      const stored = localStorage.getItem('hynaos_current_user');
      if (stored) {
        const u = JSON.parse(stored);
        u.avatar_url = dataUrl;
        localStorage.setItem('hynaos_current_user', JSON.stringify(u));
      }
    } catch(err) {
      console.warn('Could not save avatar to localStorage:', err);
    }

    renderMyProfile();
    console.log('✅ Profile image uploaded and updated!');
  };
  reader.readAsDataURL(file);
}

/**
 * Remove Custom Profile Image
 */
function removeProfileImage() {
  CURRENT_EMPLOYEE.avatarUrl = null;

  try {
    localStorage.removeItem('hynaos_profile_avatar_' + CURRENT_EMPLOYEE.id);
    
    const stored = localStorage.getItem('hynaos_current_user');
    if (stored) {
      const u = JSON.parse(stored);
      delete u.avatar_url;
      localStorage.setItem('hynaos_current_user', JSON.stringify(u));
    }
  } catch(err) {
    console.warn('Could not remove avatar from localStorage:', err);
  }

  const fileInput = document.getElementById('profileImageInput');
  if (fileInput) fileInput.value = '';

  renderMyProfile();
  console.log('🗑️ Profile image removed.');
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
window.handleProfileImageUpload = handleProfileImageUpload;
window.removeProfileImage = removeProfileImage;

/**
 * Update Employee Dashboard Stat Cards dynamically
 */
function updateEmployeeDashboardStatCards() {
  const statMyProjectsCount = document.getElementById('statMyProjectsCount');
  if (statMyProjectsCount && Array.isArray(MY_PROJECTS)) {
    statMyProjectsCount.textContent = String(MY_PROJECTS.length).padStart(2, '0');
  }

  const statMyTasksCompleted = document.getElementById('statMyTasksCompleted');
  if (statMyTasksCompleted && Array.isArray(myTasksList)) {
    const completedCount = myTasksList.filter(t => t.status === 'Completed').length + 18;
    statMyTasksCompleted.textContent = completedCount;
  }

  const statMyPendingTasks = document.getElementById('statMyPendingTasks');
  if (statMyPendingTasks && Array.isArray(myTasksList)) {
    const pendingCount = myTasksList.filter(t => t.status !== 'Completed').length;
    statMyPendingTasks.textContent = String(pendingCount).padStart(2, '0');
  }

  const statMyUpcomingDeadlines = document.getElementById('statMyUpcomingDeadlines');
  if (statMyUpcomingDeadlines && Array.isArray(myTasksList)) {
    statMyUpcomingDeadlines.textContent = "02";
  }
}

/**
 * Toast Notification Alert Helper
 */
function showHynaToast(message, iconName = 'check-circle') {
  let toastContainer = document.getElementById('hynaToastNotice');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'hynaToastNotice';
    toastContainer.className = 'hyna-toast';
    document.body.appendChild(toastContainer);
  }
  toastContainer.innerHTML = `<i data-lucide="${iconName}" size="18"></i><span>${message}</span>`;
  if (typeof lucide !== 'undefined') lucide.createIcons();
  
  toastContainer.classList.add('show');
  setTimeout(() => {
    toastContainer.classList.remove('show');
  }, 3000);
}

/**
 * REFRESH ALL DASHBOARD DATA
 */
function refreshAllDashboardData(showToast = true) {
  console.log("🔄 Refreshing all Employee Dashboard data...");

  // Trigger spin animation on refresh button icons
  const refreshIcons = document.querySelectorAll('#navRefreshBtn i, #pageRefreshBtn i');
  refreshIcons.forEach(icon => icon.classList.add('spin-icon'));

  // 1. Reload User Profile & Projects from Storage
  loadUserFromStorage();
  if (typeof loadAllProjects === 'function') loadAllProjects();

  // 2. Re-render all view tables and components
  if (typeof renderMyTasks === 'function') renderMyTasks();
  if (typeof renderMyProjects === 'function') renderMyProjects();
  if (typeof renderMyWorkLogs === 'function') renderMyWorkLogs();
  if (typeof renderMyLeaves === 'function') renderMyLeaves();
  if (typeof renderMyProfile === 'function') renderMyProfile();

  // 3. Update Stat Cards
  updateEmployeeDashboardStatCards();

  // 4. Re-initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 5. Complete animation & show toast
  setTimeout(() => {
    refreshIcons.forEach(icon => icon.classList.remove('spin-icon'));
    if (showToast) {
      showHynaToast("Dashboard refreshed successfully!", "refresh-cw");
    }
  }, 600);
}

window.refreshAllDashboardData = refreshAllDashboardData;
window.refreshAll = refreshAllDashboardData;
window.showHynaToast = showHynaToast;

// Auto-sync projects on storage update
window.addEventListener('storage', (e) => {
  if (!e.key || e.key === 'hynaos_projects_list') {
    if (typeof renderMyProjects === 'function') renderMyProjects();
    if (typeof updateEmployeeDashboardStatCards === 'function') updateEmployeeDashboardStatCards();
  }
});
window.addEventListener('hynaos_projects_updated', () => {
  if (typeof renderMyProjects === 'function') renderMyProjects();
  if (typeof updateEmployeeDashboardStatCards === 'function') updateEmployeeDashboardStatCards();
});


