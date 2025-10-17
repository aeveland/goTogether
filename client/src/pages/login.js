/**
 * Login Page Component
 * Handles user authentication (login and registration)
 */
import { AuthService } from '../utils/auth.js';
import config from '../config.js';

export class LoginPage {
    constructor(props = {}) {
        this.props = props;
        this.authService = new AuthService();
        this.isLoginMode = props.mode !== 'signup';
        this.isLoading = false;
        
        // Bind methods
        this.handleSubmit = this.handleSubmit.bind(this);
        this.toggleMode = this.toggleMode.bind(this);
        this.showError = this.showError.bind(this);
        this.clearError = this.clearError.bind(this);
    }

    /**
     * Render the login/signup page
     * @returns {HTMLElement} - The rendered page element
     */
    render() {
        const container = document.createElement('div');
        container.className = 'page-container';
        
        container.innerHTML = `
            <div class="form-container fade-in">
                <div class="text-center mb-4">
                    <h1 class="mdc-typography--headline4 page-title">
                        ${this.isLoginMode ? 'Welcome Back' : 'Join Go Together'}
                    </h1>
                    <p class="mdc-typography--body1 page-subtitle">
                        ${this.isLoginMode 
                            ? 'Sign in to plan your next adventure' 
                            : 'Create an account to start planning trips with friends'
                        }
                    </p>
                    ${config.API_BASE_URL === '/api/mock' ? `
                        <div class="mdc-card demo-banner" style="background-color: #e3f2fd; border-left: 4px solid #1976d2; margin-bottom: 16px;">
                            <div class="mdc-card__content">
                                <p class="mdc-typography--body2" style="color: #1976d2; margin: 0;">
                                    <strong>🎯 Demo Mode:</strong> Try logging in with <code>demo@example.com</code> / <code>Demo123</code>
                                </p>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- Error message container -->
                <div id="error-message" class="d-none mb-3">
                    <div class="mdc-card" style="background-color: #ffebee; border-left: 4px solid #f44336;">
                        <div class="mdc-card__content">
                            <p class="mdc-typography--body2" style="color: #c62828; margin: 0;" id="error-text"></p>
                        </div>
                    </div>
                </div>

                <!-- Login/Signup Form -->
                <form id="auth-form" class="slide-up">
                    ${!this.isLoginMode ? `
                        <div class="form-field">
                            <label class="mdc-text-field mdc-text-field--filled" style="width: 100%;">
                                <span class="mdc-text-field__ripple"></span>
                                <span class="mdc-floating-label" id="name-label">Full Name</span>
                                <input class="mdc-text-field__input" type="text" id="name" name="name" required>
                                <span class="mdc-line-ripple"></span>
                            </label>
                        </div>
                    ` : ''}

                    <div class="form-field">
                        <label class="mdc-text-field mdc-text-field--filled" style="width: 100%;">
                            <span class="mdc-text-field__ripple"></span>
                            <span class="mdc-floating-label" id="email-label">Email</span>
                            <input class="mdc-text-field__input" type="email" id="email" name="email" required>
                            <span class="mdc-line-ripple"></span>
                        </label>
                    </div>

                    <div class="form-field">
                        <label class="mdc-text-field mdc-text-field--filled" style="width: 100%;">
                            <span class="mdc-text-field__ripple"></span>
                            <span class="mdc-floating-label" id="password-label">Password</span>
                            <input class="mdc-text-field__input" type="password" id="password" name="password" required>
                            <span class="mdc-line-ripple"></span>
                        </label>
                        ${!this.isLoginMode ? `
                            <div class="mdc-text-field-helper-line">
                                <div class="mdc-text-field-helper-text" style="font-size: 0.75rem; color: #666; margin-top: 4px;">
                                    Must contain uppercase, lowercase, and number (e.g., "MyPass123")
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    ${!this.isLoginMode ? `
                        <div class="form-field">
                            <label class="mdc-text-field mdc-text-field--filled" style="width: 100%;">
                                <span class="mdc-text-field__ripple"></span>
                                <span class="mdc-floating-label" id="confirm-password-label">Confirm Password</span>
                                <input class="mdc-text-field__input" type="password" id="confirm-password" name="confirmPassword" required>
                                <span class="mdc-line-ripple"></span>
                            </label>
                        </div>
                    ` : ''}

                    <div class="form-actions center">
                        <button class="mdc-button mdc-button--raised" type="submit" id="submit-btn">
                            <span class="mdc-button__ripple"></span>
                            <span class="mdc-button__label">
                                ${this.isLoginMode ? 'Sign In' : 'Create Account'}
                            </span>
                        </button>
                    </div>
                </form>

                <!-- Mode toggle -->
                <div class="text-center mt-4">
                    <p class="mdc-typography--body2">
                        ${this.isLoginMode ? "Don't have an account?" : "Already have an account?"}
                        <button class="mdc-button" type="button" id="toggle-mode">
                            <span class="mdc-button__ripple"></span>
                            <span class="mdc-button__label">
                                ${this.isLoginMode ? 'Sign Up' : 'Sign In'}
                            </span>
                        </button>
                    </p>
                </div>

                ${this.isLoginMode ? `
                    <div class="text-center mt-3">
                        <button class="mdc-button" type="button" id="forgot-password">
                            <span class="mdc-button__ripple"></span>
                            <span class="mdc-button__label">Forgot Password?</span>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;

        // Add event listeners
        this.attachEventListeners(container);

        return container;
    }

    /**
     * Attach event listeners to form elements
     * @param {HTMLElement} container - The container element
     */
    attachEventListeners(container) {
        const form = container.querySelector('#auth-form');
        const toggleButton = container.querySelector('#toggle-mode');
        const forgotPasswordButton = container.querySelector('#forgot-password');

        // Initialize Material Design Web text fields
        this.initializeMDCTextFields(container);

        // Form submission
        form.addEventListener('submit', this.handleSubmit);

        // Mode toggle
        toggleButton.addEventListener('click', this.toggleMode);

        // Forgot password
        if (forgotPasswordButton) {
            forgotPasswordButton.addEventListener('click', this.handleForgotPassword.bind(this));
        }

        // Clear error on input
        const inputs = container.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', this.clearError);
        });
    }

    /**
     * Initialize Material Design Web text fields
     * @param {HTMLElement} container - The container element
     */
    initializeMDCTextFields(container) {
        const textFields = container.querySelectorAll('.mdc-text-field');
        textFields.forEach(textField => {
            // Initialize MDC text field if available
            if (window.mdc && window.mdc.textField && window.mdc.textField.MDCTextField) {
                new window.mdc.textField.MDCTextField(textField);
            } else {
                // Fallback: manually handle floating labels
                const input = textField.querySelector('.mdc-text-field__input');
                const label = textField.querySelector('.mdc-floating-label');
                
                if (input && label) {
                    const updateLabel = () => {
                        if (input.value || input === document.activeElement) {
                            label.classList.add('mdc-floating-label--float-above');
                        } else {
                            label.classList.remove('mdc-floating-label--float-above');
                        }
                    };

                    input.addEventListener('focus', updateLabel);
                    input.addEventListener('blur', updateLabel);
                    input.addEventListener('input', updateLabel);
                    
                    // Initial check
                    updateLabel();
                }
            }
        });
    }

    /**
     * Handle form submission
     * @param {Event} event - The form submit event
     */
    async handleSubmit(event) {
        event.preventDefault();
        
        if (this.isLoading) return;

        this.clearError();
        this.setLoading(true);

        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        try {
            if (this.isLoginMode) {
                await this.handleLogin(data);
            } else {
                await this.handleSignup(data);
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Handle user login
     * @param {object} data - Form data
     */
    async handleLogin(data) {
        const { email, password } = data;
        
        if (!email || !password) {
            throw new Error('Please fill in all fields');
        }

        await this.authService.login(email, password);
        
        // Redirect to dashboard on successful login
        if (window.goTogetherRouter) {
            window.goTogetherRouter.navigate('/dashboard');
        } else {
            // Fallback to page reload if router not available
            window.location.href = '/dashboard';
        }
    }

    /**
     * Handle user signup
     * @param {object} data - Form data
     */
    async handleSignup(data) {
        console.log('Signup data:', data); // Debug log
        
        const { name, email, password, confirmPassword } = data;
        
        // Validation
        if (!name || !email || !password || !confirmPassword) {
            throw new Error('Please fill in all fields');
        }

        if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        // Check password complexity
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            throw new Error('Password must contain at least one lowercase letter, one uppercase letter, and one number (e.g., "MyPass123")');
        }

        const userData = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password
        };

        console.log('Sending userData:', userData); // Debug log

        await this.authService.register(userData);
        
        // Redirect to dashboard on successful registration
        if (window.goTogetherRouter) {
            window.goTogetherRouter.navigate('/dashboard');
        } else {
            // Fallback to page reload if router not available
            window.location.href = '/dashboard';
        }
    }

    /**
     * Toggle between login and signup modes
     */
    toggleMode() {
        this.isLoginMode = !this.isLoginMode;
        
        // Update URL without page reload
        const newPath = this.isLoginMode ? '/login' : '/signup';
        window.history.pushState({}, '', newPath);
        
        // Re-render the page
        const container = this.render();
        const app = document.getElementById('app');
        app.innerHTML = '';
        app.appendChild(container);
        
        // Re-initialize MDC components
        if (window.mdc && window.mdc.autoInit) {
            window.mdc.autoInit();
        }
    }

    /**
     * Handle forgot password
     */
    async handleForgotPassword() {
        const email = prompt('Enter your email address:');
        
        if (!email) return;

        try {
            this.setLoading(true);
            await this.authService.requestPasswordReset(email);
            alert('Password reset instructions have been sent to your email.');
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        const errorContainer = document.getElementById('error-message');
        const errorText = document.getElementById('error-text');
        
        if (errorContainer && errorText) {
            errorText.textContent = message;
            errorContainer.classList.remove('d-none');
            
            // Scroll to top to show error
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    /**
     * Clear error message
     */
    clearError() {
        const errorContainer = document.getElementById('error-message');
        if (errorContainer) {
            errorContainer.classList.add('d-none');
        }
    }

    /**
     * Set loading state
     * @param {boolean} loading - Whether the form is loading
     */
    setLoading(loading) {
        this.isLoading = loading;
        const submitButton = document.getElementById('submit-btn');
        const buttonLabel = submitButton?.querySelector('.mdc-button__label');
        
        if (submitButton && buttonLabel) {
            submitButton.disabled = loading;
            buttonLabel.textContent = loading 
                ? 'Please wait...' 
                : (this.isLoginMode ? 'Sign In' : 'Create Account');
        }
    }
}
