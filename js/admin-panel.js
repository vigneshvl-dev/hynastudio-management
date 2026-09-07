/**
 * HYNAOS — Admin Panel Main Controller
 * Hyna Studio Management System
 */

// Initial Official Hyna Studio Team Roster
const INITIAL_EMPLOYEES = [
  {
    id: "EMP-001",
    name: "Vignesh",
    email: "vignesh@hynastudio.com",
    department: "Executive",
    position: "Founder & CEO",
    joiningDate: "2024-01-01",
    status: "active",
    initials: "V"
  },
  {
    id: "EMP-002",
    name: "Jashwin",
    email: "jashwin@hynastudio.com",
    department: "Executive",
    position: "Co-Founder & COO",
    joiningDate: "2024-01-01",
    status: "active",
    initials: "J"
  },
  {
    id: "EMP-003",
    name: "Dharshan J M",
    email: "dharshan@hynastudio.com",
    department: "Technology",
    position: "Co-Founder & CTO",
    joiningDate: "2024-01-01",
    status: "active",
    initials: "D"
  },
  {
    id: "EMP-004",
    name: "Muhammed Arshiya",
    email: "arshiya@hynastudio.com",
    department: "Product",
    position: "Chief Product Officer (CPO)",
    joiningDate: "2024-02-01",
    status: "active",
    initials: "MA"
  },
  {
    id: "EMP-005",
    name: "Muhammed Zarif",
    email: "zarif@hynastudio.com",
    department: "Marketing",
    position: "Chief Growth Officer (CGO)",
    joiningDate: "2024-02-01",
    status: "active",
    initials: "MZ"
  },
  {
    id: "EMP-006",
    name: "Asthamil",
    email: "asthamil@hynastudio.com",
    department: "Human Resources",
    position: "Manager / HR",
    joiningDate: "2024-02-15",
    status: "active",
    initials: "A"
  },
  {
    id: "EMP-007",
    name: "Tharun Krishna",
    email: "tharun@hynastudio.com",
    department: "Design",
    position: "Lead Designer",
    joiningDate: "2024-03-01",
    status: "active",
    initials: "TK"
  },
  {
    id: "EMP-008",
    name: "Rohit V",
    email: "rohit@hynastudio.com",
    department: "Engineering",
    position: "Senior Developer",
    joiningDate: "2024-03-10",
    status: "active",
    initials: "RV"
  },
  {
    id: "EMP-009",
    name: "Thivan S",
    email: "thivan@hynastudio.com",
    department: "Engineering",
    position: "Full Stack Developer",
    joiningDate: "2024-03-15",
    status: "active",
    initials: "TS"
  },
  {
    id: "EMP-010",
    name: "Anzarutheen",
    email: "anzar@hynastudio.com",
    department: "Engineering",
    position: "Frontend Developer",
    joiningDate: "2024-04-01",
    status: "active",
    initials: "AN"
  },
  {
    id: "EMP-011",
    name: "Akshaya B S",
    email: "akshaya@hynastudio.com",
    department: "Operations",
    position: "Operations Specialist",
    joiningDate: "2024-04-10",
    status: "active",
    initials: "AB"
  },
  {
    id: "EMP-012",
    name: "Linciya",
    email: "linciya@hynastudio.com",
    department: "Data & Analytics",
    position: "Data Analyst",
    joiningDate: "2024-05-01",
    status: "active",
    initials: "L"
  }
];

// Active Projects State
const INITIAL_PROJECTS = [
  { id: "PRJ-101", name: "HYNAOS Core Platform", manager: "Dharshan J M", progress: 85, deadline: "2026-09-30", status: "active" },
  { id: "PRJ-102", name: "Hyna Studio Rebrand", manager: "Tharun Krishna", progress: 95, deadline: "2026-09-15", status: "active" },
  { id: "PRJ-103", name: "Growth Engine & CRM", manager: "Muhammed Zarif", progress: 60, deadline: "2026-10-15", status: "planning" },
  { id: "PRJ-104", name: "Product Design System", manager: "Muhammed Arshiya", progress: 100, deadline: "2026-08-30", status: "completed" },
  { id: "PRJ-105", name: "Mobile Workspace App", manager: "Rohit V", progress: 40, deadline: "2026-11-01", status: "active" }
];

// Kanban Tasks State
const INITIAL_TASKS = [
  { id: "TSK-01", title: "Supabase Auth RLS Policies", desc: "Configure database row level security for profiles.", col: "todo", priority: "urgent", assignee: "Dharshan J M" },
  { id: "TSK-02", title: "Fuzzy Bubbles Font Styling", desc: "Integrate Google Font into header typography.", col: "completed", priority: "low", assignee: "Tharun Krishna" },
  { id: "TSK-03", title: "Kanban Board Drag & Drop", desc: "Build interactive task movement for Admin Panel.", col: "in_progress", priority: "high", assignee: "Rohit V" },
  { id: "TSK-04", title: "Employee Salary Calculator", desc: "Auto compute Basic + Bonus - Deductions.", col: "review", priority: "medium", assignee: "Asthamil" },
  { id: "TSK-05", title: "Data Analytics Dashboard", desc: "Create visual analytics charts for team metrics.", col: "in_progress", priority: "high", assignee: "Linciya" }
];

// Leave Requests State
const INITIAL_LEAVES = [
  { id: "LV-1", name: "Rohit V", type: "Sick Leave", dates: "Sep 10 - Sep 11", reason: "Medical Appointment", status: "Pending" },
  { id: "LV-2", name: "Linciya", type: "Casual Leave", dates: "Sep 15 - Sep 16", reason: "Personal Work", status: "Pending" },
  { id: "LV-3", name: "Anzarutheen", type: "Annual Leave", dates: "Aug 20 - Aug 22", reason: "Vacation", status: "Approved" }
];

// State Holders
let employeesList = [...INITIAL_EMPLOYEES];
let projectsList = [...INITIAL_PROJECTS];
let tasksList = [...INITIAL_TASKS];
let leavesList = [...INITIAL_LEAVES];

// Page Lifecycle Initialization
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Verify Admin Access Security
  await verifyAdminAccess();

  // 2. Initialize Navigation & Sidebar Toggle
  initNavigation();

  // 3. Render Dashboard Stat Cards & Tables
  renderEmployeesTable();
  renderProjectsList();
  renderKanbanBoard();
  renderLeavesTable();
  renderSalariesTable();
  renderPerformanceTable();

  // 4. Initialize Modals & Forms
  initModals();

  // 5. Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});

/**
 * Verify Admin Security Access
 */
async function verifyAdminAccess() {
  const { getClient, isDemoMode } = window.HYNAOS_SUPABASE || {};

  // Check demo mode or real Supabase auth
  if (isDemoMode() || !getClient()) {
    console.log("⚡ Admin Panel: Authorized (Demo Mode).");
    return;
  }

  try {
    const supabase = getClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = 'admin-login.html';
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      alert("Unauthorized Access: Administrator credentials required.");
      window.location.href = 'admin-login.html';
    }
  } catch (err) {
    console.error("Security check failed:", err);
  }
}

/**
 * Navigation Router & Sidebar Toggle
 */
function initNavigation() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  const navLinks = document.querySelectorAll('.sidebar-link');
  const tabContents = document.querySelectorAll('.tab-content');

  // Sidebar Toggle Collapse
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      sidebar.classList.toggle('mobile-open');
    });
  }

  // Tab Switcher
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTabId = link.getAttribute('data-tab');

      if (!targetTabId) return;

      // Update Nav Active State
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Update Tab Views
      tabContents.forEach(tab => {
        tab.classList.remove('active');
        if (tab.id === `${targetTabId}Tab`) {
          tab.classList.add('active');
        }
      });

      // Close Mobile Drawer on selection
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
 * Render Employee Management Roster Table
 */
function renderEmployeesTable() {
  const tbody = document.getElementById('employeeTableBody');
  const searchInput = document.getElementById('empSearchInput');
  const deptFilter = document.getElementById('empDeptFilter');

  if (!tbody) return;

  const query = searchInput ? searchInput.value.toLowerCase() : '';
  const selectedDept = deptFilter ? deptFilter.value : 'all';

  const filtered = employeesList.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(query) || 
                          emp.email.toLowerCase().includes(query) || 
                          emp.id.toLowerCase().includes(query);
    const matchesDept = selectedDept === 'all' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  tbody.innerHTML = filtered.map(emp => `
    <tr>
      <td>
        <div class="user-cell">
          <div class="user-avatar-sm">${emp.initials}</div>
          <div>
            <strong>${emp.name}</strong>
            <div style="font-size:0.75rem; color: var(--text-muted);">${emp.email}</div>
          </div>
        </div>
      </td>
      <td><code>${emp.id}</code></td>
      <td>${emp.department}</td>
      <td>${emp.position}</td>
      <td><span class="badge-status badge-active">Active</span></td>
      <td>
        <button class="btn-icon-action" title="Edit Employee" onclick="editEmployee('${emp.id}')">
          <i data-lucide="edit-3" size="14"></i>
        </button>
        <button class="btn-icon-action" title="View Profile">
          <i data-lucide="eye" size="14"></i>
        </button>
      </td>
    </tr>
  `).join('');

  // Update total count
  const countEl = document.getElementById('statTotalEmployees');
  if (countEl) countEl.textContent = String(employeesList.length).padStart(2, '0');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

/**
 * Render Projects List & Overview
 */
function renderProjectsList() {
  const container = document.getElementById('projectsContainer');
  if (!container) return;

  container.innerHTML = projectsList.map(prj => `
    <div class="project-item">
      <div class="project-item-meta">
        <div>
          <h4>${prj.name}</h4>
          <span style="font-size:0.8rem; color: var(--text-muted);">Manager: ${prj.manager} • Deadline: ${prj.deadline}</span>
        </div>
        <span class="badge-status badge-${prj.status}">${prj.status}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:0.8rem; color: var(--text-sub);">
        <span>Progress</span>
        <span>${prj.progress}%</span>
      </div>
      <div class="progress-bar-wrapper">
        <div class="progress-bar-fill" style="width: ${prj.progress}%;"></div>
      </div>
    </div>
  `).join('');
}

/**
 * Render Kanban Task Board
 */
function renderKanbanBoard() {
  const cols = {
    todo: document.getElementById('kanbanColTodo'),
    in_progress: document.getElementById('kanbanColInProgress'),
    review: document.getElementById('kanbanColReview'),
    completed: document.getElementById('kanbanColCompleted')
  };

  if (!cols.todo) return;

  // Clear columns
  Object.values(cols).forEach(c => { if(c) c.innerHTML = ''; });

  tasksList.forEach(task => {
    const cardHtml = `
      <div class="task-card" onclick="advanceTaskStatus('${task.id}')">
        <h5>${task.title}</h5>
        <p>${task.desc}</p>
        <div class="task-meta">
          <span class="priority-pill priority-${task.priority}">${task.priority}</span>
          <span>👤 ${task.assignee}</span>
        </div>
      </div>
    `;

    if (cols[task.col]) {
      cols[task.col].insertAdjacentHTML('beforeend', cardHtml);
    }
  });
}

/**
 * Advance Task Status on Click
 */
function advanceTaskStatus(taskId) {
  const task = tasksList.find(t => t.id === taskId);
  if (!task) return;

  const flow = ['todo', 'in_progress', 'review', 'completed'];
  const currentIndex = flow.indexOf(task.col);
  const nextIndex = (currentIndex + 1) % flow.length;
  task.col = flow[nextIndex];

  renderKanbanBoard();
}

/**
 * Render Leave Requests Table
 */
function renderLeavesTable() {
  const tbody = document.getElementById('leaveTableBody');
  if (!tbody) return;

  tbody.innerHTML = leavesList.map(item => `
    <tr>
      <td><strong>${item.name}</strong></td>
      <td>${item.type}</td>
      <td>${item.dates}</td>
      <td>${item.reason}</td>
      <td>
        <span class="badge-status badge-${item.status.toLowerCase() === 'approved' ? 'active' : item.status.toLowerCase() === 'pending' ? 'onhold' : 'delayed'}">
          ${item.status}
        </span>
      </td>
      <td>
        ${item.status === 'Pending' ? `
          <button class="btn-icon-action btn-approve" onclick="updateLeaveStatus('${item.id}', 'Approved')" title="Approve">
            <i data-lucide="check" size="14"></i>
          </button>
          <button class="btn-icon-action btn-reject" onclick="updateLeaveStatus('${item.id}', 'Rejected')" title="Reject">
            <i data-lucide="x" size="14"></i>
          </button>
        ` : '—'}
      </td>
    </tr>
  `).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function updateLeaveStatus(leaveId, newStatus) {
  const leave = leavesList.find(l => l.id === leaveId);
  if (leave) {
    leave.status = newStatus;
    renderLeavesTable();
  }
}

/**
 * Render Salary Table
 */
function renderSalariesTable() {
  const tbody = document.getElementById('salaryTableBody');
  if (!tbody) return;

  const salaries = [
    { name: "Vignesh", basic: 150000, bonus: 25000, ded: 5000, status: "Paid" },
    { name: "Jashwin", basic: 120000, bonus: 15000, ded: 3000, status: "Paid" },
    { name: "Dharshan J M", basic: 120000, bonus: 15000, ded: 3000, status: "Paid" },
    { name: "Muhammed Arshiya", basic: 95000, bonus: 10000, ded: 2000, status: "Paid" },
    { name: "Muhammed Zarif", basic: 95000, bonus: 10000, ded: 2000, status: "Paid" },
    { name: "Asthamil", basic: 75000, bonus: 5000, ded: 1000, status: "Processing" },
    { name: "Tharun Krishna", basic: 70000, bonus: 6000, ded: 1000, status: "Paid" },
    { name: "Rohit V", basic: 75000, bonus: 8000, ded: 1500, status: "Paid" },
    { name: "Thivan S", basic: 75000, bonus: 7500, ded: 1500, status: "Paid" },
    { name: "Anzarutheen", basic: 70000, bonus: 5000, ded: 1000, status: "Paid" },
    { name: "Akshaya B S", basic: 60000, bonus: 4000, ded: 1000, status: "Paid" },
    { name: "Linciya", basic: 65000, bonus: 5000, ded: 1000, status: "Paid" }
  ];

  tbody.innerHTML = salaries.map(s => {
    const net = s.basic + s.bonus - s.ded;
    return `
      <tr>
        <td><strong>${s.name}</strong></td>
        <td>₹ ${s.basic.toLocaleString()}</td>
        <td>₹ ${s.bonus.toLocaleString()}</td>
        <td>₹ ${s.ded.toLocaleString()}</td>
        <td><strong>₹ ${net.toLocaleString()}</strong></td>
        <td><span class="badge-status badge-${s.status === 'Paid' ? 'active' : 'onhold'}">${s.status}</span></td>
      </tr>
    `;
  }).join('');
}

/**
 * Render Employee Performance Table
 */
function renderPerformanceTable() {
  const tbody = document.getElementById('performanceTableBody');
  if (!tbody) return;

  const performance = [
    { name: "Vignesh", completed: 24, onTime: "99%", score: 98, rating: "Excellent" },
    { name: "Jashwin", completed: 22, onTime: "98%", score: 97, rating: "Excellent" },
    { name: "Dharshan J M", completed: 20, onTime: "98%", score: 96, rating: "Excellent" },
    { name: "Muhammed Arshiya", completed: 18, onTime: "96%", score: 94, rating: "Excellent" },
    { name: "Muhammed Zarif", completed: 17, onTime: "95%", score: 93, rating: "Excellent" },
    { name: "Asthamil", completed: 15, onTime: "94%", score: 91, rating: "Excellent" },
    { name: "Tharun Krishna", completed: 16, onTime: "96%", score: 93, rating: "Excellent" },
    { name: "Rohit V", completed: 14, onTime: "92%", score: 89, rating: "Good" },
    { name: "Thivan S", completed: 14, onTime: "91%", score: 88, rating: "Good" },
    { name: "Anzarutheen", completed: 13, onTime: "90%", score: 87, rating: "Good" },
    { name: "Akshaya B S", completed: 12, onTime: "90%", score: 86, rating: "Good" },
    { name: "Linciya", completed: 12, onTime: "89%", score: 85, rating: "Good" }
  ];

  tbody.innerHTML = performance.map(p => `
    <tr>
      <td><strong>${p.name}</strong></td>
      <td>${p.completed} Tasks</td>
      <td>${p.onTime}</td>
      <td><strong>${p.score} / 100</strong></td>
      <td><span class="badge-status badge-${p.rating === 'Excellent' ? 'active' : 'planning'}">${p.rating}</span></td>
    </tr>
  `).join('');
}

/**
 * Modals & Add Employee Handler
 */
function initModals() {
  const modal = document.getElementById('addEmployeeModal');
  const openBtn = document.getElementById('openAddEmpModalBtn');
  const closeBtn = document.getElementById('closeAddEmpModalBtn');
  const form = document.getElementById('addEmployeeForm');

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => modal.classList.add('show'));
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('show'));
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('newEmpName').value.trim();
      const email = document.getElementById('newEmpEmail').value.trim();
      const dept = document.getElementById('newEmpDept').value;
      const pos = document.getElementById('newEmpPosition').value.trim();

      if (!name || !email) return;

      const newEmp = {
        id: `EMP-${String(employeesList.length + 1).padStart(3, '0')}`,
        name,
        email,
        department: dept,
        position: pos || 'Team Member',
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'active',
        initials: name.split(' ').map(n => n[0]).join('').toUpperCase()
      };

      employeesList.push(newEmp);
      renderEmployeesTable();
      form.reset();
      if (modal) modal.classList.remove('show');
      alert(`Employee ${name} added successfully!`);
    });
  }
}

// Global functions exports
window.advanceTaskStatus = advanceTaskStatus;
window.updateLeaveStatus = updateLeaveStatus;
window.renderEmployeesTable = renderEmployeesTable;
