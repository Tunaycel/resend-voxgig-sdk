# Generator evaluation

29 September 2026 · Windows · Node 24.12.0

## Scope and outcome

Generated a TypeScript client from the official Resend OpenAPI definition using `@voxgig/create-sdkgen` 0.29.2, `@voxgig/sdkgen` 4.31.0 and `@voxgig/apidef` 8.18.0. The model produces 64 entity classes. The final generated suite reported 522 passed, 0 failed and 1 skipped out of 523 tests on both Ubuntu and Windows CI. A participant-run, real-key `GET /domains` smoke test returned HTTP 200 in 246 ms with a valid empty domain list. This limited read-only check is not a production-readiness claim.

Resend was absent from a scan of 802 public Voxgig repositories and all their root READMEs, cross-checked against the website's 637-entry JSON/CSV catalogue. Generic resend-verification operations in other APIs were inspected and excluded. The inventories differ, so the website alone is insufficient evidence.

## Reproducible findings

### 1. Windows scaffold cannot launch npm

Run `npx @voxgig/create-sdkgen@0.29.2 resend -d <spec> -o <folder> -t ts -f test` on Windows. The scaffold writes files, then fails with `Failed to start npm: spawn npm ENOENT`. Repeating with `--no-install` reaches target setup and fails identically.

The published initializer's `dist/create-sdkgen.js`, function `runNpm`, launches `spawn('npm', args, spawn_opts)` without Windows command handling. Explicit `npm.cmd install` and direct Node invocation of the installed target/feature CLIs succeeded.

Recommendation: use the Node executable plus a resolved npm CLI entrypoint, or a tested cross-platform process launcher. Add a Windows end-to-end scaffold test, including `--no-install` with preinstalled dependencies.

### 2. Existing model includes fail during Windows resolution

After setup, `npm run generate` reports `source not found: api/api-info.aontu` despite the file existing. `@voxgig/model` supplies native `fs` to Aontu; `@tabnas/multisource` 0.5.8 chooses POSIX paths whenever a filesystem is injected. A small control experiment succeeded without explicit native fs and failed with it. A build-only Windows adapter that lets Aontu use its native default allowed generation to complete.

The adapter is `.sdk/build/windows-native-fs.cjs`; installed packages and generated client source were not patched. Recommendation: distinguish virtual filesystem semantics from an injected native filesystem explicitly, and test native Windows drive-letter paths through the complete model toolchain.

### 3. Generated npm scripts assume a Unix shell

In `ts/`, `npm run build` fails because `rm` is unavailable under the default Windows npm shell. Direct invocation of the TypeScript compiler succeeds. Generated test commands also contain single-quoted globs, which do not have portable shell quoting semantics.

The root scripts launch Node with argument arrays. Recommendation: generate platform-independent build/cleanup scripts and test them under the default shells on Windows and Linux. The root build uses forced compilation; it does not prune stale output after model deletions.

### 4. Email metrics response requires an explicit transform

The initial generated definition test `emails_metric.list GET /emails/metrics` failed: it expected one record from its response fixture but received zero. The fixture contains a `data` array, whereas the generated entity model mapped the response to the entire `body`.

The guide now declares `body.data` as the list response transform and the regenerated contract test passes. Reproduce after building with `node --test --test-name-pattern="emails_metric.list" "ts/dist-test/definition.test.js"` from the repository root. This was an offline generated-contract failure, not an observed live API failure.

Recommendation: improve response-envelope inference for the metrics response shape and retain the fixture regression test. The guide-level override is reproducible and avoids editing generated TypeScript directly.

### 5. Generated ignore rule collides with the Log entity

The scaffolded `.sdk/.gitignore` used the unanchored pattern `log/`. Resend exposes a `Log` entity, so Git ignored `.sdk/test/entity/log/LogTestData.json`. Local generated workspaces passed because the file existed, while clean CI failed with `ENOENT`.

Anchoring the rule to `/log/` keeps the intended `.sdk/log/` output ignored while allowing the entity fixture to be committed. Recommendation: anchor generated-directory ignore rules and add a clean-checkout CI test for entity names that overlap common build folders.

### 6. Build-tool dependency advisories

`npm audit` reports two moderate affected packages in the generator toolchain: `markdown-it` and its dependent `@voxgig/docgen`. The generated client has no runtime dependencies; its separate installation audit reported zero vulnerabilities. These are separate dependency graphs.

Recommendation: update the documentation generator's Markdown dependency upstream. Do not apply the audit's suggested major-version replacement blindly. See the machine-readable audit output for advisory identifiers.

## What worked well

- The model/target separation allowed project ownership and repository URL to be declared without editing generated client code. User-Agent is set in the usage example.
- The generated definition tests caught a concrete response-shape problem.
- Documentation examples are included in the generated test suite.
- The generator's `doctor` command reported no scaffold drift with the build adapter present. This checks scaffold consistency, not runtime correctness.

## Ownership and verification

Tunay directed the assessment scope, approved starting implementation, required catalogue verification and professional documentation, and managed progress. Codex researched sources, ran commands, implemented the build adapter and supporting scripts, and drafted documentation. The SDK source was produced by Voxgig's generator. Automated checks are identified as such. Tunay created a restricted-purpose Resend key, ran the live smoke command locally and supplied its non-secret result; the key was not recorded in the repository.

## Human time

The participant's cumulative active minutes have not been supplied. Do not claim compliance with the 30-minute human-work limit until that total includes earlier assessment preparation and review. Tool wall-clock durations are recorded separately and are not a substitute for human time. Stop human assessment work at the limit and report unfinished items.

## Outstanding

- Confirmation of cumulative human effort.

