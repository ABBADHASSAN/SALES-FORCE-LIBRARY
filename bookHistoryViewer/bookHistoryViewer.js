import { LightningElement, track } from 'lwc';
import getRequestsByEmail from '@salesforce/apex/BookFormController.getRequestsByEmail';

export default class BookHistoryViewer extends LightningElement {
    @track email = '';
    @track requests = [];

    handleEmailChange(event) {
        this.email = event.detail.value;
    }

    handleCheckBooks() {
        if (this.email) {
            getRequestsByEmail({ email: this.email })
                .then(result => {
                    this.requests = result;
                })
                .catch(error => {
                    console.error('Error fetching book requests:', error);
                    this.requests = [];
                });
        }
    }
}
