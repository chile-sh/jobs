# Jobs

### Apps and Packages

Apps:
- `@jobs/api`: TRPC API for the frontend.
- `@jobs/scraper`: TRPC microservice for scraping getonbrd.
- `@jobs/web`: Main web app.
- `@jobs/worker`: Scheduler for running scraping jobs.

Packages:
- `@jobs/api-util`: Common shared methods between microservices.
- `@jobs/configs`: Shared frontend configs.
- `@jobs/eslint-config-next`
- `@jobs/eslint-config-node`
- `@jobs/tsconfig`

## Setup

In your local environment, make sure the `DEVCONTAINER_CPUS` is set to a number of cpu's below the number of total
that you have on your machine (e.g 8 cores -> 6 cores for the container)

### Run docker compose

Create a `stack.env` file:

```bash
POSTGRES_USER=jobs
POSTGRES_PASSWORD=some_password
POSTGRES_DB=jobs
```

```bash
docker compose up -d
```

### Build

To build all apps and packages, run the following command:

```bash
npm run build
```

### Develop

To start the development server for all apps run:

```bash
npm run dev
# or
turbo run dev
# or with filters
turbo run dev --filter=@jobs/worker --filter=@jobs/scraper
```

To install a dependency on a repo:

```bash
# Example
npm i fastify -w @jobs/api
```

### Run migrations

```bash
# options are --dir=up|down|latest
npm run db:migrate -w @jobs/db -- --dir=up
```

### Development

Set your git email and username:

```bash
git config --global user.email "admin@example.com"
git config --global user.name "admin"
```

Install [Commitizen](https://github.com/commitizen/cz-cli) for [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/).

```bash
pip install --user -U Commitizen

cz commit
cz bump
```

The devcontainer already comes with Commitizen and the [Conventional Commits extension](https://github.com/vivaxy/vscode-conventional-commits) for VSCode.

> Useful when TypeScript starts acting up: `find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +`
