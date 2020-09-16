describe('Create Screen Functionality', function () {
    beforeEach(function () {
        browser().navigateTo("/#/ManageOrganization/ManageOrganizationCreate");

    });

    it('should expect to have the next button disabled while the form is invalid', function () {
        var d = element("a.next").attr("disabled");
        expect(d).toEqual("disabled");
    });
    
    it('should expect the display name, organization code and legal name to be automatically generated', function () {
        


        input("model.OrganizationLegalName").enter("Legal Name");
        expect(input("model.OrganizationLegalName").val()).toEqual("Legal Name");
        expect(input("model.OrganizationDisplayName").val()).toEqual("Legal Name");
        expect(input("model.OrganizationCode").val()).toEqual("LEGALN");
        
    });

});