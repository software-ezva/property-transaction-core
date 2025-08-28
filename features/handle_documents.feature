Feature: Handle documents
  As a real estate agent,
  I want to manage documents related to property transactions,
  So that I can keep track of all the necessary paperwork for each transaction process.

  Scenario Outline: Upload document template
    Given a real estate agent named "<agent_name>"
    And a document template category "<category>" exists
    When the real estate agent uploads a document template named "<template_name>" with url "<url>" to the category "<category>"
    Then the document template "<template_name>" should be saved in the category "<category>"

    Examples:
      | agent_name    | category                  | template_name              | url                           |
      | Jane Smith    | CONTRACT_AND_NEGOTIATION  | Purchase Agreement         | http://example.com/contract  |
      | John Doe      | TITLE_AND_OWNERSHIP       | Title Report               | http://example.com/title      |
      | Alice Johnson | DISCLOSURE                | Property Disclosure        | http://example.com/disclosure |
      | Bob Brown     | CLOSING_AND_FINANCING     | Closing Disclosure         | http://example.com/closing    |
      | Charlie Davis | AGREEMENTS                | Listing Agreement          | http://example.com/listing    |
      | David Evans   | LISTINGS_AND_MARKETING    | Open House Flyer           | http://example.com/openhouse  |
      | Frank Wilson  | PROPERTY_MANAGEMENT       | Property Management Plan   | http://example.com/property_management |
      | George Miller | INSURANCE                 | Homeowners Insurance       | http://example.com/homeowners  |
      | Henry Adams   | MISCELLANEOUS             | Miscellaneous Document     | http://example.com/miscellaneous |

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

#   #TODO: Add scenario for filling out document
#   #TODO: Remove or archive document

Scenario Outline: Succesfully change the status of a document
  Given a transaction of "<transaction_type>" created by the real estate agent "<agent_name>" for the property "<property>"
  And the transaction has a document named "<document_name>" with status "<initial_status>"
  When the real estate agent changes the status of the document "<document_name>" to "<new_status>"
  Then the document should have status "<new_status>"

  Examples:
    | agent_name  | property      | document_name        | initial_status | new_status  | transaction_type |
    | Jane Smith  | 123 Main St   | Purchase Agreement   | Pending        | Ready       | Purchase |
    | Jane Smith  | 123 Main St   | Purchase Agreement   | Ready          | Waiting     | Purchase |
    | Jane Smith  | 123 Main St   | Purchase Agreement   | Waiting        | Signed      | Purchase|
    | Jane Smith  | 123 Main St   | Purchase Agreement   | Ready          | Pending     | Purchase|
    | Jane Smith  | 123 Main St   | Purchase Agreement   | Waiting        | Pending     | Purchase|
    | Jane Smith  | 123 Main St   | Purchase Agreement   | Ready          | Pending     | Purchase|
    | Jane Smith  | 123 Main St   | Purchase Agreement   | Ready          | Signed      | Purchase|
    | Jane Smith  | 123 Main St   | Purchase Agreement   | Pending        | Rejected    | Purchase|
    | Jane Smith  | 123 Main St   | Purchase Agreement   | Ready          | Rejected    | Purchase|
    | Jane Smith  | 123 Main St   | Purchase Agreement   | Waiting        | Rejected    | Purchase|
    | Jane Smith  | 123 Main St   | Purchase Agreement   | Signed         | Rejected    | Purchase|


Scenario Outline: Unsuccessfully change the status of a document
Given a transaction of "<transaction_type>" created by the real estate agent "<agent_name>" for the property "<property>"
  And the transaction has a document named "<document_name>" with status "<initial_status>"
  When the real estate agent changes the status of the document "<document_name>" to "<new_status>"
  Then an error should occur indicating that the status change is not allowed

  Examples:
    | agent_name  | property      | document_name        | initial_status | new_status  | transaction_type |
    | Jane Smith  | 123 Main St   | Purchase Agreement   | Pending        | Waiting     | Purchase |
    | Jane Smith  | 123 Main St   | Purchase Agreement   | Pending        | Signed      | Purchase |
    | Jane Smith  | 123 Main St   | Purchase Agreement   | Waiting        | Ready       | Purchase |
    | Jane Smith  | 123 Main St   | Purchase Agreement   | Signed         | Pending     | Purchase |
    | Jane Smith  | 123 Main St   | Purchase Agreement   | Signed         | Ready       | Purchase |
    | Jane Smith  | 123 Main St   | Purchase Agreement   | Signed         | Waiting     | Purchase |
    | Jane Smith  | 123 Main St   | Purchase Agreement   | Rejected       | Ready       | Purchase |
    | Jane Smith  | 123 Main St   | Purchase Agreement   | Rejected       | Waiting     | Purchase |
    | Jane Smith  | 123 Main St   | Purchase Agreement   | Rejected       | Signed      | Purchase |
    | Jane Smith  | 123 Main St   | Purchase Agreement   | Rejected       | Pending     | Purchase |