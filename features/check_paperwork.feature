Feature: Check paperwork
  As an interested party in any property
  I want to review the paperwork
  So that I can confirm and sign the necessary documents

Scenario: Sign document
  Given a transaction is created by a real estate agent "Jane Smith" for the property "123 Main St"
  And there exists a document named "Property Purchase Application"
  When I sign the document "Property Purchase Application"
  Then the document should be marked as "Signed"
  And the agent receives a notification of the completed document
