# KSoR Hello World Handbook — Part 1 and Part 2 Completion Guideline

## 1. Introduction

This project follows the [KSoR Hello World tutorial](https://github.com/panaversity/ksor/blob/main/docs/tutorials/01-hello-world.md). It has two connected surfaces:

- **Human surface:** a Next.js handbook website for people.
- **Agent surface:** an authenticated MCP server for AI clients, including ChatGPT Work.

## 2. Part 1 — Human Surface

Codex performed the project engineering work autonomously from instructions: creating and configuring the Next.js KSoR handbook, preparing governed knowledge documents, building the record, creating and pushing the GitHub repository, and deploying the website to Netlify.

The human role was delegation, review, approval, and verification—not manual code writing. The refund policy is an approved, stable KSoR document: [Refund policy](knowledge/refund-policy.md).

## 3. Part 2 — Agent Surface

Neon/Postgres with pgvector is configured for the KSoR data and index. The publishing flow is:

`provision → refresh → published generation → MCP server`

Render hosts the public MCP service. Auth0 protects it with OAuth and RS256/JWKS bearer-token validation. ChatGPT Work was connected to the customized KSoR Handbook MCP.

## 4. Honest human-required actions

AI/LLM performed the engineering work. Some secure account actions required the account owner's manual approval:

- entering protected secrets or keys where required;
- Auth0 dashboard authorization and permission settings;
- approving the Codex third-party OAuth client; and
- granting Google login access.

This was **no manual code writing; protected account authorization required human approval**. It was not zero human action.

## 5. Final working pipeline

```text
Approved KSoR documents
→ build and refresh
→ Neon pgvector published generation
→ Render MCP server
→ Auth0 OAuth authentication
→ ChatGPT Work
→ KSoR-only answer with source and stable ID
```

## 6. Verification results

ChatGPT Work successfully answered the refund-policy question from the KSoR MCP with this verified provenance:

`Refund policy — knowledge/refund-policy`

A request about the website About page initially returned “not found” because website-visible text is not automatically MCP-searchable. It must first be added as an approved KSoR document and then published and indexed. This is correct governed behavior, not a failure or hallucination.

## 7. How to test the MCP

Use this reusable prompt:

```text
Use the KSoR Handbook MCP only.

[Ask a handbook question.]

At the end, state:
MCP used: KSoR Handbook MCP
Source: [exact document title] — [stable ID]

If the MCP does not contain it, say “not found”; do not use general knowledge.
```

## 8. Key learning

- A live website page is a human-facing page.
- An approved, indexed KSoR document is the governed source an AI agent can retrieve.
- Authentication and permission are the controlled bridge between ChatGPT Work and the MCP.

The same information is available to both audiences only when it is maintained as governed KSoR knowledge and published to the relevant surfaces.

## 9. Credits and links

- **Author:** Azmat Ali
- **Repository:** <https://github.com/azmataliakbar/KSOR-HELLO-WORLD-HANDBOOK-BY-AZMAT-ALI>
- **Live website:** <https://ksor-hello-world-handbook-by-azmat-ali.netlify.app/>
- **Protected MCP endpoint:** <https://ksor-handbook-mcp.onrender.com/mcp>

This project was built with Codex, KSoR, Neon, Render, Auth0, and ChatGPT Work.
