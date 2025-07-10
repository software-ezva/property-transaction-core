Feature: Manage documents
  As a real estate agent
  I want to manage documents related to the property transaction
  So that I can keep track of all the necessary paperwork

  Scenario: Upload document template
    Given a real estate agent "Jane Smith"
    And the document has a category "Purchase-Residential"
    When the real estate agent uploads a document template named "Critical Dates Letter"
    Then the document template "Purchase Agreement Template" should be saved in category "Residential"

  Scenario: Add document to transaction
    Given a transaction created by a real estate agent "Jane Smith" for the property "123 Main St"
    When the real estate agent adds a document named "Purchase Agreement" to the transaction
    Then the document "Purchase Agreement" should be associated with the transaction
    And their status should be "Pending Review"

    Scenario: Approve document
    Given a transaction created by a real estate agent "Jane Smith" for the property "123 Main St"
    And the transaction has a document named "Purchase Agreement"
    And the client has filled out the document "Purchase Agreement"
    When the real estate agent reviews the document "Purchase Agreement"
    Then the document "Purchase Agreement" should be marked as "Approved"
    But if the document is not filled out, it should be marked as "Returned for correction"

  Scenario: Remove document from transaction
    Given a transaction created by a real estate agent "Jane Smith" for the property "123 Main St"
    And the transaction has a document named "Purchase Agreement"
    When the real estate agent removes the document "Purchase Agreement" from the transaction
    Then the document "Purchase Agreement" should no longer be associated with the transaction
