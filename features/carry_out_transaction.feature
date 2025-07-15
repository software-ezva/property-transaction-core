Feature: Carry out of transaction
  As a real estate agent,
  I want to track the workflow of the transaction
  so that it guides me step-by-step through completing a property transaction.

#TODO: bussines rules

  Scenario: Start a transaction
    Given a transaction "Listing for lease" created by a real estate agent "Jane Smith" for the property "123 Main St"
    When the real estate agent chooses a workflow template of "Listing for sale" for the transaction
    Then a copy of the workflow template would be included in the transaction with its default set of checklists
        | Checklist Name |
        | A              |
        | B              |
        | C              |

  Scenario Outline: Custom the started workflow
    Given a set of checklists indexed "<set_of_default_checklists>" to the workflow
    When the agent adds a checklist named "<new_checklist>"
    Then the new set of checklists should be "<set_of_updated_checklists>" for the started workflow

    Examples:
        | set_of_default_checklists | new_checklist | set_of_updated_checklists |
        | C, D, E                    | F             | C, D, E, F               |
        | F, G, H                    | I             | F, G, H, I               |
        | I                          | J             | I, J                     |
        | K                          | L             | K, L                     |

  Scenario Outline: Custom the items of the checklist
    Given a transaction with its workflow of "<type_of_transaction>"
    And a checklist indexed "<checklist_name>" to the workflow
    And a set of items indexed to the checklist "<set_of_default_items>"
    When the agent adds an item named "<new_item>" to the checklist "<checklist_name>"
    Then the new set of items should be "<set_of_updated_items>" for the checklist "<checklist_name>" for the started workflow

    Examples:
        | type_of_transaction | checklist_name | set_of_default_items | new_item | set_of_updated_items |
        | Purchase           | A               | i, j, a, b, c        | d        | i, j, a, b, c, d     |
        | Listing for sale   | C               | i, j, d, e, f        | g        | i, j, d, e, f, g     |
        | Listing for lease  | F               | i, j, d              | h        | i, j, d, h           |
        | Lease              | I               | i                    | j        | i, j                 |
        | Other              | K               | k                    | l        | k, l                 |

  Scenario Outline: Mark checklist items
    Given the item named "<item>" that belongs to workflow
	When real estate agents checks the step as "<state>"
    Then the item "<item>" change its status to "<state>"
    And the system will send a notification of completion

        Examples:
      | item                       | state        |
      | Sign purchase agreement    | Completed    |
      | Submit financing documents | In progress  |