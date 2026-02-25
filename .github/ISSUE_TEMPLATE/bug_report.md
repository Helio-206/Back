name: Bug Report
description: Report a bug
labels: ["bug"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for reporting a bug. Please fill in the details below.
  - type: input
    attributes:
      label: Title
      placeholder: Short summary of the bug
    validations:
      required: true
  - type: textarea
    attributes:
      label: Description
      placeholder: Describe the bug in detail
    validations:
      required: true
  - type: textarea
    attributes:
      label: Steps to Reproduce
      placeholder: |
        1. ...
        2. ...
        3. ...
    validations:
      required: true
  - type: textarea
    attributes:
      label: Expected Behavior
      placeholder: What should happen?
  - type: textarea
    attributes:
      label: Actual Behavior
      placeholder: What actually happens?
  - type: input
    attributes:
      label: Affected Version
      placeholder: e.g., 1.0.0
  - type: textarea
    attributes:
      label: Logs or Screenshots
      placeholder: Paste logs or screenshots
  - type: textarea
    attributes:
      label: Additional Notes
      placeholder: Any other relevant information
