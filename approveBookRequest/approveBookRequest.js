import { LightningElement, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getPendingRequests from '@salesforce/apex/BookRequestController.getPendingRequests';
import getAvailableCopies from '@salesforce/apex/BookRequestController.getAvailableCopies';
import approveBookRequest from '@salesforce/apex/BookRequestController.approveBookRequest';
import rejectBookRequest from '@salesforce/apex/BookRequestController.rejectBookRequest';

export default class ApproveBookRequests extends LightningElement {
    @track requests = [];
    @track availableCopyOptions = [];
    @track selectedCopyId = '';
    loading = true;
    wiredRequestsResult;

    // Use @wire to get data that can be refreshed
    @wire(getPendingRequests)
    wiredRequests(result) {
        this.wiredRequestsResult = result;
        if (result.data) {
            this.requests = result.data.map(req => ({
                ...req,
                isSelected: false
            }));
            this.loading = false;
        } else if (result.error) {
            console.error('Error fetching requests:', result.error);
            this.loading = false;
        }
    }

    async refreshRequests() {
        this.loading = true;
        try {
            await refreshApex(this.wiredRequestsResult);
        } catch (error) {
            console.error('Error refreshing requests:', error);
            this.loading = false;
        }
    }

    async selectRequest(event) {
        const requestId = event.target.dataset.id;
        const bookId = event.target.dataset.bookId;

        this.requests = this.requests.map(req => ({
            ...req,
            isSelected: req.Id === requestId
        }));

        try {
            const copies = await getAvailableCopies({ bookId });
            this.availableCopyOptions = copies.map(copy => {
                // Create more descriptive label showing copy name and ownership status
                let label = copy.Name;
                if (copy.Owned_By__c) {
                    label += ` (Currently with: ${copy.Owned_By__c})`;
                } else {
                    label += ' (Available)';
                }
                
                return {
                    label: label,
                    value: copy.Id
                };
            });
        } catch (error) {
            console.error('Error fetching copies:', error);
        }
    }

    cancelSelection() {
        this.requests = this.requests.map(req => ({
            ...req,
            isSelected: false
        }));
        this.selectedCopyId = '';
        this.availableCopyOptions = [];
    }

    handleCopyChange(event) {
        this.selectedCopyId = event.detail.value;
    }

    async approveRequest() {
        const selectedRequest = this.requests.find(req => req.isSelected);

        if (!selectedRequest || !this.selectedCopyId) {
            alert('Please select a request and a book copy.');
            return;
        }

        try {
            await approveBookRequest({
                requestId: selectedRequest.Id,
                bookCopyId: this.selectedCopyId
            });
            await this.refreshRequests();
            this.selectedCopyId = '';
            this.availableCopyOptions = [];
        } catch (error) {
            console.error('Error approving request:', error);
        }
    }

    async rejectRequest(event) {
        const requestId = event.target.dataset.id;
        try {
            await rejectBookRequest({ requestId });
            await this.refreshRequests();
        } catch (error) {
            console.error('Error rejecting request:', error);
        }
    }

    get hasRequests() {
        return this.requests.length > 0;
    }

    get isApproveDisabled() {
        return !this.selectedCopyId;
    }
}