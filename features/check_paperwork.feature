Feature: Check paperwork
  As an interested party in any property
  I want to review the paperwork
  So that I can confirm and sign the necessary documents

  Scenario : Sign document
    Given a transaction of "Purchase" created by the real estate agent "Jane Smith" for the property "123 Main St"
    And exist a user named "Alice" as interested party in the property added to the transaction as supporting professional
    And the transaction has a document named "Purchase Agreement" with status "Awaiting Signatures"
    And the document is signable to interested party
    When the interested party in any property signs the document
    Then the document have the signature of the interested party
    But the document have all signatures required the status should be changed to "Signed"

Scenario: Reject document
    Given a transaction of "Purchase" created by the real estate agent "Jane Smith" for the property "123 Main St"
    And exist a user named "Alice" as interested party in the property added to the transaction as supporting professional
    And the transaction has a document named "Purchase Agreement" with status "Awaiting Signatures"
    And the document is signable to interested party
    When the interested party in any property rejects the document with reason "The terms are not acceptable"
    Then the document status should be changed to "Rejected"
    Then the document should be editable
