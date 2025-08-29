import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
export default class librarianHomePage extends NavigationMixin (LightningElement) {

    handleCheckRequests() {
        try {
                    
            
                    
                    this[NavigationMixin.Navigate]({
                        type: 'standard__webPage',
                        attributes: {
                            url: '/requesttest' // Replace with your actual page URL path
                        }
                    });
                } catch (error) {
                    console.error('Navigation error:', error);
                    this.showToast('Navigation Error', 'Login successful but unable to redirect. Please navigate manually.', 'warning');
                }
    }

    handleCheckRecords() {
        try {
                    
                    
                    this[NavigationMixin.Navigate]({
                        type: 'standard__webPage',
                        attributes: {
                            url: '/historytest' // Replace with your actual page URL path
                        }
                    });
                } catch (error) {
                    console.error('Navigation error:', error);
                    this.showToast('Navigation Error', 'Login successful but unable to redirect. Please navigate manually.', 'warning');
                }
    }

}
