Feature: Handle documents
  As a real estate agent,
  I want to manage documents related to property transactions,
  So that I can keep track of all the necessary paperwork for each transaction process.

  Scenario Outline: Upload document template
    Given a real estate agent named "<agent_name>"
    And a document template category "<category>" exists
    When the real estate agent uploads a document template named "<template_name>" with path "<path>" to the category "<category>"
    Then the document template "<template_name>" should be saved in the category "<category>"
    Examples:
      | agent_name    | category                  | template_name              | path                           |
      | Jane Smith    | CONTRACT_AND_NEGOTIATION  | Purchase Agreement         | /templates/CONTRACT_AND_NEGOTIATION/contract.pdf       |
      | John Doe      | TITLE_AND_OWNERSHIP       | Title Report               | /templates/TITLE_AND_OWNERSHIP/title.docx         |
      | Alice Johnson | DISCLOSURE                | Property Disclosure        | /templates/DISCLOSURE/disclosure.pdf     |
      | Bob Brown     | CLOSING_AND_FINANCING     | Closing Disclosure         | /templates/CLOSING_AND_FINANCING/closing.pdf        |
      | Charlie Davis | AGREEMENTS                | Listing Agreement          | /templates/AGREEMENTS/listing.docx      |
      | David Evans   | LISTINGS_AND_MARKETING    | Open House Flyer           | /templates/LISTINGS_AND_MARKETING/openhouse.pdf     |
      | Frank Wilson  | PROPERTY_MANAGEMENT       | Property Management Plan   | /templates/PROPERTY_MANAGEMENT/property_management.pdf |
      | George Miller | INSURANCE                 | Homeowners Insurance       | /templates/INSURANCE/homeowners.pdf    |
      | Henry Adams   | MISCELLANEOUS             | Miscellaneous Document     | /templates/MISCELLANEOUS/miscellaneous.pdf |

  Scenario Outline: Add document to transaction
    Given a transaction of "<transaction_type>" created by the real estate agent "<agent_name>" for the property "<property>"
    And a document template with id "<document_name>" in category "<category>" exists
    When the real estate agent adds the document from document templates to the transaction
    Then the document "<document_name>" should be duplicated in the transaction
    Examples:
      | transaction_type | agent_name       |property     | document_name        | category                  |
      | Purchase         | Jane Smith       | 123 Main St | Purchase Agreement   | CONTRACT_AND_NEGOTIATION  |
      | Purchase         | Jane Smith       | 123 Main St | Title Report         | TITLE_AND_OWNERSHIP       |
      | Purchase         | Jane Smith       | 123 Main St | Property Disclosure   | DISCLOSURE                |
      | Purchase         | Jane Smith       | 123 Main St | Closing Disclosure    | CLOSING_AND_FINANCING     |
      | Purchase         | Jane Smith       | 123 Main St | Listing Agreement     | AGREEMENTS                |

  Scenario: Check document for edit
    Given a transaction of "Purchase" created by the real estate agent "Jane Smith" for the property "123 Main St"
    And the transaction has a document named "Purchase Agreement" with status "Pending" 
    When the real estate agent checks the document for editing
    Then the document status should be changed to "In Edition" 
    And the document should be editable

  Scenario: Edit document for signing
    Given a transaction of "Purchase" created by the real estate agent "Jane Smith" for the property "123 Main St"
    And the transaction has a document named "Purchase Agreement" with status "In Edition" 
    When the real estate agent edits the document and is ready for signing
    Then the status of the document should be changed to "Awaiting Signatures"
    And the document should be signable
 
  Scenario: Request a sign
    Given a transaction of "Purchase" created by the real estate agent "Jane Smith" for the property "123 Main St"
    And exist a user named "Alice" as interested party in the property added to the transaction as supporting professional
    And the transaction has a document named "Purchase Agreement" with status "Awaiting Signatures"
    When the real estate agent requests a sign for the document of party interested
    Then the document could be signed by the interested party

  Scenario: Correct a document
    Given a transaction of "Purchase" created by the real estate agent "Jane Smith" for the property "123 Main St"
    And the transaction has a document named "Purchase Agreement" with status "Rejected"
    When the real estate agent corrects the document after rejection
    Then the document status should be changed to "In Edition"
    And the document should be editable
      

