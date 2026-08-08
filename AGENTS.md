# AGENTS.md

## Purpose

This document defines the architectural principles that agents MUST follow
when modifying, extending, refactoring, or reviewing this codebase.

The primary goals are:

1. Keep the system modular.
2. Keep modules deep rather than shallow.
3. Reduce overall software complexity.
4. Preserve conceptual coherence.
5. Hide implementation details behind stable interfaces.
6. Make code easier for humans to understand.
7. Prevent local changes from unnecessarily increasing global complexity.

The agent MUST optimize for the long-term understandability of the system,
not merely for making the current task work.

---

# 1. Core Philosophy

## 1.1 Complexity is the primary enemy

When implementing a feature, do not ask only:

> "Does this work?"

Also ask:

> "How much complexity does this introduce?"

A solution is NOT considered good merely because:

- tests pass;
- the implementation is short;
- the feature works;
- the code follows existing patterns;
- the code is technically correct.

A good solution should also make the system easier, or at least no harder,
to reason about.

Prefer solutions where the complexity of a feature is absorbed inside a
well-designed module rather than distributed across many callers.

---

# 2. Deep Modules

## 2.1 Prefer deep modules over shallow modules

A module should provide significant functionality through a relatively small
and understandable interface.

Conceptually:

    Small interface
          ↓
    Significant implementation
          ↓
    Complex details hidden internally

Avoid:

    Large interface
          ↓
    Very little implementation
          ↓
    Complexity leaked to callers

A module is suspicious when its public API exposes many details that callers
must understand in order to use it correctly.

Before creating or modifying a module, ask:

1. What complexity does this module hide?
2. What decisions does it encapsulate?
3. How much knowledge must callers have?
4. Can the interface become smaller without reducing capability?
5. Is the module providing meaningful behavior, or merely forwarding calls?

---

## 2.2 Do not create shallow abstractions

Avoid modules whose primary purpose is to rename, forward, or slightly
rearrange calls to another module.

Examples of suspicious abstractions:

- A service that only calls a repository method.
- A repository that only forwards every method to another repository.
- A wrapper that exists only to rename an existing API.
- A DTO that adds no meaningful boundary or semantic value.
- A manager/helper/handler class containing only one-line delegations.
- Multiple layers where each layer performs almost no work.

Before creating an abstraction, identify the complexity it removes.

If the abstraction does not hide meaningful complexity, question whether it
should exist.

---

# 3. Information Hiding

Modules should hide decisions that are likely to change.

Do not expose implementation details merely because they are currently
convenient.

Examples of details that may deserve hiding:

- database implementation;
- serialization format;
- external API details;
- caching strategy;
- retry policy;
- authentication mechanism;
- internal data structures;
- algorithmic decisions;
- persistence details;
- infrastructure-specific behavior.

A caller should depend primarily on what a module does, rather than how it
does it.

When evaluating an interface, ask:

> "If the implementation changes tomorrow, how many consumers need to change?"

A good boundary minimizes the answer.

---

# 4. Pull Complexity Downward

When a lower-level module can absorb complexity in order to simplify its
callers, prefer doing so.

Bad:

    Caller A ─┐
    Caller B ─┼─> each handles the same complexity
    Caller C ─┘

Prefer:

    Caller A ─┐
    Caller B ─┼─> Deep Module ─> complexity handled once
    Caller C ─┘

Do not force every caller to understand:

- validation rules;
- retry behavior;
- error normalization;
- database quirks;
- protocol details;
- state transitions;
- edge cases;
- infrastructure constraints.

If the same conceptual complexity appears in multiple consumers, investigate
whether it belongs inside a deeper module.

---

# 5. Conceptual Coherence

A module should represent a coherent concept.

Do not group functionality merely because:

- it is related to the same database table;
- it uses the same framework;
- it happens to be called from the same controller;
- it was convenient to place it there.

Ask:

> "What is the central idea that explains why all of these responsibilities
> belong together?"

If there is no concise answer, the module may contain unrelated concepts.

A coherent module should be explainable in a few sentences without listing
every method it contains.

---

# 6. Together or Apart

Keep code together when:

- it changes for the same reasons;
- it represents the same concept;
- understanding one requires understanding the other;
- separating it would force callers to know implementation details.

Separate code when:

- it changes independently;
- it represents a different concept;
- coupling would create unnecessary dependencies;
- the module would otherwise become difficult to reason about.

Do not split code merely because a class or file became "large".

Size alone is not sufficient evidence of poor modularity.

A large, coherent module can be better than several small, shallow modules.

---

# 7. Avoid Premature Decomposition

Do not split a module simply to satisfy arbitrary metrics such as:

- number of lines;
- number of methods;
- number of dependencies;
- class size;
- file size.

Decomposition should be driven by conceptual boundaries.

Prefer:

    One deep module containing a coherent concept

over:

    Five shallow modules containing fragments of the same concept.

When uncertain, favor preserving locality until a meaningful boundary becomes
clear.

---

# 8. Interfaces Should Be Smaller Than Implementations

The implementation may contain substantial complexity.

The interface should expose only what consumers actually need.

Avoid interfaces that expose:

- internal state;
- unnecessary configuration;
- implementation-specific operations;
- database details;
- framework-specific types;
- internal lifecycle methods.

Every public method increases the conceptual surface area of a module.

Treat public APIs as expensive.

Before adding a public member, ask:

1. Who needs it?
2. Why must it be public?
3. Is this capability part of the module's core abstraction?
4. Could the same result be achieved through an existing operation?
5. Does exposing it leak implementation details?

---

# 9. Prefer General-Purpose Modules

When a module is expected to serve multiple contexts, prefer an abstraction
based on the underlying concept rather than one based on a single caller.

Avoid abstractions such as:

    UserOrderValidationService
    AdminOrderValidationService
    CreateOrderValidationService

when the underlying concept is simply:

    OrderValidation

However, do not generalize merely because two pieces of code currently look
similar.

Similarity is not necessarily a shared abstraction.

A shared abstraction should exist when the code shares the same underlying
concept and is likely to evolve together.

---

# 10. Avoid Configuration Complexity

Configuration is often a form of hidden complexity.

Do not create highly configurable modules when a simpler, opinionated module
can satisfy the actual requirements.

Avoid APIs such as:

    createThing(
        optionA,
        optionB,
        optionC,
        optionD,
        optionE,
        optionF
    )

when most callers require the same behavior.

Prefer a small interface with sensible defaults.

Configuration should exist when the variation represents a meaningful
difference in behavior, not merely because the implementation can technically
support it.

---

# 11. Error Handling

Prefer APIs that make invalid states difficult or impossible to represent.

Do not force every caller to repeatedly perform the same defensive checks.

Bad:

    result = operation()

    if result is None:
        ...
    elif result.status == ...
    elif result.status == ...
    elif ...

when the underlying abstraction could provide a clearer semantic result.

Errors should be handled at the level where the system has enough context to
make a meaningful decision.

Do not propagate low-level implementation details upward unless callers
actually need them.

---

# 12. Comments

Comments should explain things that are difficult to infer from the code.

Good comments explain:

- why a decision exists;
- why an apparently simpler implementation is incorrect;
- important invariants;
- non-obvious constraints;
- architectural trade-offs.

Avoid comments that merely restate the code.

Bad:

    # Get the user
    user = repository.get_user(id)

Good:

    # The external provider can return a stale identity for up to 60 seconds.
    # We therefore do not immediately invalidate the local identity here.

The goal is to preserve knowledge that would otherwise be lost.

---

# 13. Naming

Names should communicate concepts, not implementation mechanics.

Prefer:

    InvoiceCalculator

over:

    InvoiceHelper

Prefer:

    PaymentPolicy

over:

    PaymentUtils

Avoid vague names such as:

- Utils
- Helper
- Manager
- Common
- Misc
- Handler
- Processor

unless the name genuinely represents a well-defined concept.

A vague name is often evidence that the module itself lacks a clear
responsibility.

---

# 14. Duplication

Do not eliminate duplication mechanically.

Before extracting duplicated code, determine whether the duplicated code
represents the same concept.

There are two different situations:

### Accidental duplication

Two implementations perform the same conceptual operation.

Consider extracting a shared abstraction.

### Coincidental duplication

Two implementations currently look similar but represent different concepts.

Keep them separate until a genuine common abstraction emerges.

Premature abstraction can create stronger coupling than duplication.

---

# 15. Change Amplification

Prefer designs where a conceptual change requires changes in a small number
of places.

When implementing a feature, estimate:

> "If this requirement changes, how many files/modules will probably need to
> change?"

If a simple conceptual change requires modifying many unrelated modules,
investigate whether the architecture is leaking complexity.

Avoid designs where:

    One business rule
        ↓
    Controller
        ↓
    Service
        ↓
    Mapper
        ↓
    Repository
        ↓
    Utility
        ↓
    Configuration

must all be modified for a single conceptual change.

Layers should exist because they hide meaningful complexity, not because
architectural diagrams contain boxes.

---

# 16. Locality

Prefer code that allows a developer to understand a concept without navigating
through many files.

Good modularity improves locality.

When related behavior is scattered across many modules, ask whether the
separation is actually providing useful information hiding.

Optimize for:

> "How many places must a developer read to understand this behavior?"

not merely:

> "How small can each file become?"

---

# 17. When Modifying Existing Code

Before changing an existing module:

1. Identify its responsibility.
2. Identify what complexity it currently hides.
3. Identify its public interface.
4. Identify its consumers.
5. Identify duplicated concepts around it.
6. Identify whether the proposed change strengthens or weakens the boundary.
7. Determine whether the change should be absorbed by the module or exposed
   to its callers.

Do not refactor unrelated code merely because it could be improved.

Avoid opportunistic architectural changes unless they are necessary for the
requested change or clearly reduce significant complexity.

---

# 18. When Creating a New Module

Before creating a module, answer:

### Responsibility

What single conceptual responsibility does this module own?

### Complexity

What complexity does this module hide?

### Interface

What is the smallest useful interface?

### Consumers

What knowledge would callers otherwise need to possess?

### Stability

Which implementation decisions can change without affecting callers?

### Cohesion

Why do the elements of this module belong together?

### Depth

Is this module deep enough to justify its existence?

If these questions cannot be answered clearly, reconsider the abstraction.

---

# 19. Refactoring Heuristics

When reviewing code, actively look for:

- shallow modules;
- excessive delegation;
- unnecessary layers;
- leaking implementation details;
- duplicated business rules;
- fragmented concepts;
- excessive public APIs;
- vague abstractions;
- premature generalization;
- configuration explosion;
- unnecessary indirection;
- change amplification;
- poor locality;
- comments compensating for unclear abstractions.

Do not automatically refactor every occurrence.

First determine whether it contributes meaningful complexity.

---

# 20. Human Readability

The codebase is maintained by humans.

The primary audience of the architecture is therefore not the framework,
compiler, or AI agent.

Prefer code that can be understood by reading it sequentially.

When two implementations are functionally equivalent, prefer the one that
requires less mental context.

Favor:

- explicit concepts;
- meaningful names;
- predictable control flow;
- localized complexity;
- cohesive modules;
- small interfaces;
- obvious dependencies.

Avoid cleverness.

Code should not require the reader to reconstruct the author's mental model
before understanding what it does.

---

# 21. Agent Behavior

The agent MUST NOT optimize solely for completing the immediate task.

Before implementing a non-trivial change, inspect the surrounding architecture.

The agent SHOULD:

1. Understand existing modules before creating new ones.
2. Reuse existing deep abstractions when appropriate.
3. Prefer extending a coherent module over creating a new shallow module.
4. Question unnecessary abstractions.
5. Identify where complexity belongs.
6. Minimize the number of concepts a caller must understand.
7. Keep implementation details hidden.
8. Preserve conceptual locality.
9. Explain architectural trade-offs when they are non-obvious.

The agent MUST NOT:

- create abstractions solely to reduce file size;
- create interfaces solely because "interfaces are good";
- create services that only delegate;
- create repositories that only forward calls without adding meaningful
  abstraction;
- introduce generic utilities for small amounts of duplicated code without
  establishing a shared concept;
- split coherent modules without a meaningful boundary;
- expose implementation details for convenience;
- add configuration without a real requirement;
- introduce layers solely to follow a pattern.

---

# 22. Decision Rule

When choosing between two valid implementations, prefer the one that:

1. hides more complexity;
2. exposes less unnecessary information;
3. has a deeper module;
4. has a smaller conceptual interface;
5. keeps related concepts together;
6. minimizes change amplification;
7. improves locality;
8. requires less knowledge from callers;
9. is easier for another developer to understand.

The shortest implementation is NOT necessarily the simplest implementation.

The most abstract implementation is NOT necessarily the most reusable
implementation.

The smallest file is NOT necessarily the best module.

The goal is not minimal code.

The goal is minimal cognitive complexity.

---

# 23. Final Review

Before considering a change complete, ask:

- Did I introduce a new concept unnecessarily?
- Did I create a shallow module?
- Did I expose implementation details?
- Did I spread complexity across callers?
- Did I add an abstraction merely because two things looked similar?
- Did I increase the public API without necessity?
- Did I introduce another layer that mostly delegates?
- Is the module conceptually coherent?
- Can the module be explained simply?
- Can a developer understand the behavior without reading many files?
- If this requirement changes, how many places will need modification?
- Did I make the system easier or harder to reason about?

If the answer to the last question is "harder", reconsider the design.