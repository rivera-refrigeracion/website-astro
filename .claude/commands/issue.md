---
description: General-purpose issue workflow with deep investigation, planning, and progress tracking
allowed-tools:
  [
    Task,
    TodoWrite,
    TodoRead,
    Read,
    Grep,
    Glob,
    Bash,
    AskUserQuestion,
    WebFetch,
    WebSearch,
    mcp__sequential-thinking__sequentialthinking,
    mcp__context7__resolve-library-id,
    mcp__context7__query-docs,
    mcp__claude-in-chrome__*,
  ]
---

# Issue Workflow Command

I'm starting work on issue $ARGUMENTS. Following a comprehensive workflow with investigation, planning, and implementation tracking.

## Phase 0: Issue Source Detection & Retrieval

1. **Attempt to fetch issue from GitHub**:

   ```bash
   # Try to get issue using gh CLI
   gh issue view $ARGUMENTS --json title,body,state,labels,comments
   ```

2. **If GitHub CLI fails or issue not found**:
   - Use AskUserQuestion to determine issue source:
     - GitHub (different repo?)
     - Jira/Atlassian
     - Linear
     - GitLab
     - Asana
     - Manual description (no issue tracker)
   - Based on answer, fetch issue details using appropriate method:
     - Different GitHub repo: Ask for repo URL
     - Jira: Use Atlassian MCP if available
     - Manual: Ask user to provide requirements
     - Web-based: Use Chrome MCP to navigate and extract details

3. **Extract core issue information**:
   - Issue ID/number
   - Title and description
   - Acceptance criteria
   - Labels/tags/priority
   - Comments and discussion
   - Related issues or dependencies
   - Any linked documentation

## Phase 1: Deep Investigation & Context Gathering

**Goal**: Understand the problem completely before planning solutions.

### 1.1 Requirements Analysis

- **Parse issue description** for explicit requirements
- **Identify acceptance criteria** (what defines "done")
- **Extract technical constraints** (must use X, avoid Y)
- **Note user stories or use cases**
- **Identify edge cases** mentioned in comments

### 1.2 Codebase Investigation

Use Task tool for thorough exploration:

- **Search for related code**:
  ```bash
  # Find existing implementations
  # Search for similar features
  # Identify patterns to follow
  ```
- **Analyze current architecture** where changes needed
- **Find integration points** with existing systems
- **Review test patterns** for similar features
- **Check for existing utilities** that can be reused

### 1.3 External Research (When Needed)

**Use Context7 MCP** for technical documentation:

- Library/framework APIs you need to use
- Best practices for specific technologies
- Integration patterns with third-party services
- Example implementations

**Use Chrome MCP** for web-based research:

- Navigate to relevant documentation sites
- Extract code examples from tutorials
- Review GitHub issues in related projects
- Check StackOverflow for similar problems

**Use AskUserQuestion** for clarifications:

- Ambiguous requirements
- Technology choices (multiple valid approaches)
- Priority decisions (what's must-have vs nice-to-have)
- User preferences (approach A vs B)

### 1.4 Dependency Analysis

- **External libraries** needed (check if already available)
- **API integrations** required
- **Database changes** needed
- **Environment variables** or configuration
- **Breaking changes** that affect other parts of system

## Phase 2: Solution Planning with Sequential Thinking

**CRITICAL**: Always plan before implementing. No coding without approved plan.

### 2.1 Deploy Sequential Thinking

Use `mcp__sequential-thinking__sequentialthinking` to:

- **Break down the problem** into atomic steps
- **Identify dependencies** between tasks
- **Generate solution hypotheses** and verify them
- **Consider alternative approaches**
- **Revise understanding** as complexity reveals itself
- **Document reasoning process**

Create: `.ai/issues/{ISSUE-ID}_Thinking_Process.md`

### 2.2 Create Implementation Plan

Document: `.ai/issues/{ISSUE-ID}_Implementation_Plan.md`

**Contents**:

```markdown
# Issue {ISSUE-ID}: {Title}

## Requirements Summary

- Core requirement 1
- Core requirement 2
- Acceptance criteria

## Technical Approach

### Chosen Solution

[Describe approach and why it's best]

### Alternative Approaches Considered

- Option A: [pros/cons]
- Option B: [pros/cons]

### Architecture Decisions

- Where code will live (files/folders)
- What patterns to follow
- How it integrates with existing code

## Implementation Steps

1. Phase 1: [Foundation work]
   - Task 1.1
   - Task 1.2
2. Phase 2: [Core implementation]
   - Task 2.1
   - Task 2.2
3. Phase 3: [Testing & polish]
   - Task 3.1
   - Task 3.2

## Files to Create/Modify

- `path/to/file1.ext` - Purpose
- `path/to/file2.ext` - Purpose

## Dependencies & Prerequisites

- Library X (install via package manager)
- Configuration Y (add to .env)
- Database migration Z

## Testing Strategy

- Unit tests for components
- Integration tests for feature
- Manual testing scenarios

## Risks & Mitigation

- Risk 1: [how to handle]
- Risk 2: [how to handle]

## Security Considerations

- Input validation
- Authentication/authorization
- Data protection

## Performance Considerations

- Expected load
- Optimization opportunities
- Monitoring needs
```

### 2.3 Present Plan for Approval

**⚠️ MANDATORY: Wait for explicit user approval ⚠️**

Present:

1. Your recommended approach
2. Why this approach is best
3. Estimated complexity/effort
4. Any tradeoffs or limitations

Ask explicitly: **"Should I proceed with this implementation plan?"**

Do NOT proceed to Phase 3 without clear user confirmation.

## Phase 3: Implementation with Progress Tracking

### 3.1 Initialize Progress Tracking

Create: `.ai/issues/{ISSUE-ID}_Implementation_Progress.md`

Use TodoWrite to create task list based on implementation plan.

### 3.2 Implement Changes

Follow the approved plan:

- Work through tasks sequentially
- Mark tasks complete with TodoWrite as you go
- Document decisions and changes in progress file

### 3.3 Document Work Performed

Update progress file with:

```markdown
## Files Created/Modified

- `path/to/file` - What changed and why

## Features Implemented

- Feature 1: Description and approach

## Challenges Encountered

- Challenge: How we solved it

## Code Patterns Used

- Pattern 1: Where and why

## Testing Performed

- Test type: Results
```

## Phase 4: Quality Assurance

### 4.1 Self-Review Checklist

- [ ] All acceptance criteria met
- [ ] Code follows project conventions
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Security considerations addressed
- [ ] Performance is acceptable
- [ ] Error handling comprehensive

### 4.2 Create QA Report

Document: `.ai/issues/{ISSUE-ID}_QA_Report.md`

Include:

- What was tested
- Test results (pass/fail)
- Known limitations
- Recommendations for further testing

### 4.3 Run Quality Checks

Execute project-specific quality commands:

- Linting
- Type checking
- Unit tests
- Integration tests
- Build verification

## Phase 5: Completion & Handoff

### 5.1 Prepare Summary

Create concise summary of:

- What was implemented
- How it works
- How to test it
- Any setup required

### 5.2 Present for Review

**NEVER perform git operations without explicit user consent**

Show user:

1. Changes made (git diff summary)
2. Files modified/created
3. Test results
4. How to verify the fix

### 5.3 Documentation Updates (if applicable)

- Update README if user-facing changes
- Update API docs if interface changed
- Add to CHANGELOG under `[Unreleased]`
- Update architecture docs if structure changed

### 5.4 Git Operations (Only When Requested)

**Wait for explicit user instruction before**:

- Staging files
- Creating commits
- Pushing to remote

When user requests commit:

- Use descriptive commit messages
- Follow project's commit conventions
- Stage only relevant files (never `git add .`)
- Review changes before committing

### 5.5 Pull Request Creation (Only When Requested)

When user requests PR:

- Create clear title and description
- Reference issue properly
- Include testing instructions
- Note any breaking changes
- Add screenshots/demos if UI changes

## Investigation Tools Reference

### When to Use Each Tool

**Task Tool (Explore Agent)**:

- Finding code patterns across codebase
- Understanding existing implementations
- Discovering architectural patterns
- Multi-file investigation

**Context7 MCP**:

- Looking up library/framework documentation
- Finding API reference for dependencies
- Learning best practices for technology
- Getting code examples

**Chrome MCP**:

- Navigating web documentation
- Extracting information from web pages
- Researching similar implementations
- Reading online tutorials

**AskUserQuestion**:

- Clarifying ambiguous requirements
- Choosing between valid approaches
- Understanding user priorities
- Getting missing information

**Sequential Thinking MCP**:

- Complex problem decomposition
- Planning multi-step solutions
- Evaluating tradeoffs
- Documenting reasoning

**Grep/Glob/Read**:

- Quick file searches
- Reading specific files
- Searching for exact patterns
- Local codebase exploration

## Workflow Rules

**Investigation Phase**:

- ✅ Use all available tools to understand completely
- ✅ Ask questions when requirements unclear
- ✅ Research unfamiliar technologies
- ✅ Find existing patterns to follow
- ❌ Don't guess at requirements
- ❌ Don't skip investigation

**Planning Phase**:

- ✅ Create detailed implementation plan
- ✅ Document reasoning and alternatives
- ✅ Get explicit user approval
- ✅ Use Sequential Thinking for complex problems
- ❌ Don't start coding without plan
- ❌ Don't assume user approval

**Implementation Phase**:

- ✅ Follow approved plan
- ✅ Track progress with TodoWrite
- ✅ Document changes thoroughly
- ✅ Test as you go
- ❌ Don't deviate from plan without discussion
- ❌ Don't skip testing

**Completion Phase**:

- ✅ Present work for review
- ✅ Wait for explicit approval for git operations
- ✅ Follow project's commit conventions
- ❌ Don't commit without permission
- ❌ Don't push without verification

## Success Criteria

Issue is complete when:

- ✅ All acceptance criteria met
- ✅ Implementation matches approved plan
- ✅ Tests written and passing
- ✅ Code reviewed and approved
- ✅ Documentation updated
- ✅ Changes committed and pushed (when user requests)
- ✅ User confirms feature works as expected

**Ready to fetch and analyze issue $ARGUMENTS.**
