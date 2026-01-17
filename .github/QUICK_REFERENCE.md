# GitHub Actions Quick Reference

## 🚀 Quick Commands

```bash
# Push changes and trigger CI/CD
git add .
git commit -m "Your commit message"
git push origin main          # Triggers CI + Deploy
git push origin develop       # Triggers CI only

# Create a pull request
git checkout -b feature/new-feature
git push origin feature/new-feature
# Then create PR on GitHub → Triggers CI + Dependency Review
```

## 📊 Monitoring URLs

- **Actions Dashboard**: `https://github.com/stevenselcuk/thehangar/actions`
- **Live Site**: `https://stevenselcuk.github.io/thehangar/` (after first deploy)
- **Security Alerts**: `https://github.com/stevenselcuk/thehangar/security`
- **Dependency Graph**: `https://github.com/stevenselcuk/thehangar/network/dependencies`

## ⚡ Workflow Triggers

| Workflow          | Trigger          | When                         |
| ----------------- | ---------------- | ---------------------------- |
| CI/CD             | Push/PR          | Every commit to main/develop |
| Dependency Review | PR               | When dependencies change     |
| Health Check      | Schedule         | Every Monday at 9 AM UTC     |
| CodeQL            | Push/PR/Schedule | Code changes + weekly scan   |

## 🛠️ Manual Workflow Trigger

```bash
# Via GitHub UI:
1. Go to Actions tab
2. Select workflow (e.g., "Codebase Health Check")
3. Click "Run workflow"
4. Choose branch
5. Click "Run workflow" button
```

## 🔧 Local Testing

```bash
# Install dependencies
npm ci

# Run the same checks as CI
npm run lint              # ESLint
npm run test:run          # Unit tests
npm run test:coverage     # With coverage
npm run test:e2e          # Playwright E2E
npm run build             # Production build
```

## 📦 Artifacts

After workflow runs, download artifacts:

1. Go to Actions tab
2. Click on a workflow run
3. Scroll to "Artifacts" section
4. Download: coverage-report, playwright-report, dist

## 🐛 Debugging Failed Workflows

```bash
# Check logs in Actions tab
# Or run locally:

# Lint
npm run lint

# Tests with verbose output
npm run test:run -- --reporter=verbose

# E2E with UI
npm run test:e2e:ui

# Check build
npm run build
```

## 🔐 Secrets Setup

Add secrets in: Settings → Secrets and variables → Actions

| Secret Name     | Required | Purpose                   |
| --------------- | -------- | ------------------------- |
| `CODECOV_TOKEN` | Optional | Coverage reporting        |
| `DEPLOY_KEY`    | No       | (Handled by GitHub Pages) |

## ⚙️ Configuration Files

| File                                      | Purpose                       |
| ----------------------------------------- | ----------------------------- |
| `.github/workflows/ci.yml`                | Main CI/CD pipeline           |
| `.github/workflows/dependency-review.yml` | Dependency security           |
| `.github/workflows/health-check.yml`      | Weekly health checks          |
| `.github/workflows/codeql.yml`            | Security scanning             |
| `.env.example`                            | Environment variable template |

## 📈 Performance Tips

✅ Workflows use dependency caching (saves ~30 seconds per run)  
✅ Jobs run in parallel (saves ~2 minutes total)  
✅ Artifacts expire after 7 days (saves storage)  
✅ Cancel outdated runs automatically (saves minutes)

## 🎯 Success Checklist

- [ ] GitHub Pages enabled (Settings → Pages)
- [ ] First workflow run completed successfully
- [ ] Site is live at GitHub Pages URL
- [ ] Badges showing in README
- [ ] (Optional) Codecov token added
- [ ] (Optional) Update VITE_BASE_PATH if repo name changed

## 💡 Common Issues

**Issue:** Deploy fails with 404  
**Fix:** Enable GitHub Pages with "GitHub Actions" source

**Issue:** Tests fail but pass locally  
**Fix:** Check for hardcoded localhost URLs

**Issue:** Build fails with "out of memory"  
**Fix:** Add `NODE_OPTIONS=--max-old-space-size=4096` to build step

**Issue:** E2E tests timeout  
**Fix:** Increase timeout in `playwright.config.ts`

## 📞 Need Help?

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Troubleshooting Guide](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows)
- Check [WORKFLOWS.md](.github/WORKFLOWS.md) for detailed info

---

**Status Check:**

```bash
# View all workflow statuses
gh run list  # requires GitHub CLI

# Or visit:
# https://github.com/stevenselcuk/thehangar/actions
```
