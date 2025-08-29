import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
export default class userHomePage extends NavigationMixin(LightningElement) {

    handleMakeRequests() {
        try {
                    
                    
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

    handleCheckRecords() {
        try {
                    
                    
                    this[NavigationMixin.Navigate]({
                        type: 'standard__webPage',
                        attributes: {
                            url: '/userhistoryview' // Replace with your actual page URL path
                        }
                    });
                } catch (error) {
                    console.error('Navigation error:', error);
                    this.showToast('Navigation Error', 'Login successful but unable to redirect. Please navigate manually.', 'warning');
                }
    }

}
