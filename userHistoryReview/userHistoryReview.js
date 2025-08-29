import { LightningElement, track } from 'lwc';
import getAllRequestsByEmail from '@salesforce/apex/BookFormController.getAllRequestsByEmail';
import returnBook from '@salesforce/apex/BookFormController.returnBook';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BookHistoryViewer extends LightningElement {
    @track email = '';
    @track requests = [];
    @track loading = false;

    // Connected callback to get email from session storage
    connectedCallback() {
        const storedEmail = sessionStorage.getItem('userEmail');
        if (storedEmail) {
            this.email = storedEmail;
            console.log('Email retrieved from session storage:', this.email);
            // Automatically load books when email is received from login
            this.handleCheckBooks();
        }
    }

    

    handleCheckBooks() {
        if (!this.email) {
            this.showToast('Warning', 'Please enter your email address', 'warning');
            return;
        }

        console.log('Searching for requests with email:', this.email);
        this.loading = true;
        getAllRequestsByEmail({ email: this.email })
            .then(result => {
                console.log('Raw result from Apex:', result);
                console.log('Number of requests found:', result.length);
                
                // Add computed properties for each request
                this.requests = result.map(req => {
                    console.log('Processing request:', req);
                    return {
                        ...req,
                        canReturn: req.Status__c === 'Approved',
                        statusVariant: this.getStatusVariant(req.Status__c),
                        formattedDate: this.formatDate(req.CreatedDate),
                        // Since your Apex query gets BookTest__r directly, use it
                        BookTest__r: {
                            Name: req.BookTest__r?.Name || 'N/A',
                            Author__c: req.BookTest__r?.Author__c || 'N/A',
                            Category__c: req.BookTest__r?.Category__c || 'N/A'
                        },
                        // Date fields are directly on Book_Request__c record per your SOQL
                        Date_From__c: req.Date_From__c || 'N/A',
                        Date_To__c: req.Date_To__c || 'N/A',
                        Fine__c: req.Fine__c || 'No Fine'
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

    getStatusVariant(status) {
        switch(status) {
            case 'Approved': return 'success';  // Changed from 'APPROVED' to match your data
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