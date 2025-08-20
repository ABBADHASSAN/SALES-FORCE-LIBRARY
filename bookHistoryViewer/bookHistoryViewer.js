import { LightningElement, track } from 'lwc';
import getRequestsByEmail from '@salesforce/apex/BookFormController.getRequestsByEmail';
import returnBook from '@salesforce/apex/BookFormController.returnBook';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BookHistoryViewer extends LightningElement {
    @track email = '';
    @track requests = [];
    @track loading = false;

    handleEmailChange(event) {
        this.email = event.detail.value;
    }

   // Replace the handleCheckBooks method in your JavaScript with this updated version:

handleCheckBooks() {
    if (!this.email) {
        this.showToast('Warning', 'Please enter your email address', 'warning');
        return;
    }

    console.log('Searching for requests with email:', this.email);
    this.loading = true;
    getRequestsByEmail({ email: this.email })
        .then(result => {
            console.log('Raw result from Apex:', result);
            console.log('Number of requests found:', result.length);
            
            // Add computed properties for each request
            this.requests = result.map(req => {
                console.log('Processing request:', req);
                return {
                    ...req,
                    canReturn: req.Status__c === 'Approved', // Adjust this based on your status values
                    statusVariant: this.getStatusVariant(req.Status__c),
                    formattedDate: this.formatDate(req.CreatedDate),
                    // Map the book details from the relationship
                    BookTest__r: {
                        Name: req.Book_Request_Test__r?.BookTest__r?.Name || req.Name || 'N/A',
                        Author__c: req.Book_Request_Test__r?.BookTest__r?.Author__c || 'N/A',
                        Category__c: req.Book_Request_Test__r?.BookTest__r?.Category__c || 'N/A'
                    },
                    // Map the date fields from the relationship
                    Date_From__c: req.Book_Request_Test__r?.Date_From__c,
                    Date_To__c: req.Book_Request_Test__r?.Date_To__c
                };
            });
            
            console.log('Processed requests:', this.requests);
            this.loading = false;
            
            if (result.length === 0) {
                this.showToast('Info', 'No book requests found for this email', 'info');
            }
        })
        .catch(error => {
            console.error('Error fetching book requests:', error);
            console.error('Error details:', error.body);
            this.requests = [];
            this.loading = false;
            this.showToast('Error', 'Error fetching book requests: ' + (error.body?.message || error.message), 'error');
        });
}

    handleReturnBook(event) {
        const requestId = event.target.dataset.id;
        
        if (!this.email || !requestId) {
            this.showToast('Error', 'Missing email or request information', 'error');
            return;
        }

        // Show confirmation dialog
        if (!confirm('Are you sure you want to return this book?')) {
            return;
        }

        this.loading = true;
        
        returnBook({ email: this.email, bookRequestId: requestId })
            .then(result => {
                this.showToast('Success', result, 'success');
                // Refresh the book list to show updated status
                this.handleCheckBooks();
            })
            .catch(error => {
                console.error('Error returning book:', error);
                this.showToast('Error', error.body?.message || 'Error returning book', 'error');
                this.loading = false;
            });
    }

    getStatusVariant(status) {
        switch(status) {
            case 'APPROVED': return 'success';
            case 'Pending': return 'warning';
            case 'Rejected': return 'error';
            case 'Returned': return 'neutral';
            default: return 'neutral';
        }
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }

    get hasRequests() {
        return this.requests && this.requests.length > 0;
    }

    get noRequests() {
        return this.requests && this.requests.length === 0;
    }
}
