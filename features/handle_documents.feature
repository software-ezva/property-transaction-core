Feature: Handle documents
  As a real estate agent,
  I want to manage documents related to property transactions,
  So that I can keep track of all the necessary paperwork for each transaction process.

#   Scenario Outline: Upload document template
#     Given a real estate agent named "<agent_name>"
#     And a document template category "<category>" exists
#     When the real estate agent uploads a document template named "<template_name>" to the category "<category>"
#     Then the document template "<template_name>" should be saved in the category "<category>"

#     Examples:
#       | agent_name  | category              | template_name           |
#       | Jane Smith  | Purchase-Residential  | Critical Dates Letter   |

#   Scenario Outline: Add document to transaction
#     Given a transaction created by the real estate agent "<agent_name>" for the property "<property>"
#     When the real estate agent adds a document named "<document_name>" from document templates to the transaction
#     Then the document "<document_name>" should be duplicated in the transaction
#     And its status should be "Pending"

#     Examples:
#       | agent_name  | property      | document_name        |
#       | Jane Smith  | 123 Main St   | Purchase Agreement   |

#   #TODO: Add scenario for filling out document

#   Scenario Outline: Complete document
#     Given a transaction created by the real estate agent "<agent_name>" for the property "<property>"
#     And the transaction has a document named "<document_name>"
#     When the agent completes the document "<document_name>"
#     Then the document "<document_name>" should be marked as "Ready"

#     Examples:
#       | agent_name  | property      | document_name        |
#       | Jane Smith  | 123 Main St   | Purchase Agreement   | 

#   #TODO: Remove or archive document
#   Scenario Outline: Remove document from transaction
#     Given a transaction created by the real estate agent "<agent_name>" for the property "<property>"
#     And the transaction has a document named "<document_name>"
#     When the real estate agent removes the document "<document_name>" from the transaction
#     Then the document "<document_name>" should no longer be associated with the transaction

#     Examples:
#       | agent_name  | property      | document_name        |
#       | Jane Smith  | 123 Main St   | Purchase Agreement   |

# Scenario Outline: Succesfully change the status of a document
#   Given a transaction created by the real estate agent "<agent_name>" for the property "<property>"
#   And the transaction has a document named "<document_name>" with status "<initial_status>"
#   When the real estate agent changes the status of the document "<document_name>" to "<new_status>"
#   Then the document "<document_name>" should have status "<new_status>"

#   Examples:
#     | agent_name  | property      | document_name        | initial_status | new_status  |
#     | Jane Smith  | 123 Main St   | Purchase Agreement   | Pending        | Ready       |
#     | Jane Smith  | 123 Main St   | Purchase Agreement   | Ready          | Waiting     |
#     | Jane Smith  | 123 Main St   | Purchase Agreement   | Waiting        | Signed      |
#     | Jane Smith  | 123 Main St   | Purchase Agreement   | Ready          | Pending     |
#     | Jane Smith  | 123 Main St   | Purchase Agreement   | Waiting        | Pending     |
#     | Jane Smith  | 123 Main St   | Purchase Agreement   | Ready          | Pending     |
#     | Jane Smith  | 123 Main St   | Purchase Agreement   | Ready          | Signed      |
#     | Jane Smith  | 123 Main St   | Purchase Agreement   | Pending        | Rejected    |
#     | Jane Smith  | 123 Main St   | Purchase Agreement   | Ready          | Rejected    |
#     | Jane Smith  | 123 Main St   | Purchase Agreement   | Waiting        | Rejected    |
#     | Jane Smith  | 123 Main St   | Purchase Agreement   | Signed         | Rejected    |


# Scenario Outline: Unsuccessfully change the status of a document
#   Given a transaction created by the real estate agent "<agent_name>" for the property "<property>"
#   And the transaction has a document named "<document_name>" with status "<initial_status>"
#   When the real estate agent attempts to change the status of the document "<document_name>" to "<new_status>"
#   Then an error should occur indicating that the status change is not allowed

#   Examples:
#     | agent_name  | property      | document_name        | initial_status | new_status  |
#     | Jane Smith  | 123 Main St   | Purchase Agreement   | Pending        | Waiting     |
#     | Jane Smith  | 123 Main St   | Purchase Agreement   | Pending        | Signed      |
#     | Jane Smith  | 123 Main St   | Purchase Agreement   | Waiting        | Ready       |
#     | Jane Smith  | 123 Main St   | Purchase Agreement   | Signed         | Pending     |
#     | Jane Smith  | 123 Main St   | Purchase Agreement   | Signed         | Ready       |
#     | Jane Smith  | 123 Main St   | Purchase Agreement   | Signed         | Waiting     |
#     | Jane Smith  | 123 Main St   | Purchase Agreement   | Pending        | Rejected    |
#     | Jane Smith  | 123 Main St   | Purchase Agreement   | Waiting        | Rejected    |
#     | Jane Smith  | 123 Main St   | Purchase Agreement   | Ready          | Rejected    |
#     | Jane Smith  | 123 Main St   | Purchase Agreement   | Rejected       | Ready       |
#     | Jane Smith  | 123 Main St   | Purchase Agreement   | Rejected       | Waiting     |
#     | Jane Smith  | 123 Main St   | Purchase Agreement   | Rejected       | Signed      |
#     | Jane Smith  | 123 Main St   | Purchase Agreement   | Rejected       | Pending     |