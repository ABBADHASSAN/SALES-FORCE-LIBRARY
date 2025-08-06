public with sharing class BookRequestController {

    @AuraEnabled(cacheable=true)
    public static List<Book_Request__c> getPendingRequests() {
        return [
            SELECT Id, Status__c, BookTest__c, BookTest__r.Name,BookTest__r.Author__c, BookTest__r.Category__c,Date_From__c, Date_To__c,Requested_By__c,
                   CreatedDate
            FROM Book_Request__c
            WHERE Status__c = 'Pending'
            ORDER BY CreatedDate DESC
        ];
    }

    // Updated to include Owned_By__c field
    @AuraEnabled(cacheable=true)
    public static List<BookInfoTest__c> getAvailableCopies(Id bookId) {
        return [
            SELECT Id, Name, Owned_By__c
            FROM BookInfoTest__c
            WHERE BookTest__c = :bookId AND Is_Available__c = true
        ];
    }

    @AuraEnabled
    public static void approveBookRequest(Id requestId, Id bookCopyId) {
        Book_Request__c request = [
            SELECT Id, Status__c, Requested_By__c
            FROM Book_Request__c
            WHERE Id = :requestId
            LIMIT 1
        ];
        BookInfoTest__c copy = [
            SELECT Id, Is_Available__c, Owned_By__c
            FROM BookInfoTest__c
            WHERE Id = :bookCopyId
            LIMIT 1
        ];

        request.Status__c = 'Approved';
        copy.Is_Available__c = false;
        copy.Owned_By__c = request.Requested_By__c;

        update new List<SObject>{ request, copy };
    }

    @AuraEnabled
    public static void rejectBookRequest(Id requestId) {
        Book_Request__c request = [
            SELECT Id, Status__c
            FROM Book_Request__c
            WHERE Id = :requestId
            LIMIT 1
        ];
        request.Status__c = 'Rejected';
        update request;
    }
}