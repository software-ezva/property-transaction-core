Feature: Check paperwork
  As an interested in any property
  I want to review the paperwork
  So that confirm and sign the necessary documents

Scenario: Fill document
  Given a transaction created by a real estate agent "Jane Smith" for the property "123 Main St"
  And exists a document named "Property Purchase Application"
  When I fill out the document with required information
  Then the document should be marked as "Filled Out"
  And the agent receives a notification of the completed document

#  Scenario: Review paperwork