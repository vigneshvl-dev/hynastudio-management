/**
 * HYNAOS — Admin Panel Main Controller
 * Hyna Studio Management System
 */

// Initial Official Hyna Studio Team Roster
const INITIAL_EMPLOYEES = [
  { id: "EMP-001", name: "Vignesh", email: "team.hynastudio@gmail.com", department: "Executive", position: "Founder & CEO", joiningDate: "2024-01-01", status: "active", initials: "V" },
  { id: "EMP-002", name: "Jashwin J", email: "jashwin@hynastudio.com", department: "Executive", position: "Co-Founder & COO", joiningDate: "2024-01-01", status: "active", initials: "JJ" },
  { id: "EMP-003", name: "Dharshan J M", email: "dharshan@hynastudio.com", department: "Executive", position: "Co-Founder & CTO", joiningDate: "2024-01-01", status: "active", initials: "D" },
  { id: "EMP-004", name: "Linciya", email: "linciya@hynastudio.com", department: "Marketing", position: "CMO — Chief Marketing Officer", joiningDate: "2024-02-01", status: "active", initials: "L" },
  { id: "EMP-005", name: "New Appointment", email: "cso@hynastudio.com", department: "Strategy", position: "CSO — Chief Strategy Officer", joiningDate: "2024-02-01", status: "active", initials: "CS" },
  { id: "EMP-006", name: "Muhammed Zarif", email: "zarif@hynastudio.com", department: "Growth", position: "Director & Growth Manager", joiningDate: "2024-02-10", status: "active", initials: "MZ" },
  { id: "EMP-007", name: "Mohamed Arshiya", email: "arshiya@hynastudio.com", department: "Product", position: "CPO — Chief Product Officer", joiningDate: "2024-02-15", status: "active", initials: "MA" },
  { id: "EMP-008", name: "Asthamil", email: "asthamil@hynastudio.com", department: "Human Resources", position: "HR Manager", joiningDate: "2024-02-20", status: "active", initials: "A" },
  { id: "EMP-009", name: "Tharun Krishna", email: "tharun@hynastudio.com", department: "Design", position: "Designer", joiningDate: "2024-03-01", status: "active", initials: "TK" },
  { id: "EMP-010", name: "Akshaya", email: "akshaya@hynastudio.com", department: "Engineering", position: "DevOps Engineer", joiningDate: "2024-03-10", status: "active", initials: "A" },
  { id: "EMP-011", name: "Thivan", email: "thivan@hynastudio.com", department: "Engineering", position: "Full Stack Developer", joiningDate: "2024-03-15", status: "active", initials: "T" },
  { id: "EMP-012", name: "Rohit", email: "rohit@hynastudio.com", department: "Engineering", position: "Full Stack Developer", joiningDate: "2024-03-20", status: "active", initials: "R" },
  { id: "EMP-013", name: "Anzarutheen", email: "anzar@hynastudio.com", department: "Engineering", position: "Full Stack Developer", joiningDate: "2024-04-01", status: "active", initials: "AN" }
];

// Active Projects State
const INITIAL_PROJECTS = [
  { id: "PRJ-101", name: "HYNAOS Core Platform", manager: "Dharshan J M", lead: "Dharshan J M", assignedMembers: ["Dharshan J M", "Rohit V", "Thivan", "Anzarutheen"], progress: 85, deadline: "2026-09-30", status: "active", description: "Core enterprise platform for Hyna Studio." },
  { id: "PRJ-102", name: "Hyna Studio Rebrand", manager: "Tharun Krishna", lead: "Tharun Krishna", assignedMembers: ["Tharun Krishna", "Linciya", "Mohamed Arshiya"], progress: 95, deadline: "2026-09-15", status: "active", description: "Visual identity design update and brand system." },
  { id: "PRJ-103", name: "Growth Engine & CRM", manager: "Muhammed Zarif", lead: "Muhammed Zarif", assignedMembers: ["Muhammed Zarif", "Linciya", "New Appointment"], progress: 60, deadline: "2026-10-15", status: "active", description: "Generative AI marketing copy suite." },
  { id: "PRJ-104", name: "Product Design System", manager: "Mohamed Arshiya", lead: "Mohamed Arshiya", assignedMembers: ["Mohamed Arshiya", "Tharun Krishna"], progress: 100, deadline: "2026-08-30", status: "completed", description: "Design token library and Web UI assets." },
  { id: "PRJ-105", name: "Mobile Workspace App", manager: "Rohit V", lead: "Rohit V", assignedMembers: ["Rohit V", "Akshaya", "Thivan"], progress: 40, deadline: "2026-11-01", status: "active", description: "Mobile application for field attendance and tasks." }
];

// State Holders
let employeesList = [...INITIAL_EMPLOYEES];
let projectsList = [...INITIAL_PROJECTS];

function loadProjectsFromStorage() {
  try {
    const stored = localStorage.getItem('hynaos_projects_list');
    if (stored) {
      projectsList = JSON.parse(stored);
    } else {
      projectsList = [...INITIAL_PROJECTS];
      localStorage.setItem('hynaos_projects_list', JSON.stringify(projectsList));
    }
  } catch(e) {
    projectsList = [...INITIAL_PROJECTS];
  }
}

function saveProjectsToStorage() {
  try {
    localStorage.setItem('hynaos_projects_list', JSON.stringify(projectsList));
  } catch(e) {
    console.warn("Failed to save projects to localStorage:", e);
  }
}
let tasksList = [...INITIAL_TASKS];
let leavesList = [...INITIAL_LEAVES];

// Page Lifecycle Initialization
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Verify Admin Access Security
  await verifyAdminAccess();

  // 2. Initialize Navigation & Sidebar Toggle
  initNavigation();

  // 3. Render Dashboard Stat Cards & Tables
  loadProjectsFromStorage();
  populateProjectModalOptions();
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
        <button class="btn-icon-action" title="View Profile" onclick="viewEmployeeProfile('${emp.id}')">
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

  if (projectsList.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">No projects created yet. Click "+ ADD NEW PROJECT" above to create one.</p>`;
    return;
  }

  container.innerHTML = projectsList.map(prj => {
    const leadName = prj.lead || prj.manager || "Unassigned";
    const members = prj.assignedMembers || [leadName];
    const membersTags = members.map(m => `<span class="member-tag">👤 ${m}</span>`).join('');

    return `
      <div class="project-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.75rem;">
          <div>
            <h4 style="font-size:1.05rem; color:var(--text-white); font-weight:700;">${prj.name}</h4>
            <span style="font-size:0.75rem; color:var(--text-muted); display:block; margin-top:0.2rem;">Deadline: ${prj.deadline || 'No deadline'}</span>
          </div>
          <span class="badge-status badge-${prj.status}">${prj.status}</span>
        </div>

        <div style="margin-top:0.25rem;">
          <span class="project-lead-pill"><i data-lucide="crown" size="12"></i> Lead: ${leadName}</span>
        </div>

        <div>
          <label style="font-size:0.725rem; color:var(--text-muted); text-transform:uppercase; font-weight:700; display:block; margin-bottom:0.2rem;">Assigned Team Members</label>
          <div class="project-members-tags">
            ${membersTags}
          </div>
        </div>

        <div style="margin-top:auto; padding-top:0.5rem;">
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-sub); margin-bottom:0.35rem;">
            <span>Completion Progress</span>
            <strong>${prj.progress || 0}%</strong>
          </div>
          <div class="progress-bar-wrapper">
            <div class="progress-bar-fill" style="width: ${prj.progress || 0}%;"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
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
 * Edit Employee Action Handler
 */
function editEmployee(empId) {
  const emp = employeesList.find(e => e.id === empId);
  if (!emp) return;

  const modal = document.getElementById('editEmployeeModal');
  const idInput = document.getElementById('editEmpId');
  const nameInput = document.getElementById('editEmpName');
  const emailInput = document.getElementById('editEmpEmail');
  const deptInput = document.getElementById('editEmpDept');
  const posInput = document.getElementById('editEmpPosition');
  const statusInput = document.getElementById('editEmpStatus');

  if (idInput) idInput.value = emp.id;
  if (nameInput) nameInput.value = emp.name;
  if (emailInput) emailInput.value = emp.email;
  if (deptInput) deptInput.value = emp.department || 'Engineering';
  if (posInput) posInput.value = emp.position || 'Team Member';
  if (statusInput) statusInput.value = emp.status || 'active';

  if (modal) modal.classList.add('show');
}

/**
 * View Employee Profile Action Handler
 */
function viewEmployeeProfile(empId) {
  const emp = employeesList.find(e => e.id === empId);
  if (!emp) return;
  alert(`Employee Profile Details:\n\nName: ${emp.name}\nID: ${emp.id}\nEmail: ${emp.email}\nDepartment: ${emp.department}\nPosition: ${emp.position}\nStatus: ${emp.status}`);
}

/**
 * Dynamically Populate Project Modal Options (Lead Select & Members Checkbox Grid)
 */
function populateProjectModalOptions() {
  const leadSelect = document.getElementById('newProjectLead');
  const membersGrid = document.getElementById('newProjectMembersList');

  if (leadSelect) {
    const currentVal = leadSelect.value;
    leadSelect.innerHTML = `<option value="">-- Select Project Lead --</option>` +
      employeesList.map(emp => `<option value="${emp.name}">${emp.name} (${emp.position || emp.department})</option>`).join('');
    if (currentVal) leadSelect.value = currentVal;
  }

  if (membersGrid) {
    membersGrid.innerHTML = employeesList.map(emp => `
      <label class="checkbox-member-card">
        <input type="checkbox" name="projectMembers" value="${emp.name}">
        <span>
          <strong>${emp.name}</strong>
          <small>${emp.position || emp.department}</small>
        </span>
      </label>
    `).join('');
  }
}

/**
 * Modals & Form Handlers
 */
function initModals() {
  // Add Employee Modal
  const addModal = document.getElementById('addEmployeeModal');
  const openAddBtn = document.getElementById('openAddEmpModalBtn');
  const closeAddBtn = document.getElementById('closeAddEmpModalBtn');
  const addForm = document.getElementById('addEmployeeForm');

  if (openAddBtn && addModal) {
    openAddBtn.addEventListener('click', () => addModal.classList.add('show'));
  }

  if (closeAddBtn && addModal) {
    closeAddBtn.addEventListener('click', () => addModal.classList.remove('show'));
  }

  if (addForm) {
    addForm.addEventListener('submit', (e) => {
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
      populateProjectModalOptions();
      renderEmployeesTable();
      addForm.reset();
      if (addModal) addModal.classList.remove('show');
      alert(`Employee ${name} created successfully!`);
    });
  }

  // Edit Employee Modal
  const editModal = document.getElementById('editEmployeeModal');
  const closeEditBtn = document.getElementById('closeEditEmpModalBtn');
  const editForm = document.getElementById('editEmployeeForm');

  if (closeEditBtn && editModal) {
    closeEditBtn.addEventListener('click', () => editModal.classList.remove('show'));
  }

  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const empId = document.getElementById('editEmpId').value;
      const name = document.getElementById('editEmpName').value.trim();
      const email = document.getElementById('editEmpEmail').value.trim();
      const dept = document.getElementById('editEmpDept').value;
      const pos = document.getElementById('editEmpPosition').value.trim();
      const status = document.getElementById('editEmpStatus').value;

      const empIndex = employeesList.findIndex(e => e.id === empId);
      if (empIndex !== -1) {
        const parts = name.split(' ').filter(Boolean);
        let initials = "HE";
        if (parts.length > 1) {
          initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        } else if (parts[0]) {
          initials = parts[0].substring(0, 2).toUpperCase();
        }

        employeesList[empIndex] = {
          ...employeesList[empIndex],
          name,
          email,
          department: dept,
          position: pos,
          status,
          initials
        };

        populateProjectModalOptions();
        renderEmployeesTable();
        if (editModal) editModal.classList.remove('show');
        alert(`Employee ${name} (${empId}) updated successfully!`);
      }
    });
  }

  // Add Project Modal Handler
  const addProjModal = document.getElementById('addProjectModal');
  const openAddProjBtn = document.getElementById('openAddProjectModalBtn');
  const closeAddProjBtn = document.getElementById('closeAddProjectModalBtn');
  const addProjForm = document.getElementById('addProjectForm');

  if (openAddProjBtn && addProjModal) {
    openAddProjBtn.addEventListener('click', () => {
      populateProjectModalOptions();
      addProjModal.classList.add('show');
    });
  }

  if (closeAddProjBtn && addProjModal) {
    closeAddProjBtn.addEventListener('click', () => addProjModal.classList.remove('show'));
  }

  if (addProjForm) {
    addProjForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('newProjectName').value.trim();
      const lead = document.getElementById('newProjectLead').value;
      const deadline = document.getElementById('newProjectDeadline').value;
      const description = document.getElementById('newProjectDescription').value.trim();

      const memberCheckboxes = document.querySelectorAll('input[name="projectMembers"]:checked');
      let selectedMembers = Array.from(memberCheckboxes).map(cb => cb.value);

      if (!name || !lead) {
        alert("Please enter project name and select a project lead.");
        return;
      }

      // Ensure Lead is in assignedMembers array
      if (!selectedMembers.includes(lead)) {
        selectedMembers.unshift(lead);
      }

      const newProject = {
        id: `PRJ-${100 + projectsList.length + 1}`,
        name: name,
        manager: lead,
        lead: lead,
        assignedMembers: selectedMembers,
        progress: 0,
        deadline: deadline || "TBD",
        status: "active",
        description: description || "No description provided."
      };

      projectsList.push(newProject);
      saveProjectsToStorage();
      renderProjectsList();
      addProjForm.reset();
      if (addProjModal) addProjModal.classList.remove('show');
      alert(`Project "${name}" created successfully and assigned to team members!`);
    });
  }
}

// Global functions exports
window.advanceTaskStatus = advanceTaskStatus;
window.updateLeaveStatus = updateLeaveStatus;
window.renderEmployeesTable = renderEmployeesTable;
window.editEmployee = editEmployee;
window.viewEmployeeProfile = viewEmployeeProfile;
window.populateProjectModalOptions = populateProjectModalOptions;

