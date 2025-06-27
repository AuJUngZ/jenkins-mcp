# Contributing to Jenkins Server MCP

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the code builds successfully.
5. Make sure your code lints.
6. Issue that pull request!

## Development Setup

1. Clone your fork:

```bash
git clone https://github.com/yourusername/jenkins-server-mcp.git
cd jenkins-server-mcp
```

2. Install dependencies:

```bash
npm install
```

3. Set up your environment:

```bash
cp .env.example .env
# Edit .env with your Jenkins credentials
```

4. Build and test:

```bash
npm run build
npm run dev
```

## Coding Style

- Use TypeScript for all new code
- Follow the existing code style and structure
- Add proper type definitions
- Include error handling
- Write clear, descriptive commit messages

## Project Structure

When adding new features, follow this structure:

- **Types**: Add interfaces in `src/types/index.ts`
- **Services**: Add business logic in `src/services/`
- **Tools**: Add MCP tool definitions in `src/tools/`
- **Utils**: Add utility functions in `src/utils/`
- **Config**: Add configuration in `src/config/`

## Testing

Currently, this project doesn't have automated tests, but we encourage:

- Manual testing of all changes
- Testing with different Jenkins configurations
- Validation of error handling paths

## Bug Reports

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/yourusername/jenkins-server-mcp/issues).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Feature Requests

We welcome feature requests! Please:

1. Check if the feature has already been requested
2. Describe the feature in detail
3. Explain why it would be useful
4. Consider how it fits with the project's goals

## License

By contributing, you agree that your contributions will be licensed under its MIT License.

## Questions?

Feel free to open an issue for any questions about contributing!
