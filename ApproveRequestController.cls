public with sharing class ApproveRequestController {
    
    @AuraEnabled(cacheable=true)
    public static List<Book_Request__c> getPendingRequests() {
        return [
            SELECT Id, Name, Status__c, Date_From__c, Date_To__c,
                   BookTest__r.Name, BookTest__c,BookTest__r.Author__c, BookTest__r.Category__c,Requested_By__c
            FROM Book_Request__c
            WHERE Status__c = 'Pending'
            ORDER BY Request_Date__c DESC
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<BookInfoTest__c> getAvailableCopies(Id bookId) {
        return [
            SELECT Id
            FROM BookInfoTest__c
            WHERE BookTest__c = :bookId AND Is_Available__c = true
        ];
    }

    @AuraEnabled
    public static void approveRequest(Id requestId, Id copyId) {
        Book_Request__c req = [SELECT Id FROM Book_Request__c WHERE Id = :requestId LIMIT 1];
        BookInfoTest__c copy = [SELECT Id FROM BookInfoTest__c WHERE Id = :copyId LIMIT 1];

        req.Status__c = 'Approved';
        req.Book_Info_Test__c = copy.Id;
        update req;

        copy.Is_Available__c = false;
        update copy;
    }

    @AuraEnabled
    public static void rejectRequest(Id requestId) {
        Book_Request__c req = [SELECT Id FROM Book_Request__c WHERE Id = :requestId LIMIT 1];
        req.Status__c = 'Rejected';
        update req;
    }
}
