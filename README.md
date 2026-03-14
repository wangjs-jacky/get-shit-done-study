# Get Shit Done Study

A learning project for understanding the [get-shit-done](https://github.com/discreteprojects/get-shit-done) framework - an AI-assisted development workflow for Claude Code.

[中文文档](./README_CN.md)

## Overview

This project is dedicated to deep-diving into the GSD (Get Shit Done) framework, understanding its architecture, and extracting reusable patterns for AI-assisted development.

## Learning Goals

### 1. Framework Capabilities Analysis
- Understand the overall architecture design of GSD
- Master the responsibilities and collaboration of each component
- Analyze how the framework achieves "goal-driven development workflow"

### 2. Core Concepts

| Concept | Description |
|---------|-------------|
| **Roadmap** | Project roadmap containing milestones and phases |
| **Milestone** | A complete feature set |
| **Phase** | Development stage, a subtask unit of milestone |
| **Agent** | Specialized sub-agent for specific task types |
| **Hook** | Hook functions triggered at specific timing |

### 3. Component Structure

```
get-shit-done/
├── agents/          # Sub-agent definitions
├── commands/        # Slash commands
├── hooks/           # Git/Claude hooks
├── scripts/         # Helper scripts
└── tests/           # Test cases
```

### 4. Technique Extraction
- Agent orchestration patterns
- State management and persistence
- Interaction design for user confirmations
- Error handling and recovery

## Questions Driving the Learning

This project follows a question-driven approach to learning. Key areas include:

- Architecture design patterns
- Agent implementation details
- State management mechanisms
- User interaction flows
- Reusable techniques for other projects

## Resources

- [GitHub Repository](https://github.com/discreteprojects/get-shit-done)
- [Chinese README](./get-shit-done/README.zh-CN.md)
- [Changelog](./get-shit-done/CHANGELOG.zh-CN.md)

## License

MIT
