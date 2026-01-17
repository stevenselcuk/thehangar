# GitHub Actions Workflows

This project uses GitHub Actions for continuous integration and deployment. Below are the configured workflows:

## 🔧 CI/CD Pipeline (`ci.yml`)

**Triggers:** Push and Pull Requests to `main` and `develop` branches

**Jobs:**

1. **Install Dependencies** - Caches node_modules for faster subsequent runs
2. **Lint Code** - Runs ESLint to check code quality
3. **Unit Tests & Coverage** - Runs Vitest tests with coverage reporting
4. **E2E Tests** - Runs Playwright browser tests
5. **Build** - Creates production build
6. **Deploy** - Deploys to GitHub Pages (only on push to `main`)

**Features:**

- ✅ Parallel job execution for speed
- ✅ Dependency caching
- ✅ Coverage reports uploaded to Codecov
- ✅ Test artifacts saved for 7 days
- ✅ Automatic cancellation of outdated runs

## 🔒 Dependency Review (`dependency-review.yml`)

**Triggers:** Pull Requests to `main` and `develop`

**Purpose:** Automatically reviews dependency changes in PRs for security vulnerabilities and license issues.

## 🏥 Health Check (`health-check.yml`)

**Triggers:**

- Scheduled (every Monday at 9 AM UTC)
- Manual dispatch

**Purpose:** Weekly automated checks of codebase health, including linting, tests, and outdated dependencies.

---

## 🚀 Setup Instructions

### 1. Enable GitHub Pages

To enable the deployment workflow:

1. Go to your repository **Settings** → **Pages**
2. Under "Build and deployment", select **Source: GitHub Actions**
3. The site will be deployed automatically on push to `main`

### 2. Optional: Enable Codecov (for coverage reports)

1. Sign up at [codecov.io](https://codecov.io)
2. Add your repository
3. Get your `CODECOV_TOKEN`
4. Add it to **Repository Settings** → **Secrets and variables** → **Actions** → **New repository secret**
5. Name: `CODECOV_TOKEN`, Value: (your token)

### 3. Configure Vite Base Path (for GitHub Pages)

If your repository is not at the root (e.g., `https://username.github.io/thehangar/`), update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/thehangar/', // Replace with your repo name
  // ... rest of config
});
```

---

## 📊 Workflow Status

Check the status of all workflows:

- [Actions Tab](../../actions)
- Or view badges in [README.md](../../README.md)

---

## 🛠️ Local Testing

Test your workflows locally before pushing:

```bash
# Install act (https://github.com/nektos/act)
brew install act

# Run a specific workflow
act -j test

# Run all workflows
act push
```

---

## 💡 Tips

- **Cost**: All workflows use free GitHub Actions minutes (2,000/month for public repos, unlimited for public repos on free plan)
- **Speed**: Workflows typically complete in 3-5 minutes
- **Debugging**: Check the Actions tab for detailed logs
- **Customization**: Edit `.yml` files to adjust triggers, jobs, or steps
