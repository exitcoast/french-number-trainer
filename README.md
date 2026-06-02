# French Number Trainer

Static trainer for listening comprehension of French numbers 0-100.

The public Cloudflare Pages build intentionally does not publish the local Langpractice audio cache. The deployed app uses browser text-to-speech unless `PUBLISH_AUDIO_CACHE=1` is set during the build.

## Local Work

```bash
node scripts/build-pages.mjs
```

If you have npm available locally, you can also use:

```bash
npm run build
npm run preview
```

The preview command uses Wrangler and serves the generated `dist/` directory.

## Cloudflare Pages

Production URL:

```text
https://french-number-trainer.pages.dev
```

Recommended Pages settings:

- Project name: `french-number-trainer`
- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: repository root

Manual deployment is also available:

```bash
npm run deploy:pages
```

To intentionally publish the local audio cache, run:

```bash
PUBLISH_AUDIO_CACHE=1 node scripts/build-pages.mjs
```

Only do this after confirming the source audio can be redistributed publicly.

## GitHub Workflow

Create an empty GitHub repository, then connect this local repository:

```bash
git remote add origin https://github.com/exitcoast/french-number-trainer.git
git push -u origin main
```

If SSH is configured on the machine, `git@github.com:exitcoast/french-number-trainer.git` works too.

Use `main` as the production branch. For changes:

1. Create a branch from `main`.
2. Commit the change.
3. Open a pull request.
4. Let Cloudflare Pages create a preview deployment.
5. Merge only after checking the preview.

This keeps each production deployment tied to a Git commit.

## Rollback

Use two rollback layers:

- Git rollback: revert the problematic commit and push to `main`.
- Cloudflare rollback: in Cloudflare Pages, open the project, go to deployments, select an older successful deployment, and roll back.

Cloudflare Pages keeps deployment history, so a production rollback can be done without deleting Git history.

## Useful References

- Cloudflare Pages direct upload: https://developers.cloudflare.com/pages/get-started/direct-upload/
- Cloudflare Pages Git integration: https://developers.cloudflare.com/pages/configuration/git-integration/
- Cloudflare Pages rollbacks: https://developers.cloudflare.com/pages/configuration/rollbacks/

## Project Layout

```text
number-trainer/         Source app
scripts/build-pages.mjs Cloudflare Pages build script
dist/                   Generated deployment output, ignored by Git
```
