public with sharing class BookFormController {
    
    @AuraEnabled(cacheable=true)
    public static List<BookTest__c> getBooks() {
        return [SELECT Id, Name FROM BookTest__c];
    }
    
    @AuraEnabled
    public static void createRequest(Id bookId, String email, Date dateFrom, Date dateTo) {
        Book_Request__c req = new Book_Request__c(
            BookTest__c = bookId,
            Status__c = 'PENDING',
            Requested_By__c = email,
            Date_From__c = dateFrom,
            Date_To__c = dateTo
        );
        insert req;
    }
    
    // Get all book requests by email - shows complete history (remove cacheable for debugging)
    // Updated method in your BookFormController class
// Updated method in your BookFormController class
@AuraEnabled
public static List<Issued_book_Test__c> getRequestsByEmail(String email) {
    System.debug('Searching for requests with email: ' + email);
    
    List<Issued_book_Test__c> requests = [
        SELECT Id, Name, Due_Date__c, Status__c, Fine__c, Borrower_Email__c, 
               CreatedDate,
               Book_Request_Test__r.Date_From__c,
               Book_Request_Test__r.Date_To__c,
               Book_Request_Test__r.BookTest__r.Name,
               Book_Request_Test__r.BookTest__r.Author__c,
               Book_Request_Test__r.BookTest__r.Category__c
        FROM Issued_book_Test__c
        WHERE Borrower_Email__c = :email
        ORDER BY CreatedDate DESC
    ];
    
    System.debug('Found ' + requests.size() + ' requests');
    for(Issued_book_Test__c req : requests) {
        System.debug('Request: ' + req.Name + ' - Status: ' + req.Status__c + ' Date: ' + req.Due_Date__c + ' Fine: ' + req.Fine__c);
    }
    return requests;
}

    
    
    // Method to return book - changes status to 'Returned' and makes book available
    @AuraEnabled
    public static String returnBook(String email, Id bookRequestId) {
        try {
            // Get the book request details - must be APPROVED and belong to the user
            Book_Request__c request = [
                SELECT Id, BookTest__c, Status__c, Requested_By__c
                FROM Book_Request__c
                WHERE Id = :bookRequestId AND Requested_By__c = :email AND Status__c = 'APPROVED'
                LIMIT 1
            ];
            
            // Find the book copy that was assigned to this user
            List<BookInfoTest__c> bookCopies = [
                SELECT Id, Is_Available__c, Owned_By__c
                FROM BookInfoTest__c
                WHERE BookTest__c = :request.BookTest__c 
                AND Owned_By__c = :email 
                AND Is_Available__c = false
                LIMIT 1
            ];
            
            if (bookCopies.isEmpty()) {
                throw new AuraHandledException('No book copy found to return for this request.');
            }
            
            BookInfoTest__c bookCopy = bookCopies[0];
            
            // Update book copy to make it available again
            bookCopy.Is_Available__c = true;
            bookCopy.Owned_By__c = null;
            update bookCopy;
            
            // Update request status to 'Returned'
            request.Status__c = 'RETURNED';
            update request;


            Issued_Book_Test__c issuedBook = [
                SELECT ID ,Status__c ,Borrower_Email__c,Book_Request_Test__c
                FROM Issued_Book_Test__c
                WHERE Borrower_Email__c = :email
                AND Book_Request_Test__c = :bookRequestId
                LIMIT 1
            ] ;
            
            issuedBook.Status__c = 'RETURNED';
            update issuedBook;
            
            return 'Book returned successfully!';
            
        } catch (QueryException e) {
            throw new AuraHandledException('Book request not found or not eligible for return.');
        } catch (Exception e) {
            throw new AuraHandledException('Error returning book: ' + e.getMessage());
        }
    }
}
