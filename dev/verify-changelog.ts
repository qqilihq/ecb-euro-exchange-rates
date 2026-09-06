/**
 * Verifies that changelog.md is ready to be released. It never modifies the
 * file — promoting `[Unreleased]` to the new version is the releaser's job, so
 * the wording, grouping and date land in a reviewed commit rather than being
 * rewritten at tag time.
 *
 * Wired into both release lifecycle scripts:
 *
 *     "preversion": "… && tsx ./dev/verify-changelog.ts"
 *     "version": "tsx ./dev/verify-changelog.ts --match-version"
 *
 * `preversion` runs before the bump, so the common “I forgot to promote it”
 * case fails while the working tree is still clean. `version` runs after the
 * bump, which is the only point at which the new version number is known, so
 * that is where the heading is checked against it.
 */
import path from 'node:path';
import fs from 'node:fs';

const rootDir = path.join(__dirname, '..');
const changelogPath = path.join(rootDir, 'changelog.md');
const packagePath = path.join(rootDir, 'package.json');

const unreleasedHeading = '## [Unreleased]';
const versionHeadingPattern = /^## \[(\d+\.\d+\.\d+)\] [–-] (\d{4}-\d{2}-\d{2})$/m;
const unreleasedLinkPattern = /^\[unreleased\]: (\S+)\/compare\/v(\S+)\.\.\.HEAD$/im;

/** Reports the problem and stops, without a stack trace — this is a message
 * for whoever is releasing, not a crash. */
function fail(message: string): never {
  console.error(`\nchangelog.md is not ready to release.\n\n${message}\n`);
  // The `never` return type lets the checks above narrow their values.
  // Throwing would do that too, but prints a stack trace this message does not want.
  // eslint-disable-next-line n/no-process-exit
  process.exit(1);
}

function verifyChangelog(matchVersion: boolean): void {
  const changelog = fs.readFileSync(changelogPath, 'utf8');
  const today = new Date().toLocaleDateString('sv-SE');

  const linkMatch = unreleasedLinkPattern.exec(changelog);
  if (!linkMatch) {
    fail('No `[unreleased]: …/compare/vX.Y.Z...HEAD` link reference was found.');
  }
  const [, repositoryUrl, linkedVersion] = linkMatch;

  if (changelog.includes(unreleasedHeading)) {
    fail(
      `It still has an “${unreleasedHeading}” section. Promote it to the version you are\n` +
        `releasing, then commit that before running the release. For example:\n\n` +
        `  ## [X.Y.Z] – ${today}\n\n` +
        `and in the link references at the bottom:\n\n` +
        `  [unreleased]: ${repositoryUrl}/compare/vX.Y.Z...HEAD\n` +
        `  [X.Y.Z]: ${repositoryUrl}/compare/v${linkedVersion}...vX.Y.Z`,
    );
  }

  const headingMatch = versionHeadingPattern.exec(changelog);
  if (!headingMatch) {
    fail('No `## [X.Y.Z] – YYYY-MM-DD` version heading was found.');
  }
  const [newestHeading, newestVersion] = headingMatch;

  // Everything between the newest heading and the one below it.
  const [, afterHeading = ''] = changelog.split(newestHeading);
  const [entries = ''] = afterHeading.split(/^## \[/m);
  if (entries.trim().length === 0) {
    fail(`“${newestHeading}” has no entries under it.`);
  }

  if (linkedVersion !== newestVersion) {
    fail(
      `The \`[unreleased]\` link compares from v${linkedVersion}, but the newest heading is\n` +
        `${newestVersion}. Repoint it:\n\n` +
        `  [unreleased]: ${repositoryUrl}/compare/v${newestVersion}...HEAD`,
    );
  }

  // Checking only that some link exists would let a wrong repository, previous
  // tag or target tag through, and the release would ship a broken link.
  const previousVersion = [...changelog.matchAll(/^## \[(\d+\.\d+\.\d+)\]/gm)].map((m) => m[1])[1];
  const expectedLink = previousVersion
    ? `[${newestVersion}]: ${repositoryUrl}/compare/v${previousVersion}...v${newestVersion}`
    : `[${newestVersion}]: ${repositoryUrl}/releases/tag/v${newestVersion}`;
  // Compared line by line rather than as a substring: `includes` would accept
  // a trailing typo such as `…v9.0.0oops`, which links nowhere.
  if (!changelog.split('\n').includes(expectedLink)) {
    fail(`The comparison link for ${newestVersion} is missing or wrong. It must read exactly:\n\n  ${expectedLink}`);
  }

  if (matchVersion) {
    const { version } = JSON.parse(fs.readFileSync(packagePath, 'utf8')) as { version: string };
    if (version !== newestVersion) {
      fail(
        `The changelog is promoted to ${newestVersion}, but the release is ${version}.\n` +
          `Either release ${newestVersion}, or update the changelog to ${version}.`,
      );
    }
  }

  console.log(`changelog.md is ready: ${newestHeading}`);
}

verifyChangelog(process.argv.includes('--match-version'));
