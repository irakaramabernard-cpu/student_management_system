
// ============ Global Data & State Management ============

let currentUser = {
    username: '',
    role: ''
};

let students = JSON.parse(localStorage.getItem('students')) || [];
let teachers = JSON.parse(localStorage.getItem('teachers')) || [];
let attendance = JSON.parse(localStorage.getItem('attendance')) || [];
let results = JSON.parse(localStorage.getItem('results')) || [];
let fees = JSON.parse(localStorage.getItem('fees')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [
    { username: 'admin', password: '1234', role: 'admin' },
    { username: 'teacher', password: '1234', role: 'teacher' },
    { username: 'student', password: '1234', role: 'student' }
];

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;

        const user = users.find(u => u.username === username && u.password === password && u.role === role);

        if (user) {
            currentUser = { username: user.username, role: user.role };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            window.location.href = 'dashboard.html';
        } else {
            document.getElementById('message').innerText = 'Invalid credentials or role!';
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('dashboard')) {
        initializeDashboard();
    }
});

function initializeDashboard() {
    currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    
    if (!currentUser.username) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('userInfo').innerText = `${currentUser.username}\n(${currentUser.role})`;

    initializeRoleBasedAccess();
    setupMenuListeners();
    setupFormListeners();
    setupSearchListeners();
    setupThemeToggle();
    loadDashboardStats();
    displayStudents();
    displayTeachers();
    displayAttendance();
    displayResults();
    displayFees();
    displayRoles();

    showSection('dashboard');
}


function initializeRoleBasedAccess() {
    const teachersMenu = document.getElementById('teachersMenu');
    const adminMenu = document.getElementById('adminMenu');

    if (currentUser.role === 'student') {
        teachersMenu.style.display = 'none';
        adminMenu.style.display = 'none';
        document.getElementById('students').style.display = 'none';
    } else if (currentUser.role === 'teacher') {
        adminMenu.style.display = 'none';
    }
}

function setupMenuListeners() {
    document.querySelectorAll('.menu-item[data-section]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            showSection(section);
        });
    });
}

function showSection(sectionId) {
    
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
        
        const titles = {
            'dashboard': 'Dashboard',
            'students': 'Student Management',
            'teachers': 'Teacher Management',
            'attendance': 'Attendance',
            'results': 'Results',
            'fees': 'Fees Management',
            'admin': 'Admin Panel'
        };
        document.getElementById('pageTitle').innerText = titles[sectionId] || sectionId;
    }

    if (sectionId === 'dashboard') {
        setTimeout(() => {
            initializeCharts();
        }, 100);
    }
}


function loadDashboardStats() {
    document.getElementById('totalStudents').innerText = students.length;
    document.getElementById('totalTeachers').innerText = teachers.length;
    
    const totalAttendance = attendance.length;
    const presentCount = attendance.filter(a => a.status === 'Present').length;
    const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;
    document.getElementById('attendanceRate').innerText = attendanceRate + '%';
    

    const pendingFeesCount = fees.filter(f => f.status === 'Pending' || f.status === 'Overdue').length;
    document.getElementById('pendingFees').innerText = pendingFeesCount;
}

function initializeCharts() {
    const classCtx = document.getElementById('classChart');
    if (classCtx && classCtx.getContext) {
        const classList = [...new Set(students.map(s => s.class))];
        const classData = classList.map(c => students.filter(s => s.class === c).length);

        new Chart(classCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: classList,
                datasets: [{
                    data: classData,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }


    const attendanceCtx = document.getElementById('attendanceChart');
    if (attendanceCtx && attendanceCtx.getContext) {
        const dates = [...new Set(attendance.map(a => a.date))].sort().slice(-7);
        const presentTrend = dates.map(date => 
            attendance.filter(a => a.date === date && a.status === 'Present').length
        );

        new Chart(attendanceCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Present',
                    data: presentTrend,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }
}



function toggleStudentForm() {
    const form = document.getElementById('studentForm');
    form.classList.toggle('form-hidden');
}

function setupFormListeners() {
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
        studentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const student = {
                id: Date.now(),
                name: document.getElementById('studentName').value,
                age: document.getElementById('studentAge').value,
                class: document.getElementById('studentClass').value,
                roll: document.getElementById('studentRoll').value,
                email: document.getElementById('studentEmail').value,
                phone: document.getElementById('studentPhone').value,
                photo: document.getElementById('studentPhoto').value
            };

            if (!student.name || !student.age || !student.class || !student.roll) {
                alert('Please fill all required fields');
                return;
            }

            students.push(student);
            localStorage.setItem('students', JSON.stringify(students));
            studentForm.reset();
            toggleStudentForm();
            displayStudents();
            loadDashboardStats();
        });
    }
    const teacherForm = document.getElementById('teacherForm');
    if (teacherForm) {
        teacherForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const teacher = {
                id: Date.now(),
                name: document.getElementById('teacherName').value,
                subject: document.getElementById('teacherSubject').value,
                email: document.getElementById('teacherEmail').value,
                phone: document.getElementById('teacherPhone').value,
                class: document.getElementById('teacherClass').value,
                experience: document.getElementById('teacherExperience').value
            };

            if (!teacher.name || !teacher.subject || !teacher.email || !teacher.phone) {
                alert('Please fill all required fields');
                return;
            }

            teachers.push(teacher);
            localStorage.setItem('teachers', JSON.stringify(teachers));
            teacherForm.reset();
            toggleTeacherForm();
            displayTeachers();
            loadDashboardStats();
        });
    }

    const attendanceForm = document.getElementById('attendanceForm');
    if (attendanceForm) {
        attendanceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const date = document.getElementById('attendanceDate').value;
            const selectedClass = document.getElementById('attendanceClass').value;
            const checkboxes = document.querySelectorAll('#studentCheckboxes input[type="checkbox"]:checked');

            checkboxes.forEach(checkbox => {
                const attendanceRecord = {
                    id: Date.now() + Math.random(),
                    studentId: checkbox.dataset.studentId,
                    studentName: checkbox.dataset.studentName,
                    date: date,
                    class: selectedClass,
                    status: 'Present'
                };
                attendance.push(attendanceRecord);
            });

            localStorage.setItem('attendance', JSON.stringify(attendance));
            attendanceForm.reset();
            toggleAttendanceForm();
            displayAttendance();
            loadDashboardStats();
        });
    }

    const resultForm = document.getElementById('resultForm');
    if (resultForm) {
        resultForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const marks = parseFloat(document.getElementById('resultMarks').value);
            const total = parseFloat(document.getElementById('resultTotal').value);
            const percentage = (marks / total * 100).toFixed(2);

            const result = {
                id: Date.now(),
                student: document.getElementById('resultStudent').value,
                subject: document.getElementById('resultSubject').value,
                marks: marks,
                total: total,
                percentage: percentage,
                examType: document.getElementById('resultExamType').value,
                date: document.getElementById('resultDate').value
            };

            if (!result.student || !result.subject || !result.marks || !result.examType) {
                alert('Please fill all required fields');
                return;
            }

            results.push(result);
            localStorage.setItem('results', JSON.stringify(results));
            resultForm.reset();
            toggleResultForm();
            displayResults();
        });
    }

    const feeForm = document.getElementById('feeForm');
    if (feeForm) {
        feeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fee = {
                id: Date.now(),
                student: document.getElementById('feeStudent').value,
                type: document.getElementById('feeType').value,
                amount: document.getElementById('feeAmount').value,
                dueDate: document.getElementById('feeDueDate').value,
                status: document.getElementById('feeStatus').value
            };

            if (!fee.student || !fee.type || !fee.amount || !fee.dueDate) {
                alert('Please fill all required fields');
                return;
            }

            fees.push(fee);
            localStorage.setItem('fees', JSON.stringify(fees));
            feeForm.reset();
            toggleFeeForm();
            displayFees();
            loadDashboardStats();
        });
    }

    const roleForm = document.getElementById('roleForm');
    if (roleForm) {
        roleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('roleName').value;
            const role = document.getElementById('roleSelect').value;
            const password = document.getElementById('rolePassword').value;

            if (!username || !role || !password) {
                alert('Please fill all fields');
                return;
            }

            const userIndex = users.findIndex(u => u.username === username);
            if (userIndex > -1) {
                users[userIndex].role = role;
                users[userIndex].password = password;
            } else {
                users.push({ username: username, password: password, role: role });
            }

            localStorage.setItem('users', JSON.stringify(users));
            roleForm.reset();
            toggleRoleForm();
            displayRoles();
            alert('User access updated successfully! (Password is hidden for security)');
        });
    }
}


function displayStudents(searchTerm = '') {
    const table = document.getElementById('studentTable');
    if (!table) return;

    table.innerHTML = '';
    const filtered = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.class.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.forEach((student, index) => {
        table.innerHTML += `
            <tr>
                <td><img src="${student.photo || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22%3E%3Crect width=%2240%22 height=%2240%22 fill=%22%23ccc%22/%3E%3C/svg%3E'}" class="student-photo" alt="Photo"></td>
                <td>${student.name}</td>
                <td>${student.class}</td>
                <td>${student.roll}</td>
                <td>${student.email || '-'}</td>
                <td>
                    <button class="btn-small btn-danger" onclick="deleteStudent(${student.id})">Delete</button>
                </td>
            </tr>
        `;
    });
}

function displayTeachers(searchTerm = '') {
    const table = document.getElementById('teacherTable');
    if (!table) return;

    table.innerHTML = '';
    const filtered = teachers.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.forEach(teacher => {
        table.innerHTML += `
            <tr>
                <td>${teacher.name}</td>
                <td>${teacher.subject}</td>
                <td>${teacher.email}</td>
                <td>${teacher.phone}</td>
                <td>${teacher.class || '-'}</td>
                <td>${teacher.experience || '-'}</td>
                <td>
                    <button class="btn-small btn-danger" onclick="deleteTeacher(${teacher.id})">Delete</button>
                </td>
            </tr>
        `;
    });
}

function displayAttendance(searchTerm = '') {
    const table = document.getElementById('attendanceTable');
    if (!table) return;

    table.innerHTML = '';
    const filtered = attendance.filter(a => 
        a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.date.includes(searchTerm)
    );

    filtered.forEach(record => {
        table.innerHTML += `
            <tr>
                <td>${record.studentName}</td>
                <td>${record.date}</td>
                <td><span class="status-${record.status.toLowerCase()}">${record.status}</span></td>
                <td>${record.class}</td>
                <td>
                    <button class="btn-small btn-danger" onclick="deleteAttendance(${record.id})">Delete</button>
                </td>
            </tr>
        `;
    });
}

function displayResults(searchTerm = '') {
    const table = document.getElementById('resultsTable');
    if (!table) return;

    table.innerHTML = '';
    const filtered = results.filter(r => 
        r.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.forEach(result => {
        table.innerHTML += `
            <tr>
                <td>${result.student}</td>
                <td>${result.subject}</td>
                <td>${result.marks}/${result.total}</td>
                <td>${result.percentage}%</td>
                <td>${result.examType}</td>
                <td>${result.date}</td>
                <td>
                    <button class="btn-small btn-danger" onclick="deleteResult(${result.id})">Delete</button>
                </td>
            </tr>
        `;
    });
}

function displayFees(searchTerm = '') {
    const table = document.getElementById('feeTable');
    if (!table) return;

    table.innerHTML = '';
    const filtered = fees.filter(f => 
        f.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.forEach(fee => {
        table.innerHTML += `
            <tr>
                <td>${fee.student}</td>
                <td>${fee.type}</td>
                <td>₹${fee.amount}</td>
                <td>${fee.dueDate}</td>
                <td><span class="status-${fee.status.toLowerCase()}">${fee.status}</span></td>
                <td>
                    <button class="btn-small btn-danger" onclick="deleteFee(${fee.id})">Delete</button>
                </td>
            </tr>
        `;
    });
}

function displayRoles() {
    const table = document.getElementById('roleTable');
    if (!table) return;

    table.innerHTML = '';
    users.forEach(user => {
        table.innerHTML += `
            <tr>
                <td>${user.username}</td>
                <td><span class="role-badge role-${user.role}">${user.role}</span></td>
                <td>
                    <button class="btn-small btn-danger" onclick="deleteRole('${user.username}')">Remove</button>
                </td>
            </tr>
        `;
    });
}


function setupSearchListeners() {
    const studentSearch = document.getElementById('studentSearch');
    if (studentSearch) {
        studentSearch.addEventListener('keyup', (e) => {
            displayStudents(e.target.value);
        });
    }

    const teacherSearch = document.getElementById('teacherSearch');
    if (teacherSearch) {
        teacherSearch.addEventListener('keyup', (e) => {
            displayTeachers(e.target.value);
        });
    }

    const attendanceSearch = document.getElementById('attendanceSearch');
    if (attendanceSearch) {
        attendanceSearch.addEventListener('keyup', (e) => {
            displayAttendance(e.target.value);
        });
    }

    const resultSearch = document.getElementById('resultSearch');
    if (resultSearch) {
        resultSearch.addEventListener('keyup', (e) => {
            displayResults(e.target.value);
        });
    }

    const feeSearch = document.getElementById('feeSearch');
    if (feeSearch) {
        feeSearch.addEventListener('keyup', (e) => {
            displayFees(e.target.value);
        });
    }
}


function deleteStudent(id) {
    if (confirm('Are you sure?')) {
        students = students.filter(s => s.id !== id);
        localStorage.setItem('students', JSON.stringify(students));
        displayStudents();
        loadDashboardStats();
    }
}

function deleteTeacher(id) {
    if (confirm('Are you sure?')) {
        teachers = teachers.filter(t => t.id !== id);
        localStorage.setItem('teachers', JSON.stringify(teachers));
        displayTeachers();
        loadDashboardStats();
    }
}

function deleteAttendance(id) {
    if (confirm('Are you sure?')) {
        attendance = attendance.filter(a => a.id !== id);
        localStorage.setItem('attendance', JSON.stringify(attendance));
        displayAttendance();
        loadDashboardStats();
    }
}

function deleteResult(id) {
    if (confirm('Are you sure?')) {
        results = results.filter(r => r.id !== id);
        localStorage.setItem('results', JSON.stringify(results));
        displayResults();
    }
}

function deleteFee(id) {
    if (confirm('Are you sure?')) {
        fees = fees.filter(f => f.id !== id);
        localStorage.setItem('fees', JSON.stringify(fees));
        displayFees();
        loadDashboardStats();
    }
}

function deleteRole(username) {
    if (confirm('Are you sure?')) {
        users = users.filter(u => u.username !== username);
        localStorage.setItem('users', JSON.stringify(users));
        displayRoles();
    }
}


function toggleTeacherForm() {
    document.getElementById('teacherForm').classList.toggle('form-hidden');
}

function toggleAttendanceForm() {
    const form = document.getElementById('attendanceForm');
    form.classList.toggle('form-hidden');
    
    if (!form.classList.contains('form-hidden')) {
        const classInput = document.getElementById('attendanceClass');
        classInput.addEventListener('change', function() {
            const selectedClass = this.value;
            const classStudents = students.filter(s => s.class === selectedClass);
            const checkboxContainer = document.getElementById('studentCheckboxes');
            checkboxContainer.innerHTML = '<label>Select Students:</label>';
            
            classStudents.forEach(student => {
                checkboxContainer.innerHTML += `
                    <div class="checkbox-item">
                        <input type="checkbox" data-student-id="${student.id}" data-student-name="${student.name}" id="student_${student.id}">
                        <label for="student_${student.id}">${student.name}</label>
                    </div>
                `;
            });
        });
    }
}

function toggleResultForm() {
    document.getElementById('resultForm').classList.toggle('form-hidden');
}

function toggleFeeForm() {
    document.getElementById('feeForm').classList.toggle('form-hidden');
}

function toggleRoleForm() {
    document.getElementById('roleForm').classList.toggle('form-hidden');
}


function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const isDark = localStorage.getItem('darkMode') === 'true';
    
    if (isDark) {
        document.body.classList.add('dark-mode');
    }

    themeToggle.addEventListener('click', function(e) {
        e.preventDefault();
        document.body.classList.toggle('dark-mode');
        const isDarkNow = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkNow);
    });
}

function exportDashboard() {
    const element = document.querySelector('.main-content');
    const opt = {
        margin: 10,
        filename: 'SMS_Report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    
    html2pdf().set(opt).from(element).save();
}

function backupData() {
    const backup = {
        students: students,
        teachers: teachers,
        attendance: attendance,
        results: results,
        fees: fees,
        users: users,
        timestamp: new Date().toLocaleString()
    };

    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SMS_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    alert('Backup created successfully!');
}

function viewActivityLog() {
    alert('Activity Log:\n\n- System initialized\n- Multiple users logged in\n- Data records created/modified\n\nDetailed logs coming soon!');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}