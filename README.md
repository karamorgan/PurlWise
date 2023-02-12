# PurlWise
## *A Knitting Progress Tracker & Companion App*

PurlWise is the companion that follows along as you knit your way through complex projects. Input your pattern to transform it into a visually interactive display. As you knit, cue the UI stitch-by-stitch or row-by-row, and watch as the display progresses along with you. 

PurlWise gives your projects both foresight and hindsight, displaying rows ahead and already completed. And no more worrying about losing your place in complex knitting patterns; PurlWise stores the important information about your projects--including the stitch you last completed--so you can come back later and pick up where you left off. 

Built for those of us with a short-term memory of 3 seconds, PurlWise takes the second-guessing out of knitting, so you'll never knit your purl stitches or purl your knit stitches again.

---

## Technical Overview

Repetition in knitting patterns is usually layered: repeat a purl stitch 2 times, repeat a knit stitch 2 times, repeat that sequence 8 times, repeat that row 20 times. This nesting lends itself nicely to hierarchical data structures, which is why PurlWise is primarily centered around building and traversing trees.

PurlWise stores repetitive data with the minimum documents necessary to represent each pattern, so a complex project involving 60,000 stitches can be reduced to just a few dozen nodes in a tree. All nodes are stored in the database as first-class citizens with ObjectID references to their immediate descendent documents, making searching and updating the data structure simple at any level. 

PurlWise serves pattern data to the display incrementally as cued by the user. It allows you to change the increment of advance and to reverse direction as necessary. Progress udates to the database are idempotent and occur at every increment, so progress is accurately tracked without having to save manually, even when communication to the backend is interrupted.

In a future update, PurlWise will support user profiles, authenticated with JSON web tokens, allowing users to store multiple patterns at varying levels of progress.

---

## Status
**PurlWise is a work in progress.** It is currently a minimum viable product, so you can use it at its base functionality, but it is missing some major features. All frontend development has thus far been limited to delivering data to the user, so there is no UI design beyond the minimum HTML. At this stage, users may input patterns and progress through them on the display by clicking at their increment of choice. Future versions will support a spacebar tap or foot pedal input.

---

## Frameworks and Libraries
* Node.js
* Express
* MongoDB
* Mongoose

---

## Forward Work
* Add edit/delete functionality to pattern setup page
* Revise frontend display code
    * Try to move as much code as possible to backend
    * Explore more opportunities for inheritance, encapsulation, polymorphism, abstraction?
* Design and build the UI
* Build user profile & authentication functionality on the backend
* Build user dashboard with pattern previews
* Verify app is compliant with RESTful constraints
* Move database to cloud-based MongoDB Atlas
* Revise with React or Angular
* Integrate a templating engine to serve webpages
    * Handlebars or Pug?
* Improve error handling
* Validate against security risks
    * Find an infosec expert to talk to?
* Update xhttp to Fetch API
* Revise DOM manipulation
    * Current methods work, but are clunky
    * Current element nesting is not friendly with CSS Flexbox/Grid
* Find ways to optimize and otherwise mitigate coding bad practices
* Add more stitch types
* Unit and integration testing
* Search and destroy repetitive code
* Order rubber duck from Amazon
* Scream into the void

---

## Skills Practiced
* Asynchronous programming
* HTTP calls and routing
* Tree data structures and traversal
    * Pre & post-order depth-first
* Stacks and queues
* Linked lists (deprecated from this code)
* Promises
* Interacting with a database
* IIFEs
* Generator functions
* Recursion
* DOM manipulation
* Event handling

---

## Challenges Encountered
* UI should allow user to reverse pattern progress, but generators can only move forward
    * Solved by reversing direction of tree traversal
* How to iterate through data structure one node at a time while having foresight to future nodes
* How to iterate through data structure at varying increments
    * stitch-by-stitch vs row-by-row
* How to track progress in a pattern when ObjectIDs are not necessarily unique to a stitch
    * They are unique to each document, but sometimes the document repeats in the pattern
* Challenges with global variables--misuse and accidental modification
* Scope of "this" keyword
    * Surprises when using arrow functions
* Writing useful error handling that actually helps me find the errors
* Expecting asynchronicity from synchronous code, and vice versa
* Variable references: reassignment, shallow copies, deep copies