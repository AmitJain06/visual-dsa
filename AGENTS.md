# Repository agent instructions

Before changing any files in this repository:

1. Read this file.
2. Read every file under `agentFiles/`, recursively, and follow its instructions. Recheck the directory at the start of each new task that edits files so newly added guidance is included.
3. If a file under `agentFiles/` cannot be read, stop before making edits and report which file could not be read.

Add repository-specific guidance as files under `agentFiles/`. Keep this root file as the required entry point so all guidance in that directory is discovered before changes.

When creating a new Angular component, refer to `agentFiles/component-creation.md` and follow its component-specific rules.

When creating or changing the visual canvas or its shape system, refer to `agentFiles/canvas-architecture.md` and follow its architecture rules.

When creating or changing any canvas shape, refer to `agentFiles/shape.md` and follow its shape design and shared properties toolbar rules.
