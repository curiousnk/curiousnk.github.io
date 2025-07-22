// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});

// Main Application Initialization
function initApp() {
    // Check authentication status
    checkAuthStatus();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize forms
    initForms();
    
    // Initialize modals
    initModals();
    
    // Initialize password strength checker
    initPasswordStrength();
    
    // Initialize password visibility toggles
    initPasswordToggles();
    
    // Initialize cart functionality
    initCart();
}

// Authentication Functions
function checkAuthStatus() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const currentUser = sessionStorage.getItem('currentUser');
    
    const loginNavItem = document.getElementById('login-nav-item');
    const logoutNavItem = document.getElementById('logout-nav-item');
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');
    
    if (isLoggedIn === 'true' && currentUser) {
        // User is logged in
        if (loginNavItem) loginNavItem.style.display = 'none';
        if (logoutNavItem) logoutNavItem.style.display = 'block';
        
        // Update navigation to show user info
        if (logoutLink) {
            logoutLink.textContent = `Logout (${JSON.parse(currentUser).firstName})`;
        }
    } else {
        // User is not logged in
        if (loginNavItem) loginNavItem.style.display = 'block';
        if (logoutNavItem) logoutNavItem.style.display = 'none';
    }
}

function loginUser(email, password) {
    const users = JSON.parse(sessionStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        checkAuthStatus();
        return { success: true, message: 'Login successful!' };
    } else {
        return { success: false, message: 'Invalid email or password.' };
    }
}

function logoutUser() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('currentUser');
    checkAuthStatus();
    showNotification('Logged out successfully!', 'success');
}

function registerUser(userData) {
    const users = JSON.parse(sessionStorage.getItem('users') || '[]');
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
        return { success: false, message: 'User with this email already exists.' };
    }
    
    // Add new user
    users.push(userData);
    sessionStorage.setItem('users', JSON.stringify(users));
    
    return { success: true, message: 'Registration successful! You can now login.' };
}

// Navigation Functions
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
    
    // Initialize logout functionality
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logoutUser();
        });
    }
}

// Form Functions
function initForms() {
    // Registration Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
    
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContact);
    }
    
    // Show login link on registration page
    const showLoginLink = document.getElementById('showLoginLink');
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginModal();
        });
    }
}

function handleRegistration(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const userData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        terms: formData.get('terms'),
        newsletter: formData.get('newsletter')
    };
    
    // Validate form
    const validation = validateRegistrationForm(userData);
    if (!validation.isValid) {
        showNotification(validation.message, 'error');
        return;
    }
    
    // Register user
    const result = registerUser(userData);
    if (result.success) {
        showNotification(result.message, 'success');
        e.target.reset();
        clearErrorMessages();
        // Auto-login after successful registration
        setTimeout(() => {
            const loginResult = loginUser(userData.email, userData.password);
            if (loginResult.success) {
                showNotification('Auto-login successful!', 'success');
            }
        }, 1000);
    } else {
        showNotification(result.message, 'error');
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Please fill in all fields.', 'error');
        return;
    }
    
    const result = loginUser(email, password);
    if (result.success) {
        showNotification(result.message, 'success');
        closeModal('loginModal');
        document.getElementById('loginForm').reset();
    } else {
        showNotification(result.message, 'error');
    }
}

function handleContact(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const contactData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };
    
    // Validate contact form
    if (!contactData.firstName || !contactData.lastName || !contactData.email || !contactData.subject || !contactData.message) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    // Simulate form submission
    showNotification('Thank you for your message! We will get back to you soon.', 'success');
    e.target.reset();
}

// Form Validation
function validateRegistrationForm(userData) {
    // Check required fields
    if (!userData.firstName || !userData.lastName || !userData.email || !userData.phone || !userData.password) {
        return { isValid: false, message: 'Please fill in all required fields.' };
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
        return { isValid: false, message: 'Please enter a valid email address.' };
    }
    
    // Validate phone format
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(userData.phone.replace(/\s/g, ''))) {
        return { isValid: false, message: 'Please enter a valid phone number.' };
    }
    
    // Validate password length
    if (userData.password.length < 6) {
        return { isValid: false, message: 'Password must be at least 6 characters long.' };
    }
    
    // Check password confirmation
    if (userData.password !== userData.confirmPassword) {
        return { isValid: false, message: 'Passwords do not match.' };
    }
    
    // Check terms acceptance
    if (!userData.terms) {
        return { isValid: false, message: 'Please accept the terms and conditions.' };
    }
    
    return { isValid: true, message: 'Form is valid.' };
}

// Modal Functions
function initModals() {
    const loginLink = document.getElementById('login-link');
    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginModal();
        });
    }
    
    // Close modal when clicking on X
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Close modal when clicking outside
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal[style*="display: block"]');
            if (openModal) {
                closeModal(openModal.id);
            }
        }
    });
}

function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'block';
        document.getElementById('loginEmail').focus();
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Password Strength Functions
function initPasswordStrength() {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', checkPasswordStrength);
    }
}

function checkPasswordStrength() {
    const password = document.getElementById('password').value;
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthFill || !strengthText) return;
    
    let strength = 0;
    let feedback = '';
    
    // Check length
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Check for different character types
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // Update strength bar and text
    strengthFill.className = 'strength-fill';
    
    if (strength <= 2) {
        strengthFill.classList.add('weak');
        feedback = 'Weak password';
    } else if (strength <= 4) {
        strengthFill.classList.add('medium');
        feedback = 'Medium strength password';
    } else {
        strengthFill.classList.add('strong');
        feedback = 'Strong password';
    }
    
    strengthText.textContent = feedback;
}

// Password Visibility Toggle
function initPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    });
}

// Cart Functions
function initCart() {
    updateCartCount();
    loadCartItems();
    
    // Initialize checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
}

function updateCartCount() {
    const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

function loadCartItems() {
    const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartDiv = document.getElementById('empty-cart');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.style.display = 'none';
        if (emptyCartDiv) emptyCartDiv.style.display = 'block';
        if (checkoutBtn) checkoutBtn.disabled = true;
        updateOrderSummary();
        return;
    }
    
    cartItemsContainer.style.display = 'block';
    if (emptyCartDiv) emptyCartDiv.style.display = 'none';
    if (checkoutBtn) checkoutBtn.disabled = false;
    
    cartItemsContainer.innerHTML = '';
    
    cart.forEach((item, index) => {
        const cartItem = createCartItemElement(item, index);
        cartItemsContainer.appendChild(cartItem);
    });
    
    updateOrderSummary();
}

function createCartItemElement(item, index) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.dataset.index = index;
    
    // Extract price as number
    const price = parseFloat(item.price.replace('$', ''));
    const total = price * item.quantity;
    
    cartItem.innerHTML = `
        <img src="${getProductImage(item.name)}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-details">
            <h3>${item.name}</h3>
            <p class="cart-item-price">${item.price}</p>
        </div>
        <div class="cart-item-quantity">
            <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
        </div>
        <div class="cart-item-total">$${total.toFixed(2)}</div>
        <button class="remove-item" onclick="removeFromCart(${index})">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    return cartItem;
}

function getProductImage(productName) {
    // Map product names to images
    const productImages = {
        'Wireless Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        'Smart Watch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2099&q=80',
        'Running Shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        'Gaming Laptop': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2126&q=80',
        'Wireless Earbuds': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        'Fitness Tracker': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2099&q=80',
        'Sports Bag': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        'Gaming Mouse': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2126&q=80'
    };
    
    return productImages[productName] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
}

function updateQuantity(index, change) {
    const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
    
    if (cart[index]) {
        cart[index].quantity += change;
        
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        
        sessionStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        loadCartItems();
    }
}

function removeFromCart(index) {
    const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
    
    if (cart[index]) {
        const removedItem = cart[index];
        cart.splice(index, 1);
        sessionStorage.setItem('cart', JSON.stringify(cart));
        
        updateCartCount();
        loadCartItems();
        showNotification(`${removedItem.name} removed from cart`, 'success');
    }
}

function updateOrderSummary() {
    const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
    
    let subtotal = 0;
    cart.forEach(item => {
        const price = parseFloat(item.price.replace('$', ''));
        subtotal += price * item.quantity;
    });
    
    const shipping = subtotal > 50 ? 0 : 9.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    
    // Update summary elements
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

function handleCheckout() {
    const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
    
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    // Calculate total
    let subtotal = 0;
    cart.forEach(item => {
        const price = parseFloat(item.price.replace('$', ''));
        subtotal += price * item.quantity;
    });
    
    const shipping = subtotal > 50 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    
    // Generate order ID
    const orderId = 'ORD-' + Date.now().toString().slice(-8);
    
    // Update modal content
    const orderIdEl = document.getElementById('order-id');
    const orderTotalEl = document.getElementById('order-total');
    
    if (orderIdEl) orderIdEl.textContent = orderId;
    if (orderTotalEl) orderTotalEl.textContent = `$${total.toFixed(2)}`;
    
    // Show checkout modal
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.style.display = 'block';
    }
    
    // Clear cart after successful checkout
    sessionStorage.removeItem('cart');
    updateCartCount();
    loadCartItems();
    
    showNotification('Order placed successfully!', 'success');
}

// Product Cart Functionality (Basic)
function addToCart(productName, price) {
    const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1
        });
    }
    
    sessionStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${productName} added to cart!`, 'success');
}

// Initialize Add to Cart buttons
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-primary') && e.target.textContent === 'Add to Cart') {
        const productCard = e.target.closest('.product-card');
        if (productCard) {
            const productName = productCard.querySelector('h3').textContent;
            const price = productCard.querySelector('.price').textContent;
            addToCart(productName, price);
        }
    }
});

// Utility Functions
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#48dbfb' : type === 'error' ? '#ff6b6b' : '#667eea'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add close functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        notification.remove();
    });
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function clearErrorMessages() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => {
        error.textContent = '';
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation for forms
function showFormLoading(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }
}

function hideFormLoading(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = submitButton.getAttribute('data-original-text') || 'Submit';
    }
}

// Enhanced form submission with loading states
document.addEventListener('submit', function(e) {
    if (e.target.id === 'registerForm' || e.target.id === 'loginForm' || e.target.id === 'contactForm') {
        const submitButton = e.target.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.setAttribute('data-original-text', submitButton.textContent);
            showFormLoading(e.target);
            
            // Hide loading after a short delay (simulating processing)
            setTimeout(() => {
                hideFormLoading(e.target);
            }, 1000);
        }
    }
});

// Console welcome message
console.log(`
🚀 Welcome to AllShopee!
📧 Register with any email to test the authentication
🔐 Login functionality is session storage based
📱 Fully responsive design
🛒 Cart functionality with checkout
✨ Enjoy exploring the features!
`); 