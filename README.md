# GitHub Activity CLI

A simple command-line tool to fetch and display a GitHub user's recent activity.

## Features

- View recent GitHub activity for any user
- Simple and fast ⚡
- No configuration needed

## Installation

### Global Installation (Recommended)

```bash
npm i -g @bellvoud/github-activity-cli
```

### Local Installation

```bash
# Clone the repository
git clone https://github.com/bellvoud/github-activity-cli.git
cd github-activity-cli

# Install and link
npm link
```

## Usage

```bash
github-activity <username>
```

### Example

```bash
github-activity kamranahmedse
```

### Output

```
Output:
- Pushed 3 commits to kamranahmedse/developer-roadmap
- Opened a new issue in kamranahmedse/developer-roadmap
- Starred kamranahmedse/developer-roadmap
```

## Requirements

- Node.js >= 14.0.0

## Supported Activities

- Push commits
- Open/close issues
- Star repositories
- Fork repositories
- Create repositories
- Pull requests
- And more!

## Project

This project is from [roadmap.sh](https://roadmap.sh/projects/github-user-activity).
