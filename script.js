/**
 * CURELEX - Healthcare Platform JavaScript
 * Handles authentication, theme toggling, modals, and dashboard
 */

// =============================================
// DOM Elements
// =============================================
const navbar = document.getElementById('navbar');
const themeToggle = document.getElementById('themeToggle');
const loginBtn = document.getElementById('loginBtn');
const loginBtnMobile = document.getElementById('loginBtnMobile');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const loginModal = document.getElementById('loginModal');
const loginModalClose = document.getElementById('loginModalClose');
const patientSignUpModal = document.getElementById('patientSignUpModal');
const patientSignUpModalClose = document.getElementById('patientSignUpModalClose');
const doctorSignUpModal = document.getElementById('doctorSignUpModal');
const doctorSignUpModalClose = document.getElementById('doctorSignUpModalClose');
const patientDashboard = document.getElementById('patientDashboard');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// =============================================
// Theme Toggle
// =============================================
function initTheme() {
    const savedTheme = localStorage.getItem('curelex-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('curelex-theme', newTheme);
    updateThemeIcon(newTheme);
}

themeToggle.addEventListener('click', toggleTheme);

// =============================================
// Navbar Scroll Effect
// =============================================
function handleScroll() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

window.addEventListener('scroll', handleScroll);

// =============================================
// Mobile Menu
// =============================================
function toggleMobileMenu() {
    mobileMenu.classList.toggle('active');
}

function closeMobileMenu() {
    mobileMenu.classList.remove('active');
}

mobileMenuBtn.addEventListener('click', toggleMobileMenu);
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

// =============================================
// Modal Management
// =============================================
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        closeModal(modal);
    });
}

// Login Modal
loginBtn.addEventListener('click', () => openModal(loginModal));
loginBtnMobile.addEventListener('click', () => {
    closeMobileMenu();
    openModal(loginModal);
});
loginModalClose.addEventListener('click', () => closeModal(loginModal));
loginModal.querySelector('.modal-overlay').addEventListener('click', closeAllModals);

// Patient Sign Up Modal
document.getElementById('patientSignUpLink').addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(loginModal);
    openModal(patientSignUpModal);
});

document.getElementById('patientSignInLink').addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(patientSignUpModal);
    openModal(loginModal);
});

patientSignUpModalClose.addEventListener('click', () => closeModal(patientSignUpModal));
patientSignUpModal.querySelector('.modal-overlay').addEventListener('click', closeAllModals);

// Doctor Sign Up Modal
document.getElementById('doctorSignUpLink').addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(loginModal);
    openModal(doctorSignUpModal);
});

doctorSignUpModalClose.addEventListener('click', () => closeModal(doctorSignUpModal));
doctorSignUpModal.querySelector('.modal-overlay').addEventListener('click', closeAllModals);

// Auth Tabs
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        
        // Update tab active state
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update form active state
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
    });
});

// =============================================
// Toast Notifications
// =============================================
function showToast(message, type = 'info') {
    toastMessage.textContent = message;
    toast.classList.add('active');
    
    // Update toast color based on type
    const icon = toast.querySelector('.toast-content i');
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
        icon.style.color = '#22c55e';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
        icon.style.color = '#dc2626';
    } else {
        icon.className = 'fas fa-bell';
        icon.style.color = '#00a8e8';
    }
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 4000);
}

// =============================================
// Local Storage Helpers
// =============================================
function getStoredUsers(type) {
    const users = localStorage.getItem(`curelex-${type}-users`);
    return users ? JSON.parse(users) : [];
}

function saveUser(type, userData) {
    const users = getStoredUsers(type);
    users.push(userData);
    localStorage.setItem(`curelex-${type}-users`, JSON.stringify(users));
}

function findUser(type, email, password) {
    const users = getStoredUsers(type);
    return users.find(u => u.email === email && u.password === password);
}

// =============================================
// Patient Authentication
// =============================================
const patientLoginForm = document.getElementById('patientLoginForm');
const patientSignUpForm = document.getElementById('patientSignUpForm');

patientLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('patientEmail').value;
    const password = document.getElementById('patientPassword').value;
    
    // Get all registered patients
    const patients = getStoredUsers('patient');
    
    // Find user by email only (any password is accepted)
    const user = patients.find(u => u.email === email);
    
    if (user) {
        // Store current session
        localStorage.setItem('curelex-current-user', JSON.stringify(user));
        closeAllModals();
        showToast(`Welcome back, ${user.fullName}!`, 'success');
        // Redirect to patient dashboard
        setTimeout(() => {
            window.location.href = 'patient-dashboard.html';
        }, 500);
    } else {
        // Create a new user session with entered email (auto-register)
        const newUser = {
            id: Date.now(),
            fullName: email.split('@')[0],
            email: email,
            password: password,
            createdAt: new Date().toISOString()
        };
        
        // Save as new patient
        saveUser('patient', newUser);
        localStorage.setItem('curelex-current-user', JSON.stringify(newUser));
        closeAllModals();
        showToast(`Welcome, ${newUser.fullName}!`, 'success');
        // Redirect to patient dashboard
        setTimeout(() => {
            window.location.href = 'patient-dashboard.html';
        }, 500);
    }
});

patientSignUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('patientFullName').value;
    const age = document.getElementById('patientAge').value;
    const gender = document.getElementById('patientGender').value;
    const mobile = document.getElementById('patientMobile').value;
    const email = document.getElementById('patientEmailSignup').value;
    const address = document.getElementById('patientAddress').value;
    const emergency = document.getElementById('patientEmergency').value;
    const aadhaar = document.getElementById('patientAadhaar').value;
    const password = document.getElementById('patientCreatePassword').value;
    const confirmPassword = document.getElementById('patientConfirmPassword').value;
    
    // Validation
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    if (aadhaar.length !== 12) {
        showToast('Please enter a valid 12-digit Aadhaar number', 'error');
        return;
    }
    
    // Check if user already exists
    const existingUser = findUser('patient', email, password);
    if (existingUser) {
        showToast('An account with this email already exists', 'error');
        return;
    }
    
    // Save new user
    const newUser = {
        id: Date.now(),
        fullName,
        age,
        gender,
        mobile,
        email,
        address,
        emergency,
        aadhaar,
        password,
        createdAt: new Date().toISOString()
    };
    
    saveUser('patient', newUser);
    
    // Auto-login after signup
    localStorage.setItem('curelex-current-user', JSON.stringify(newUser));
    closeAllModals();
    showToast('Registration successful! Welcome to CURELEX!', 'success');
    // Redirect to patient dashboard
    setTimeout(() => {
        window.location.href = 'patient-dashboard.html';
    }, 500);
});

// =============================================
// Doctor Authentication
// =============================================
const doctorLoginForm = document.getElementById('doctorLoginForm');
const doctorSignUpForm = document.getElementById('doctorSignUpForm');

doctorLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('doctorEmail').value;
    const password = document.getElementById('doctorPassword').value;
    
    // Get all registered doctors
    const doctors = getStoredUsers('doctor');
    
    // Find user by email only (any password is accepted)
    const user = doctors.find(u => u.email === email);
    
    if (user) {
        // Allow login without admin approval
        localStorage.setItem('curelex-current-user', JSON.stringify(user));
        closeAllModals();
        showToast(`Welcome back, Dr. ${user.fullName}!`, 'success');
        // Redirect to doctor dashboard
        setTimeout(() => {
            window.location.href = 'doctor-dashboard.html';
        }, 500);
    } else {
        // Create a new doctor session with entered email (auto-register with random password)
        const newDoctor = {
            id: Date.now(),
            fullName: email.split('@')[0],
            email: email,
            password: password,
            specialization: 'general',
            approved: true,
            createdAt: new Date().toISOString()
        };
        
        // Save as new doctor
        saveUser('doctor', newDoctor);
        localStorage.setItem('curelex-current-user', JSON.stringify(newDoctor));
        closeAllModals();
        showToast(`Welcome, Dr. ${newDoctor.fullName}!`, 'success');
        // Redirect to doctor dashboard
        setTimeout(() => {
            window.location.href = 'doctor-dashboard.html';
        }, 500);
    }
});

doctorSignUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('doctorFullName').value;
    const age = document.getElementById('doctorAge').value;
    const gender = document.getElementById('doctorGender').value;
    const specialization = document.getElementById('doctorSpecialization').value;
    const regNumber = document.getElementById('doctorRegNumber').value;
    const regState = document.getElementById('doctorRegState').value;
    const hospital = document.getElementById('doctorHospital').value;
    const experience = document.getElementById('doctorExperience').value;
    const patients = document.getElementById('doctorPatients').value;
    const password = document.getElementById('doctorPassword').value;
    
    // Check if user already exists
    const doctors = getStoredUsers('doctor');
    const existingDoctor = doctors.find(d => d.email === regNumber);
    if (existingDoctor) {
        showToast('A doctor with this registration number already exists', 'error');
        return;
    }
    
    // Save new doctor (pending approval)
    const newDoctor = {
        id: Date.now(),
        fullName,
        age,
        gender,
        specialization,
        regNumber,
        regState,
        hospital,
        experience,
        patients,
        password,
        approved: false,
        createdAt: new Date().toISOString()
    };
    
    saveUser('doctor', newDoctor);
    closeAllModals();
    showToast('Registration submitted! Your account is pending admin approval.', 'success');
});

// =============================================
// Dashboard Functions
// =============================================
function showPatientDashboard(user) {
    // Hide homepage sections
    document.querySelector('.hero').style.display = 'none';
    document.querySelector('.about').style.display = 'none';
    document.querySelector('.services').style.display = 'none';
    document.querySelector('.contact').style.display = 'none';
    document.querySelector('.footer').style.display = 'none';
    document.querySelector('.navbar').style.display = 'none';
    
    // Show dashboard
    patientDashboard.classList.add('active');
    
    // Update greeting
    document.getElementById('patientGreeting').textContent = `Hello, ${user.fullName}`;
}

function hidePatientDashboard() {
    // Show homepage sections
    document.querySelector('.hero').style.display = 'flex';
    document.querySelector('.about').style.display = 'block';
    document.querySelector('.services').style.display = 'block';
    document.querySelector('.contact').style.display = 'block';
    document.querySelector('.footer').style.display = 'block';
    document.querySelector('.navbar').style.display = 'flex';
    
    // Hide dashboard
    patientDashboard.classList.remove('active');
    
    // Clear session
    localStorage.removeItem('curelex-current-user');
}

// Logout
document.getElementById('patientLogoutBtn').addEventListener('click', () => {
    hidePatientDashboard();
    showToast('Logged out successfully', 'success');
});

// Check for existing session - redirect to appropriate dashboard
function checkExistingSession() {
    const currentUser = localStorage.getItem('curelex-current-user');
    if (currentUser) {
        // Redirect to appropriate dashboard based on user type
        const user = JSON.parse(currentUser);
        // Check if user has specialization (doctor) or not (patient)
        if (user.specialization) {
            window.location.href = 'doctor-dashboard.html';
        } else {
            window.location.href = 'patient-dashboard.html';
        }
    }
}

// =============================================
// Hero Section Button Actions
// =============================================
document.getElementById('getStartedBtn').addEventListener('click', () => {
    openModal(loginModal);
});

document.getElementById('learnMoreBtn').addEventListener('click', () => {
    document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
});

// =============================================
// Smooth Scroll for Navigation
// =============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// =============================================
// Initialize App
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    checkExistingSession();
    
    // Add some sample data for demo purposes
    addSampleData();
});

// Sample data for demonstration
function addSampleData() {
    // Check if sample data already exists
    if (getStoredUsers('patient').length === 0) {
        // Add sample patient
        const samplePatient = {
            id: 1,
            fullName: 'John Doe',
            age: 35,
            gender: 'male',
            mobile: '9876543210',
            email: 'patient@demo.com',
            address: '123 Main Street, Delhi',
            emergency: '9876543211',
            aadhaar: '123456789012',
            password: 'demo123',
            createdAt: new Date().toISOString()
        };
        saveUser('patient', samplePatient);
    }
    
    // Add sample doctor for testing
    if (getStoredUsers('doctor').length === 0) {
        const sampleDoctor = {
            id: 1,
            fullName: 'Sarah Johnson',
            age: 38,
            gender: 'female',
            specialization: 'general',
            regNumber: 'DELHI12345',
            regState: 'Delhi',
            hospital: 'City Hospital, Delhi',
            experience: 15,
            patients: 5000,
            password: 'doctor123',
            approved: true,
            createdAt: new Date().toISOString()
        };
        saveUser('doctor', sampleDoctor);
    }
}

// =============================================
// Add Symptom Button
// =============================================
document.getElementById('addSymptomBtn')?.addEventListener('click', () => {
    showToast('Symptom reporting feature coming soon!', 'info');
});

// =============================================
// Utility Functions
// =============================================
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

// Close modals on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAllModals();
    }
});

// Prevent form submission on enter for better UX
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
    });
});

//map API integration
function initMap() {
  const location = { lat: 25.4305, lng: 81.7710 }; // IIIT Allahabad

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: location,
  });

  new google.maps.Marker({
    position: location,
    map: map,
    title: "IIIT Allahabad Incubation Centre (IIIC)"
  });
}