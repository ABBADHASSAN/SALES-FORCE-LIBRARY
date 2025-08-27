({
    doInit : function(component, event, helper) {
        var baseUrl = $A.get("$Resource.Library"); // Gives resource URL
        var absoluteUrl = window.location.origin + baseUrl; // Make it absolute
        component.set("v.logoUrl", absoluteUrl + "/Library.png");
        console.log('Resolved Logo URL:', absoluteUrl + "/Library.png");
    }
})
