/* Apex Controller: BookUserController.cls */
public with sharing class BookUserController {
    
    // Existing createBookUser method (from your previous code)
    @AuraEnabled
    public static String createBookUser(String name, String email, String phone, String Password) {
        try {
            // Check if user already exists
            List<Book_User_Test__c> existingUsers = [
                SELECT Id FROM Book_User_Test__c 
                WHERE Email__c = :email 
                LIMIT 1
            ];
            
            if (!existingUsers.isEmpty()) {
                throw new AuraHandledException('User with this email already exists.');
            }
            
            // Create new user
            Book_User_Test__c newUser = new Book_User_Test__c(
                Name = name,
                Email__c = email,
                Phone__c = phone,
                Password__c = Password // Note: In production, hash this password
            );
            
            insert newUser;
            return 'SUCCESS';
            
        } catch (Exception e) {
            throw new AuraHandledException('Error creating user: ' + e.getMessage());
        }
    }
    
    // New authentication method
    @AuraEnabled
    public static AuthenticationResult authenticateUser(String email, String password) {
        try {
            // Query for user with matching email
            List<Book_User_Test__c> users = [
                SELECT Id, Name, Email__c, Phone__c, Password__c 
                FROM Book_User_Test__c 
                WHERE Email__c = :email 
                LIMIT 1
            ];
            
            if (users.isEmpty()) {
                return new AuthenticationResult(false, 'No account found with this email address.', null);
            }
            
            Book_User_Test__c user = users[0];
            
            // Check password (Note: In production, you should hash passwords and compare hashes)
            if (user.Password__c != password) {
                return new AuthenticationResult(false, 'Invalid password. Please try again.', null);
            }
            
            // Successful authentication
            UserInfo userInfo = new UserInfo();
            userInfo.id = user.Id;
            userInfo.name = user.Name;
            userInfo.email = user.Email__c;
            userInfo.phone = user.Phone__c;
            
            return new AuthenticationResult(true, 'Authentication successful.', userInfo);
            
        } catch (Exception e) {
            System.debug('Authentication error: ' + e.getMessage());
            return new AuthenticationResult(false, 'An error occurred during authentication.', null);
        }
    }
    
    // Wrapper classes for authentication result
    public class AuthenticationResult {
        @AuraEnabled public Boolean success { get; set; }
        @AuraEnabled public String message { get; set; }
        @AuraEnabled public UserInfo user { get; set; }
        
        public AuthenticationResult(Boolean success, String message, UserInfo user) {
            this.success = success;
            this.message = message;
            this.user = user;
        }
    }
    
    public class UserInfo {
        @AuraEnabled public String id { get; set; }
        @AuraEnabled public String name { get; set; }
        @AuraEnabled public String email { get; set; }
        @AuraEnabled public String phone { get; set; }
    }
}