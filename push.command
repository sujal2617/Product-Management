#!/bin/bash
# Double-click to save all changes and push them to a branch on GitHub.
# Never pushes to main: merge the branch into main yourself on GitHub.
cd "$(dirname "$0")"

finish() {
  echo
  read -n 1 -s -r -p "Press any key to close..."
  exit "$1"
}

branch="$(git branch --show-current)"

if [ "$branch" = "main" ] || [ -z "$branch" ]; then
  read -r -p "You are on main. New branch name (e.g. fix/quantity): " branch
  if [ -z "$branch" ]; then
    echo "No branch name given. Nothing pushed."
    finish 1
  fi
  git switch -c "$branch" || finish 1
fi

echo "Branch: $branch"
echo
git status --short

if [ -n "$(git status --porcelain)" ]; then
  echo
  read -r -p "What did you change? (commit message): " message
  if [ -z "$message" ]; then
    echo "No message given. Nothing pushed."
    finish 1
  fi
  git add -A
  if git diff --cached --name-only | grep -qE '(^|/)\.env'; then
    echo "Stopped: a .env file is staged. It must never go to GitHub."
    git reset -q
    finish 1
  fi
  git commit -m "$message" || finish 1
else
  echo "No new changes. Pushing existing commits."
fi

echo
git push -u origin "$branch" || finish 1

repo_url="$(git remote get-url origin | sed -e 's#^git@github.com:#https://github.com/#' -e 's#\.git$##')"
echo
echo "Pushed. Merge it into main here:"
echo "$repo_url/compare/main...$branch"
finish 0
