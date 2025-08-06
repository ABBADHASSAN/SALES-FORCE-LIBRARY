public with sharing class BookFormController {
    @AuraEnabled(cacheable=true)
    public static List<BookTest__c> getBooks() {
        return [SELECT Id, Name FROM BookTest__c];
    }

    @AuraEnabled
    public static void createRequest(Id bookId ,String email, Date dateFrom, Date dateTo) {
        Book_Request__c req = new Book_Request__c(
            BookTest__c = bookId,
            Status__c = 'Pending',
            Requested_By__c = email ,
            Date_From__c = dateFrom,
            Date_To__c = dateTo
        );
        insert req;
    }

    @AuraEnabled(cacheable=true)
public static List<Book_Request__c> getRequestsByEmail(String email) {
    return [
        SELECT Id, Name, BookTest__r.Name, Date_From__c, Date_To__c, Status__c
        FROM Book_Request__c
        WHERE Requested_By__c = :email
    ];
}

}


