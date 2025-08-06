import { LightningElement, track } from 'lwc';
import getBooks from '@salesforce/apex/BookFormController.getBooks';
import createRequest from '@salesforce/apex/BookFormController.createRequest';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BookRequestForm extends LightningElement {
    @track bookOptions = [];
    @track selectedBook = '';
    @track email = '';
    @track dateFrom = '';
    @track dateTo = '';

    connectedCallback() {
        this.fetchBooks();
    }

    fetchBooks() {
        getBooks()
            .then(result => {
                this.bookOptions = result.map(book => ({
                    label: book.Name,
                    value: book.Id
                }));
            })
            .catch(error => {
                console.error('Error fetching books:', error);
            });
    }

    handleBookChange(event) {
        this.selectedBook = event.detail.value;
    }

    handleEmailChange(event) {
        this.email = event.detail.value;
    }

    handleDateFromChange(event) {
        this.dateFrom = event.detail.value;
    }

    handleDateToChange(event) {
        this.dateTo = event.detail.value;
    }

    handleSubmit() {
        if (this.selectedBook && this.email && this.dateFrom && this.dateTo) {
            createRequest({ 
                bookId: this.selectedBook,
                email: this.email,
                dateFrom: this.dateFrom,
                dateTo: this.dateTo
            })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Book request submitted successfully',
                        variant: 'success'
                    })
                );
                this.selectedBook = '';
                this.email = '';
                this.dateFrom = '';
                this.dateTo = '';
            })
            .catch(error => {
                console.error('Error submitting request:', error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Failed to submit request',
                        variant: 'error'
                    })
                );
            });
        } else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Validation Error',
                    message: 'Please fill in all fields',
                    variant: 'warning'
                })
            );
        }
    }
}

