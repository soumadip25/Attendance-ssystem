/**
 * PCE F Division • Attendance Tracker
 * Author: Soumadip Samanta
 * Ponytail: Native platform features, HTML5 <dialog>, standard Math, zero bloat
 */

const STUDENT_DB = {
    "601": "Neha Sali", "602": "Soumadip Samanta", "603": "Sandesh Shinde",
    "604": "Sarang Sabu", "605": "Sarthak Kane", "606": "Sayali Popat",
    "607": "Alvina Sayyed", "608": "Shambhavi Pandey", "609": "Om Shastri",
    "610": "Shaurya Pratap", "611": "Vinayak Shedge", "612": "Piyush Shelke",
    "613": "Shashank Shenoy", "614": "Shainy Shetty", "615": "Shikha Sajeev",
    "616": "Riddhi Shinde", "617": "Vidhi Shinde", "618": "Krushna Shirsath",
    "619": "Shreya Satish", "620": "Shreyas Taywade", "621": "Shashank Shukla",
    "622": "Siddhi Krishna", "623": "Sakshi Singh", "624": "Shivam Singh",
    "625": "Tanmay Singh", "626": "Sai Sircilla", "627": "Pranav Sodave",
    "628": "Tanmay Solanke", "629": "Gayatri Sonalkar", "630": "Aarushi Sonawane",
    "631": "Manisha Sule", "632": "Jay Surve", "633": "Roshan Suryawanshi",
    "634": "Tanaya Sachin", "635": "Aryan Tare", "636": "Eshaa Tatuskar",
    "637": "Tej Sunil", "638": "Darshi Thanatharey", "639": "Sanskar Thombre",
    "640": "Sahiruday Tirakala", "641": "Shrishti Tripathi", "642": "Niranjan Tupe",
    "643": "Saood Turk", "644": "Shivam Ule", "645": "Bhoomi Upadhyay",
    "646": "Umair Usmani", "647": "Tanmay Vaidya", "648": "Vaishnav Krishnamurthy",
    "649": "Vaishnav Kumar", "650": "Vaishnavi Rajendra", "651": "Varun Srivastava",
    "652": "Shubham Verma", "653": "Vinay Sharanabasappa", "654": "Alok Vishwakarma",
    "655": "Ritesh Vishwakarma", "656": "Vishwanath", "657": "Kunal Wadkar",
    "658": "Animesh Wagh", "659": "Manavsi Wagh", "660": "Bhavesh Wani",
    "661": "Goraksha Yash", "662": "Ankit Yedekar"
};

const DEFAULT_SUBJECTS = [
    { id: 1, name: "Mathematics", present: 0, total: 0, history: [] },
    { id: 2, name: "DSA", present: 0, total: 0, history: [] },
    { id: 3, name: "AEC", present: 0, total: 0, history: [] },
    { id: 4, name: "HVSE", present: 0, total: 0, history: [] },
    { id: 5, name: "DBMS", present: 0, total: 0, history: [] },
    { id: 6, name: "PFM", present: 0, total: 0, history: [] },
    { id: 7, name: "Maths Tutorial", present: 0, total: 0, history: [] },
    { id: 8, name: "DSA Practical", present: 0, total: 0, history: [] },
    { id: 9, name: "DC Practical", present: 0, total: 0, history: [] },
    { id: 10, name: "DC SD", present: 0, total: 0, history: [] }
];

const state = {
    user: null,
    subjects: [],
    target: 75,
    filter: 'all',
    search: ''
};

// 1. Storage Helpers
const getStorageKey = (roll) => `pce_attendance_v3_${roll}`;

function loadUserData(roll) {
    try {
        const raw = localStorage.getItem(getStorageKey(roll));
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {
        console.error(e);
    }
    return DEFAULT_SUBJECTS.map(s => ({ ...s, history: [] }));
}

function saveUserData() {
    if (!state.user) return;
    localStorage.setItem(getStorageKey(state.user.roll), JSON.stringify(state.subjects));
}

// 2. Math & Prediction
function calcPrediction(present, total, target) {
    if (total === 0) return { type: 'neutral', message: 'No classes held yet', color: '#64748b', pct: 0 };
    const pct = (present / total) * 100;
    if (pct >= target) {
        const canMiss = Math.floor((100 * present - target * total) / target);
        return {
            type: canMiss > 0 ? 'safe' : 'warning',
            message: canMiss > 0 ? `Safe: Can miss ${canMiss} class${canMiss > 1 ? 'es' : ''}` : "Boundary: Don't miss next class",
            color: '#059669',
            pct
        };
    }
    const mustAttend = Math.ceil((target * total - 100 * present) / (100 - target));
    return {
        type: 'danger',
        message: `Shortage: Attend next ${mustAttend} class${mustAttend > 1 ? 'es' : ''}`,
        color: pct >= target - 15 ? '#d97706' : '#dc2626',
        pct
    };
}

// 3. Toast
function showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = 'circle-info';
    if (type === 'success') icon = 'check';
    if (type === 'warning') icon = 'triangle-exclamation';
    if (type === 'error') icon = 'circle-exclamation';
    toast.innerHTML = `<i class="fa-solid fa-${icon}"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2400);
}

// 4. Initialization
document.addEventListener('DOMContentLoaded', () => {
    const storedTarget = localStorage.getItem('pce_target_goal');
    if (storedTarget) {
        state.target = parseInt(storedTarget, 10);
        document.querySelectorAll('.target-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.target, 10) === state.target);
        });
    }

    setupAuth();
    setupDashboard();
    setupNativeDialogs();

    const lastRoll = localStorage.getItem('pce_last_active_roll');
    if (lastRoll && STUDENT_DB[lastRoll]) {
        login(lastRoll, false);
    }
});

// 5. Auth Handlers
function setupAuth() {
    const rollInput = document.getElementById('rollInput');
    const clearBtn = document.getElementById('clearRollBtn');
    const errorBox = document.getElementById('loginErrorMsg');
    const errorText = document.getElementById('loginErrorText');
    const form = document.getElementById('loginForm');

    rollInput.addEventListener('input', () => {
        const val = rollInput.value.trim();
        clearBtn.classList.toggle('hidden', val.length === 0);
        errorBox.classList.add('hidden');
    });

    clearBtn.addEventListener('click', () => {
        rollInput.value = '';
        clearBtn.classList.add('hidden');
        errorBox.classList.add('hidden');
        rollInput.focus();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const roll = rollInput.value.trim();
        if (STUDENT_DB[roll]) {
            login(roll, true);
        } else {
            errorText.textContent = roll.length > 0
                ? `Roll #${roll} not found in Division F`
                : "Enter a valid 3-digit roll number (601–662)";
            errorBox.classList.remove('hidden');
            rollInput.focus();
        }
    });
}

function login(roll, notify = false) {
    state.user = { roll, name: STUDENT_DB[roll] };
    localStorage.setItem('pce_last_active_roll', roll);
    state.subjects = loadUserData(roll);

    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');

    document.getElementById('userName').textContent = state.user.name;
    document.getElementById('userRollBadge').textContent = `Roll ${roll}`;

    renderDashboard();
    if (notify) showToast(`Signed in as ${state.user.name}`, 'success');
}

function logout() {
    state.user = null;
    localStorage.removeItem('pce_last_active_roll');

    document.getElementById('appScreen').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');

    const rollInput = document.getElementById('rollInput');
    rollInput.value = '';
    document.getElementById('clearRollBtn').classList.add('hidden');
    document.getElementById('loginErrorMsg').classList.add('hidden');
    rollInput.focus();
    showToast('Signed out', 'info');
}

// 6. Dashboard Handlers & Rendering
function setupDashboard() {
    document.getElementById('logoutBtn').addEventListener('click', logout);

    const searchInput = document.getElementById('subjectSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    searchInput.addEventListener('input', (e) => {
        state.search = e.target.value.toLowerCase().trim();
        clearSearchBtn.classList.toggle('hidden', state.search.length === 0);
        renderSubjectList();
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        state.search = '';
        clearSearchBtn.classList.add('hidden');
        renderSubjectList();
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.filter = btn.dataset.filter;
            renderSubjectList();
        });
    });

    document.getElementById('quickMarkPresentBtn').addEventListener('click', () => {
        if (!state.subjects.length) return;
        state.subjects.forEach(s => {
            if (!Array.isArray(s.history)) s.history = [];
            s.present += 1;
            s.total += 1;
            s.history.push('p');
        });
        saveUserData();
        renderDashboard();
        showToast('Marked present across all classes today', 'success');
    });
}

function renderDashboard() {
    renderStats();
    renderSubjectList();
}

function renderStats() {
    const totalP = state.subjects.reduce((sum, s) => sum + s.present, 0);
    const totalT = state.subjects.reduce((sum, s) => sum + s.total, 0);
    const totalA = Math.max(0, totalT - totalP);
    const avg = totalT > 0 ? (totalP / totalT) * 100 : 0;
    const roundedAvg = Math.round(avg);

    document.getElementById('overallPercent').textContent = roundedAvg;
    document.getElementById('overallPresentCount').textContent = totalP;
    document.getElementById('overallTotalCount').textContent = totalT;
    document.getElementById('overallAbsentCount').textContent = totalA;
    document.getElementById('targetBadgeLabel').textContent = `Goal: ${state.target}%`;
    document.getElementById('gaugeTargetText').textContent = `${state.target}% goal`;

    const pred = calcPrediction(totalP, totalT, state.target);
    const gaugeBar = document.getElementById('overviewGaugeBar');
    const circumference = 301.59;
    gaugeBar.style.strokeDashoffset = circumference - (avg / 100) * circumference;
    gaugeBar.style.stroke = pred.color;

    const pill = document.getElementById('overallStatusPill');
    pill.className = `status-indicator ${pred.type}`;
    document.getElementById('overallStatusText').textContent = pred.message;
}

function renderSubjectList() {
    const list = document.getElementById('subjectList');
    const emptyState = document.getElementById('emptyState');
    const countBadge = document.getElementById('subjectCountBadge');

    const filtered = state.subjects.filter(s => {
        if (!s.name.toLowerCase().includes(state.search)) return false;
        const pct = s.total > 0 ? (s.present / s.total) * 100 : 0;
        if (state.filter === 'low') return pct < state.target;
        if (state.filter === 'safe') return pct >= state.target && s.total > 0;
        return true;
    });

    countBadge.textContent = `${state.subjects.length} subject${state.subjects.length === 1 ? '' : 's'}`;

    if (!filtered.length) {
        list.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    list.innerHTML = filtered.map(s => {
        const pct = s.total > 0 ? (s.present / s.total) * 100 : 0;
        const roundedPct = Math.round(pct);
        const pred = calcPrediction(s.present, s.total, state.target);
        const ringCircumference = 119.38;
        const ringOffset = ringCircumference - (pct / 100) * ringCircumference;
        const canUndo = (s.history && s.history.length > 0) || s.total > 0;

        return `
            <div class="subject-card" data-id="${s.id}">
                <div class="card-top">
                    <div class="card-info">
                        <div class="ring-wrap">
                            <svg class="ring-svg" viewBox="0 0 44 44">
                                <circle class="ring-bg" cx="22" cy="22" r="19"></circle>
                                <circle class="ring-fill" cx="22" cy="22" r="19"
                                    style="stroke-dashoffset: ${ringOffset}; stroke: ${pred.color};"></circle>
                            </svg>
                            <span class="ring-text mono-figure">${roundedPct}%</span>
                        </div>
                        <div class="subject-details">
                            <h4 class="subject-title" title="${escapeHtml(s.name)}">${escapeHtml(s.name)}</h4>
                            <div class="subject-tally mono-figure">${s.present} / ${s.total} attended</div>
                        </div>
                    </div>
                    <button class="card-options-btn" onclick="openEditSubject(${s.id})" title="Edit subject">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                </div>

                <div class="status-pill ${pred.type}">
                    <span class="status-dot"></span>
                    <span>${pred.message}</span>
                </div>

                <div class="actions-grid">
                    <button class="action-trigger present" onclick="markAttendance(${s.id}, 'p')">
                        <i class="fa-solid fa-check"></i>
                        <span>Present</span>
                    </button>
                    <button class="action-trigger absent" onclick="markAttendance(${s.id}, 'a')">
                        <i class="fa-solid fa-xmark"></i>
                        <span>Absent</span>
                    </button>
                    <button class="action-trigger undo" onclick="markAttendance(${s.id}, 'undo')" ${!canUndo ? 'disabled' : ''}>
                        <i class="fa-solid fa-rotate-left"></i>
                        <span>Undo</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// 7. Attendance Actions
window.markAttendance = function(id, action) {
    const s = state.subjects.find(sub => sub.id === id);
    if (!s) return;
    if (!Array.isArray(s.history)) s.history = [];

    if (action === 'p') {
        s.present += 1;
        s.total += 1;
        s.history.push('p');
        showToast(`Present in ${s.name}`, 'success');
    } else if (action === 'a') {
        s.total += 1;
        s.history.push('a');
        showToast(`Absent in ${s.name}`, 'warning');
    } else if (action === 'undo') {
        if (s.history.length > 0) {
            const last = s.history.pop();
            if (last === 'p') {
                s.present = Math.max(0, s.present - 1);
                s.total = Math.max(0, s.total - 1);
            } else if (last === 'a') {
                s.total = Math.max(0, s.total - 1);
            }
            showToast(`Reverted last entry for ${s.name}`, 'info');
        } else if (s.total > 0) {
            if (s.present > 0) s.present -= 1;
            s.total -= 1;
            showToast(`Adjusted ${s.name}`, 'info');
        }
    }
    saveUserData();
    renderDashboard();
};

// 8. Native Dialogs Management (<dialog>)
function setupNativeDialogs() {
    const subjectDialog = document.getElementById('subjectDialog');
    const settingsDialog = document.getElementById('settingsDialog');

    // Open Add Dialog
    document.getElementById('openAddSubjectBtn').addEventListener('click', () => {
        document.getElementById('dialogTitle').textContent = 'Add class';
        document.getElementById('dialogSubjectId').value = '';
        document.getElementById('dialogSubjectName').value = '';
        document.getElementById('dialogDeleteBtn').classList.add('hidden');
        subjectDialog.showModal();
        document.getElementById('dialogSubjectName').focus();
    });

    // Form submit for Add / Edit
    document.getElementById('subjectForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const idVal = document.getElementById('dialogSubjectId').value;
        const nameVal = document.getElementById('dialogSubjectName').value.trim();
        if (!nameVal) return;

        if (idVal) {
            const s = state.subjects.find(sub => sub.id == idVal);
            if (s) {
                s.name = nameVal;
                showToast(`Renamed to "${nameVal}"`, 'success');
            }
        } else {
            state.subjects.push({
                id: Date.now(),
                name: nameVal,
                present: 0,
                total: 0,
                history: []
            });
            showToast(`Added "${nameVal}"`, 'success');
        }

        saveUserData();
        subjectDialog.close();
        renderDashboard();
    });

    // Delete button inside subject dialog
    document.getElementById('dialogDeleteBtn').addEventListener('click', () => {
        const idVal = document.getElementById('dialogSubjectId').value;
        const s = state.subjects.find(sub => sub.id == idVal);
        if (!s) return;
        if (confirm(`Delete "${s.name}"?`)) {
            state.subjects = state.subjects.filter(sub => sub.id != idVal);
            saveUserData();
            subjectDialog.close();
            renderDashboard();
            showToast(`Deleted "${s.name}"`, 'info');
        }
    });

    // Open Settings Dialog
    document.getElementById('settingsBtn').addEventListener('click', () => {
        settingsDialog.showModal();
    });

    // Target Selection
    document.querySelectorAll('.target-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.target-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.target = parseInt(btn.dataset.target, 10);
            localStorage.setItem('pce_target_goal', state.target);
            renderDashboard();
            showToast(`Target updated to ${state.target}%`, 'info');
        });
    });

    // Reset records
    document.getElementById('resetStudentDataBtn').addEventListener('click', () => {
        if (confirm("Reset all attendance records for this student to zero?")) {
            state.subjects = DEFAULT_SUBJECTS.map(s => ({ ...s, history: [] }));
            saveUserData();
            renderDashboard();
            settingsDialog.close();
            showToast("Reset records to default", "info");
        }
    });

    // Export JSON
    document.getElementById('exportDataBtn').addEventListener('click', () => {
        if (!state.user) return;
        const payload = {
            version: "3.2",
            student: state.user,
            target: state.target,
            exportDate: new Date().toISOString(),
            subjects: state.subjects
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PCE_Attendance_${state.user.roll}_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("Exported backup file", "success");
    });

    // Import JSON
    document.getElementById('importFileInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const imported = JSON.parse(evt.target.result);
                if (imported && Array.isArray(imported.subjects)) {
                    state.subjects = imported.subjects.map(s => ({
                        id: s.id || Date.now() + Math.random(),
                        name: s.name || "Subject",
                        present: Number(s.present) || 0,
                        total: Number(s.total) || 0,
                        history: Array.isArray(s.history) ? s.history : []
                    }));
                    if (imported.target) {
                        state.target = imported.target;
                        localStorage.setItem('pce_target_goal', state.target);
                        document.querySelectorAll('.target-btn').forEach(btn => {
                            btn.classList.toggle('active', parseInt(btn.dataset.target, 10) === state.target);
                        });
                    }
                    saveUserData();
                    renderDashboard();
                    settingsDialog.close();
                    showToast("Data restored successfully", "success");
                }
            } catch (err) {
                console.error(err);
                showToast("Failed to parse backup JSON", "error");
            }
        };
        reader.readAsText(file);
    });
}

// Edit subject helper invoked from card
window.openEditSubject = function(id) {
    const s = state.subjects.find(sub => sub.id === id);
    if (!s) return;
    document.getElementById('dialogTitle').textContent = 'Edit class';
    document.getElementById('dialogSubjectId').value = s.id;
    document.getElementById('dialogSubjectName').value = s.name;
    document.getElementById('dialogDeleteBtn').classList.remove('hidden');
    const dialog = document.getElementById('subjectDialog');
    dialog.showModal();
    document.getElementById('dialogSubjectName').focus();
};

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
