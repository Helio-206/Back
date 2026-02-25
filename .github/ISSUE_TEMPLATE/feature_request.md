name: Feature Request
description: Suggest a new feature
labels: ["enhancement"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for the suggestion. Use this template to describe your idea.
  - type: input
    attributes:
      label: Summary
      placeholder: Short summary of the feature
    validations:
      required: true
  - type: textarea
    attributes:
      label: Description
      placeholder: Describe the feature in detail
    validations:
      required: true
  - type: textarea
    attributes:
      label: Use Case
      placeholder: |
        Why is this needed?
        What problem does it solve?
    validations:
      required: true
  - type: textarea
    attributes:
      label: Proposed Solution
      placeholder: How would you implement it?
  - type: textarea
    attributes:
      label: Alternatives Considered
      placeholder: Other ways to solve this?
  - type: textarea
    attributes:
      label: Impact
      placeholder: Who will be affected?
