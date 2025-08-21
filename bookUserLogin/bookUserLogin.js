// Fixed JavaScript file for the Lightning Web Component

// Fixed JavaScript file for the Lightning Web Component

import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createBookUser from '@salesforce/apex/BookUserController.createBookUser';
import { NavigationMixin } from 'lightning/navigation';

export default class bookUserLogin extends NavigationMixin(LightningElement) {
    @track name = '';
    @track email = '';
    @track phone = '';
    @track password = ''; 
    @track isLoading = false;

    // Handle input changes
    handleNameChange(event) {
        this.name = event.target.value;
    }

    handleEmailChange(event) {
        this.email = event.target.value;
    }

    handlePhoneChange(event) {
        this.phone = event.target.value;
    }
    
    handlePasswordChange(event) {
        this.password = event.target.value;
    }

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


    // Fixed handleLogin method for Experience Cloud
    handleLogin() {
        try {
            // Option 1: Navigate to Experience Cloud page by name (most common)
            this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                    name: 'Sign Up' // Replace with your actual Experience Cloud page name
                }
            });

            // Alternative Option 2: Navigate to specific Experience Cloud page by URL
            
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: '/signup' // Replace with your actual page URL path
                }
            });
            

            
        } catch (error) {
            console.error('Navigation error:', error);
            this.showToast('Navigation Error', 'Unable to navigate to login page: ' + error.message, 'error');
        }
    }

    // Handle form submission
    handleSubmit() {
        // Basic client-side validation
        if (!this.validateForm()) {
           
            return;
        }

        this.isLoading = true;

        createBookUser({ 
            name: this.name, 
            email: this.email, 
            phone: this.phone,
            Password: this.password
        })
        .then(result => {
            if (result === 'SUCCESS') {
                this.showToast('Success', 'User registered successfully!', 'success');
                this.resetForm();
                this.navigateToRequestTest();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            this.showToast('Error', error.body?.message || 'An error occurred while registering user.', 'error');
        })
        .finally(() => {
            this.isLoading = false;
        });
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

        // Additional password validation
        if (this.password && this.password.length < 8) {
            this.showToast('Validation Error', 'Password must be at least 8 characters long.', 'error');
            isValid = false;
        }

        return isValid;
    }

    // Reset form after successful submission
    resetForm() {
        this.name = '';
        this.email = '';
        this.phone = '';
        this.password = '';
        
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
        return this.name && this.email && this.phone && this.password;
    }
}