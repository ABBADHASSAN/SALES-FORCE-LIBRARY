import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
export default class PasswordCheck extends NavigationMixin (LightningElement) {
    @track password = '';
    @track errorMessage = '';

    handlePasswordChange(event) {
        this.password = event.target.value;
    }

    handleSubmit() {
        if (this.password === 'ADMIN123') {
            this.errorMessage = '';
            this.handleHomepage();
        } else {
            this.errorMessage = 'Invalid password. Please try again.';
        }
    }

    handleHomepage() {
        // Action when password matches
        console.log('Password is correct. Navigating to homepage or executing logic...');
        try {
                    
                    
                    this[NavigationMixin.Navigate]({
                        type: 'standard__webPage',
                        attributes: {
                            url: '/librarianhomepage' // Replace with your actual page URL path
                        }
                    });
                } catch (error) {
                    console.error('Navigation error:', error);
                    this.showToast('Navigation Error', 'Login successful but unable to redirect. Please navigate manually.', 'warning');
                }
    }
}
