# Change Log

---

## Version Numbering Key
### First Digit
Production-level releases
### Second digit
Feature releases
### Third Digit
Bug fixes, patches
### Fourth Digit
Trivial changes that do not affect function, e.g. code formatting, typographical fixes. Trivial changes may also occur at any release.

---

## v0.1.0.0
### Initial Release
Minimum functionality. User may input pattern to build data trees, display will serve data back to user. User can progress through the pattern forward and backward at varying increments, and progress will be updated at the database.

---

## v0.2.0.0
### Added Delete Feature + Improvements to Error Handling
* Handled uncaught errors in buildDisplays function
    * Any errors from the promise chains contained in buildDisplays are thrown outside of the calling promise (updateDisplays) catch scope
    * Added Promise.all to catch errors from buildDisplays and return them to updateDisplays
* Added some error handling for missing documents in database
* Handled unmatched routes in app.js
    * Placeholder for a redirect to a custom 404 page in a later update
* Fixed redirect method after completion of HTTP requests
    * Added JavaScript for setup page to handle redirect after creating a new pattern
    * Was previously handling it on the backend via res.redirect, which is bad practice. Should allow POST request to complete response before redirecting with window.location.href
* Built dashboard to display list of existing pattern setups (later this will be unique to user)
* Built delete functions for both pattern contents and pattern setups
    * Added calls to these from both pattern build page and dashboard