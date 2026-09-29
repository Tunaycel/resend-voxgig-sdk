# Generator evaluation

29 September 2026 · Windows · Node 24.12.0

## Scope and outcome

Generated a TypeScript client from the official Resend OpenAPI definition using `@voxgig/create-sdkgen` 0.29.2, `@voxgig/sdkgen` 4.31.0 and `@voxgig/apidef` 8.18.0. The model produces 64 entity classes. The final generated suite reported 521 passed, 1 failed and 1 skipped out of 523 tests. A real-key test has not run. This is an assessment artifact with a known defect, not a production-readiness claim.

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

### 4. Email metrics response is not extracted as a list

The unmodified generated definition test `emails_metric.list GET /emails/metrics` fails: it expects one record from its response fixture but receives zero. The fixture contains a `data` array, whereas the generated entity model maps the response to the entire `body`.

Reproduce after building: `node --test --test-name-pattern="emails_metric.list" "ts/dist-test/definition.test.js"` from the repository root. This is an offline generated-contract failure, not an observed live API failure. The test remains enabled.

Recommendation: improve response-envelope inference for the metrics response shape and retain a fixture regression test. Verify whether metrics rows and aggregate fields need distinct modelling before changing the mapping. No speculative fix was applied within this assessment.

### 5. Build-tool dependency advisories

`npm audit` reports two moderate affected packages in the generator toolchain: `markdown-it` and its dependent `@voxgig/docgen`. The generated client has no runtime dependencies; its separate installation audit reported zero vulnerabilities. These are separate dependency graphs.

Recommendation: update the documentation generator's Markdown dependency upstream. Do not apply the audit's suggested major-version replacement blindly. See the machine-readable audit output for advisory identifiers.

## What worked well

- The model/target separation allowed project ownership and repository URL to be declared without editing generated client code. User-Agent is set in the usage example.
- The generated definition tests caught a concrete response-shape problem.
- Documentation examples are included in the generated test suite.
- The generator's `doctor` command reported no scaffold drift with the build adapter present. This checks scaffold consistency, not runtime correctness.

## Ownership and verification

Tunay directed the assessment scope, approved starting implementation, required catalogue verification and professional documentation, and managed progress. Codex researched sources, ran commands, implemented the build adapter and supporting scripts, and drafted documentation. The SDK source was produced by Voxgig's generator. Automated checks are identified as such; participant-performed manual verification is not yet recorded.

## Human time

The participant's cumulative active minutes have not been supplied. Do not claim compliance with the 30-minute human-work limit until that total includes earlier assessment preparation and review. Tool wall-clock durations are recorded separately and are not a substitute for human time. Stop human assessment work at the limit and report unfinished items.

## Outstanding

- Final regression completed: README example checks pass; only the original email-metrics contract failure remains.
- Real API key, live read-only smoke test and participant review.
- Public GitHub publication and remote CI verification.
- Confirmation of cumulative human effort.

