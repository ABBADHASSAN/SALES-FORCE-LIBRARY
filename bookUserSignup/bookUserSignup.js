

import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import authenticateUser from '@salesforce/apex/BookUserController.authenticateUser';

export default class BookUserSignup extends NavigationMixin(LightningElement) {
    @track email = '';
    @track password = '';
    @track isLoading = false;
    @track errorMessage = '';

    // Handle input changes
    handleEmailChange(event) {
        this.email = event.target.value;
        this.clearErrorMessage();
    }

    handlePasswordChange(event) {
        this.password = event.target.value;
        this.clearErrorMessage();
    }

    // Clear error message when user starts typing
    clearErrorMessage() {
        this.errorMessage = '';
    }

    // Handle sign in
    handleSignIn() {
        // Basic client-side validation
        if (!this.validateForm()) {
            return;
        }

        this.isLoading = true;
        this.clearErrorMessage();

        authenticateUser({ 
            email: this.email, 
            password: this.password 
        })
        .then(result => {
            if (result.success) {
                this.showToast('Success', 'Login successful! Welcome back.', 'success');
                
                // Store user info if needed (in memory only, not localStorage)
                this.currentUser = result.user;
                
                // Redirect to requesttest page
                this.navigateToRequestTest();
                
                // Reset form
                this.resetForm();
            } else {
                this.errorMessage = result.message || 'Invalid email or password. Please try again.';
            }
        })
        .catch(error => {
            console.error('Authentication error:', error);
            this.errorMessage = 'An error occurred during sign in. Please try again.';
            this.showToast('Error', 'Authentication failed. Please check your credentials.', 'error');
        })
        .finally(() => {
            this.isLoading = false;
        });
    }

    // Navigate to requesttest page
    navigateToRequestTest() {
        try {
            // Option 1: Navigate to Experience Cloud page by name (most common)
            this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                    name: 'form test' // Replace with your actual Experience Cloud page name
                }
            });

            // Alternative Option 2: Navigate to specific Experience Cloud page by URL
            
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: '/formtest' // Replace with your actual page URL path
                }
            });
        } catch (error) {
            console.error('Navigation error:', error);
            this.showToast('Navigation Error', 'Login successful but unable to redirect. Please navigate manually.', 'warning');
        }
    }

    // Navigate to registration page
    handleRegister() {
        try {
            // Option 1: Navigate to Experience Cloud page by name (most common)
            this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                    name: 'login page' // Replace with your actual Experience Cloud page name
                }
            });

            // Alternative Option 2: Navigate to specific Experience Cloud page by URL
            
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: '/loginpage' // Replace with your actual page URL path
                }
            });
        } catch (error) {
            console.error('Navigation error:', error);
            // Alternative: You could dispatch a custom event or use a different navigation method
            this.showToast('Navigation Error', 'Unable to navigate to registration page.', 'error');
        }
    }

    // Client-side form validation
    validateForm() {
        let isValid = true;
        const inputs = this.template.querySelectorAll('lightning-input');
        
        inputs.forEach(input => {
            if (!input.checkValidity()) {
                input.reportValidity();
                isValid = false;
            }
        });

        // Additional validation
        if (!this.email || !this.password) {
            this.errorMessage = 'Please enter both email and password.';
            isValid = false;
        }

        if (this.password && this.password.length < 6) {
            this.errorMessage = 'Password must be at least 6 characters long.';
            isValid = false;
        }

        return isValid;
    }

    // Reset form
    resetForm() {
        this.email = '';
        this.password = '';
        this.errorMessage = '';
        
        // Clear form inputs
        const inputs = this.template.querySelectorAll('lightning-input');
        inputs.forEach(input => {
            input.value = '';
        });
    }

    // Show toast message
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }

    // Check if form is valid for button state
    get isFormValid() {
        return this.email && this.password && this.password.length >= 6;
    }
}





/* bookUserSignup.css */

