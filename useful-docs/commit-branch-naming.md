# Commit & Branch Naming Convention

Quick reference for commit types and branch naming.

## Commit Types

Use these prefixes for all commits:

| Prefix      | Usage                              | Example                                 |
| ----------- | ---------------------------------- | --------------------------------------- |
| `feat:`     | New feature                        | `feat: add item form modal`             |
| `fix:`      | Bug fix                            | `fix: hide button not working`          |
| `refactor:` | Code restructure (no logic change) | `refactor: extract FilterBar component` |
| `style:`    | CSS/styling changes                | `style: update card shadows`            |
| `docs:`     | Documentation updates              | `docs: add README screenshots`          |
| `chore:`    | Setup, deps, configs               | `chore: install gh-pages`               |
| `test:`     | Tests (if added)                   | `test: add filter logic tests`          |

**Format:** `type: short description (lowercase, no period)`

## Branch Naming

Follow the roadmap stage structure:

| Stage | Branch Name             | Example                 |
| ----- | ----------------------- | ----------------------- |
| 1     | `stage/1-setup`         | `stage/1-setup`         |
| 2     | `stage/2-ui-shell`      | `stage/2-ui-shell`      |
| 3     | `stage/3-reducer`       | `stage/3-reducer`       |
| 4     | `stage/4-item-display`  | `stage/4-item-display`  |
| 5     | `stage/5-edit-remove`   | `stage/5-edit-remove`   |
| 6     | `stage/6-filter-search` | `stage/6-filter-search` |
| 7     | `stage/7-persistence`   | `stage/7-persistence`   |
| 8     | `stage/8-roles`         | `stage/8-roles`         |
| 9     | `stage/9-theme`         | `stage/9-theme`         |
| 10    | `stage/10-deploy`       | `stage/10-deploy`       |

**Format:** `stage/N-feature-name` (lowercase, hyphens for spaces)

## Quick Examples

```
# Commit while on stage/2-ui-shell branch
git commit -m "feat: add navbar component"
git commit -m "style: set up CSS variables"
git commit -m "refactor: split ItemCard styles"

# Branch switching
git checkout -b stage/2-ui-shell
git checkout -b stage/3-reducer
```

## Tips

- **One commit per meaningful step** within each stage
- Branches are per stage (not per feature within a stage)
- Commit messages help you track progress when demoing to teacher


### Suggested Commit History for Lab 6

*   `feat(project): initialize vite react application`
*   `docs(theory): summarize react context vs props limitations`
*   `style(layout): implement responsive grid using 1fr units`
*   `feat(context): create collection provider and reducer`
*   `feat(item-card): add three-dot menu for item actions`
*   `refactor(item-list): move visible items logic to local filter`
*   `fix(context): resolve stale state in remove_item action`
*   `feat(item-card): implement toggle_hide with dispatcher`
*   `style(theme): define css variables for dark mode support`
*   `feat(forms): add uncontrolled inputs for new item creation`
*   `refactor(app): wrap main components in collection provider`
*   `feat(routing): setup basic navigation for different views`
*   `fix(ui): prevent modal closing when clicking inside form`
*   `feat(search): add local state filter for item titles`
*   `docs(roadmap): update stage 5 completion status`
*   `style(item-card): add transition effects for hover states`
*   `feat(roles): restrict delete button to admin users`
*   `chore(deps): install lucide-react for menu icons`
*   `fix(git): update .gitignore to exclude build artifacts`
*   `feat(deployment): configure build script for production`