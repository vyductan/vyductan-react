use std::{
    collections::hash_map::DefaultHasher,
    hash::{Hash, Hasher},
    io::ErrorKind,
    path::{Path, PathBuf},
};

use chrono::{DateTime, Local};
use ignore::gitignore::{Gitignore, GitignoreBuilder};
use serde::{Deserialize, Serialize};
use walkdir::WalkDir;

const IGNORED_DIRS: &[&str] = &["node_modules", "dist", ".turbo", ".next", ".git"];

fn is_ignored(entry: &walkdir::DirEntry) -> bool {
    let name = entry.file_name().to_string_lossy();
    IGNORED_DIRS.contains(&name.as_ref())
}

fn latest_modified_from_walkdir<I>(entries: I) -> Result<std::time::SystemTime, String>
where
    I: IntoIterator<Item = Result<walkdir::DirEntry, walkdir::Error>>,
{
    let mut max_time: Option<std::time::SystemTime> = None;

    for entry in entries {
        let entry = entry.map_err(|error| format!("failed to read @acme tree: {error}"))?;

        let metadata = entry
            .metadata()
            .map_err(|error| format!("failed to read @acme metadata: {error}"))?;
        let modified = metadata
            .modified()
            .map_err(|error| format!("failed to read @acme modified time: {error}"))?;

        match max_time {
            Some(current_max) => {
                if modified > current_max {
                    max_time = Some(modified);
                }
            }
            None => max_time = Some(modified),
        }
    }

    max_time.ok_or_else(|| "Not Found".to_string())
}

fn acme_rsync_args(src_root: &str, dest_root: &str) -> Vec<String> {
    let src_path = if src_root.ends_with('/') {
        src_root.to_string()
    } else {
        format!("{src_root}/")
    };
    let dest_path = if dest_root.ends_with('/') {
        dest_root.to_string()
    } else {
        format!("{dest_root}/")
    };

    vec![
        "-av".to_string(),
        "--delete".to_string(),
        "--exclude=node_modules".to_string(),
        "--exclude=dist".to_string(),
        "--exclude=.turbo".to_string(),
        "--exclude=.next".to_string(),
        "--exclude=.git".to_string(),
        "--filter=dir-merge,- .gitignore".to_string(),
        format!("{src_path}@acme/"),
        format!("{dest_path}@acme/"),
    ]
}

fn preview_acme_rsync_args(src_root: &str, dest_root: &str) -> Vec<String> {
    let mut args = acme_rsync_args(src_root, dest_root);
    args.insert(2, "--dry-run".to_string());
    args.insert(3, "--itemize-changes".to_string());
    args
}

fn run_rsync(args: Vec<String>, context: &str) -> Result<std::process::Output, String> {
    std::process::Command::new("rsync")
        .args(args)
        .output()
        .map_err(|error| {
            if error.kind() == ErrorKind::NotFound {
                "rsync command is unavailable on this system".to_string()
            } else {
                format!("failed to run {context}: {error}")
            }
        })
}

fn build_acme_gitignore_matcher(root: &Path) -> Result<Gitignore, String> {
    let mut builder = GitignoreBuilder::new(root);
    let gitignore_path = root.join(".gitignore");

    if let Some(error) = builder.add(gitignore_path) {
        return Err(format!("failed to load @acme/.gitignore: {error}"));
    }

    builder
        .build()
        .map_err(|e| format!("failed to build @acme gitignore matcher: {e}"))
}

fn parse_git_status_porcelain(stdout: &str) -> Vec<String> {
    stdout
        .lines()
        .flat_map(|line| {
            let trimmed = line.trim_end();
            if trimmed.len() < 4 {
                return Vec::new();
            }

            trimmed[3..]
                .trim()
                .split(" -> ")
                .filter(|path| path.starts_with("@acme/"))
                .map(|path| path.to_string())
                .collect::<Vec<_>>()
        })
        .collect()
}

fn parse_nested_acme_git_status_porcelain(stdout: &str) -> Vec<String> {
    stdout
        .lines()
        .flat_map(|line| {
            let trimmed = line.trim_end();
            if trimmed.len() < 4 {
                return Vec::new();
            }

            trimmed[3..]
                .trim()
                .split(" -> ")
                .filter(|path| !path.is_empty())
                .map(|path| format!("@acme/{path}"))
                .collect::<Vec<_>>()
        })
        .collect()
}

fn resolve_git_repo_root(root: &str) -> Result<Option<String>, String> {
    let output = std::process::Command::new("git")
        .args(["-C", root, "rev-parse", "--show-toplevel"])
        .output()
        .map_err(|error| {
            if error.kind() == ErrorKind::NotFound {
                "git command is unavailable on this system".to_string()
            } else {
                format!("failed to resolve git repo root: {error}")
            }
        })?;

    match output.status.code() {
        Some(0) => {
            let repo_root = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if repo_root.is_empty() {
                return Ok(None);
            }

            Ok(Some(repo_root))
        }
        Some(128) => Ok(None),
        _ => Err(format!(
            "git rev-parse failed: {}",
            String::from_utf8_lossy(&output.stderr)
        )),
    }
}

fn is_git_repo(root: &str) -> Result<bool, String> {
    let output = std::process::Command::new("git")
        .args(["-C", root, "rev-parse", "--is-inside-work-tree"])
        .output()
        .map_err(|error| {
            if error.kind() == ErrorKind::NotFound {
                "git command is unavailable on this system".to_string()
            } else {
                format!("failed to run git rev-parse: {error}")
            }
        })?;

    match output.status.code() {
        Some(0) => Ok(true),
        Some(128) => {
            let stderr = String::from_utf8_lossy(&output.stderr);
            if stderr.contains("not a git repository")
                || stderr.contains("not inside a work tree")
                || stderr.contains("inside a work tree")
            {
                Ok(false)
            } else {
                Err(format!("git rev-parse failed: {stderr}"))
            }
        }
        _ => Err(format!(
            "git rev-parse failed: {}",
            String::from_utf8_lossy(&output.stderr)
        )),
    }
}

fn resolve_primary_repo_path(path: &str) -> Result<Option<String>, String> {
    if is_git_repo(path)? {
        return Ok(Some(path.to_string()));
    }

    let nested_acme = Path::new(path).join("@acme");
    let nested_acme_str = nested_acme.to_string_lossy().to_string();
    if is_git_repo(&nested_acme_str)? {
        return Ok(Some(nested_acme_str));
    }

    Ok(None)
}

fn get_dirty_acme_paths(root: &str) -> Result<Vec<String>, String> {
    let Some(repo_path) = resolve_primary_repo_path(root)? else {
        return Ok(vec![]);
    };

    let Some(repo_root) = resolve_git_repo_root(&repo_path)? else {
        return Ok(vec![]);
    };

    let repo_path_buf = Path::new(&repo_path);
    let repo_root_buf = Path::new(&repo_root);
    let repo_path_is_acme =
        repo_path_buf.file_name().and_then(|name| name.to_str()) == Some("@acme");
    let repo_root_is_acme =
        repo_root_buf.file_name().and_then(|name| name.to_str()) == Some("@acme");
    let is_nested_acme_repo = repo_path_is_acme && repo_root_is_acme;
    let pathspec = if is_nested_acme_repo { "." } else { "@acme" };

    let output = std::process::Command::new("git")
        .args(["-C", &repo_root, "status", "--porcelain", "--", pathspec])
        .output()
        .map_err(|error| {
            if error.kind() == ErrorKind::NotFound {
                "git command is unavailable on this system".to_string()
            } else {
                format!("failed to run git status: {error}")
            }
        })?;

    if !output.status.success() {
        return Err(format!(
            "git status failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    if is_nested_acme_repo {
        Ok(parse_nested_acme_git_status_porcelain(&stdout))
    } else {
        Ok(parse_git_status_porcelain(&stdout))
    }
}

fn get_repo_dirty_paths(root: &str) -> Result<Vec<String>, String> {
    if !is_git_repo(root)? {
        return Ok(vec![]);
    }

    let Some(repo_root) = resolve_git_repo_root(root)? else {
        return Ok(vec![]);
    };

    let output = std::process::Command::new("git")
        .args(["-C", &repo_root, "status", "--porcelain"])
        .output()
        .map_err(|error| {
            if error.kind() == ErrorKind::NotFound {
                "git command is unavailable on this system".to_string()
            } else {
                format!("failed to run git status: {error}")
            }
        })?;

    if !output.status.success() {
        return Err(format!(
            "git status failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    Ok(stdout
        .lines()
        .map(|line| line.trim().to_string())
        .filter(|line| !line.is_empty())
        .collect())
}

fn parse_rev_list_counts(stdout: &str) -> Result<(usize, usize), String> {
    let trimmed = stdout.trim();
    let mut parts = trimmed.split_whitespace();
    let behind = parts
        .next()
        .ok_or_else(|| "missing behind count".to_string())?
        .parse::<usize>()
        .map_err(|error| format!("invalid behind count: {error}"))?;
    let ahead = parts
        .next()
        .ok_or_else(|| "missing ahead count".to_string())?
        .parse::<usize>()
        .map_err(|error| format!("invalid ahead count: {error}"))?;

    Ok((behind, ahead))
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubtreeSyncSettingsPayload {
    pub repo_root: String,
    pub prefix: String,
    pub remote: String,
    pub branch: String,
    pub squash: bool,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RsyncSyncSettingsPayload {
    pub use_git_safety_checks: bool,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SyncProfilePayload {
    pub id: String,
    pub project_path: String,
    pub mode: String,
    pub primary_path: Option<String>,
    pub rsync: Option<RsyncSyncSettingsPayload>,
    pub subtree: Option<SubtreeSyncSettingsPayload>,
}

#[derive(Serialize, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct SubtreeSyncStatusPayload {
    pub mode: String,
    pub state: String,
    pub ahead_count: usize,
    pub behind_count: usize,
    pub dirty: bool,
    pub message: Option<String>,
}

#[derive(Serialize, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct RsyncSyncStatusPayload {
    pub mode: String,
    pub state: String,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub dirty_paths: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub summary: Option<SyncPreviewSummary>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub opposite_summary: Option<SyncPreviewSummary>,
}

#[derive(Serialize, Debug, PartialEq, Eq)]
#[serde(untagged)]
pub enum SyncStatusPayload {
    Rsync(RsyncSyncStatusPayload),
    Subtree(SubtreeSyncStatusPayload),
}

fn subtree_misconfigured_status(message: &str) -> SubtreeSyncStatusPayload {
    SubtreeSyncStatusPayload {
        mode: "subtree".to_string(),
        state: "misconfigured".to_string(),
        ahead_count: 0,
        behind_count: 0,
        dirty: false,
        message: Some(message.to_string()),
    }
}

fn subtree_missing_status(message: &str) -> SubtreeSyncStatusPayload {
    SubtreeSyncStatusPayload {
        mode: "subtree".to_string(),
        state: "missing_subtree".to_string(),
        ahead_count: 0,
        behind_count: 0,
        dirty: false,
        message: Some(message.to_string()),
    }
}

fn subtree_status_payload(
    state: &str,
    ahead_count: usize,
    behind_count: usize,
    dirty: bool,
) -> SubtreeSyncStatusPayload {
    SubtreeSyncStatusPayload {
        mode: "subtree".to_string(),
        state: state.to_string(),
        ahead_count,
        behind_count,
        dirty,
        message: None,
    }
}

fn validate_subtree_profile(
    profile: &SyncProfilePayload,
) -> Result<&SubtreeSyncSettingsPayload, SubtreeSyncStatusPayload> {
    if profile.mode != "subtree" {
        return Err(subtree_misconfigured_status("sync profile mode must be subtree"));
    }

    let Some(settings) = profile.subtree.as_ref() else {
        return Err(subtree_misconfigured_status("subtree settings are required"));
    };

    if settings.repo_root.trim().is_empty() {
        return Err(subtree_misconfigured_status("subtree repoRoot is required"));
    }

    if settings.remote.trim().is_empty() {
        return Err(subtree_misconfigured_status("subtree remote is required"));
    }

    if settings.branch.trim().is_empty() {
        return Err(subtree_misconfigured_status("subtree branch is required"));
    }

    if settings.prefix != "@acme" {
        return Err(subtree_misconfigured_status("subtree prefix must be @acme"));
    }

    match is_git_repo(&settings.repo_root) {
        Ok(true) => {}
        Ok(false) => {
            return Err(subtree_misconfigured_status(
                "subtree repoRoot must be inside a git work tree",
            ));
        }
        Err(error) => {
            return Err(subtree_misconfigured_status(&error));
        }
    }

    Ok(settings)
}

fn run_git_command(
    root: &str,
    args: &[&str],
    context: &str,
) -> Result<std::process::Output, String> {
    std::process::Command::new("git")
        .args(["-C", root])
        .args(args)
        .output()
        .map_err(|error| {
            if error.kind() == ErrorKind::NotFound {
                "git command is unavailable on this system".to_string()
            } else {
                format!("failed to run {context}: {error}")
            }
        })
}

fn subtree_head_ref(repo_root: &str, prefix: &str) -> Result<String, SubtreeSyncStatusPayload> {
    let output = run_git_command(
        repo_root,
        &["subtree", "split", "--prefix", prefix, "HEAD"],
        "git subtree split",
    )
    .map_err(|error| subtree_misconfigured_status(&error))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        if stderr.contains("does not exist; use 'git subtree add'") {
            return Err(subtree_missing_status(
                "subtree prefix @acme is missing from the current branch",
            ));
        }

        return Err(subtree_misconfigured_status(&format!(
            "git subtree split failed: {}",
            stderr
        )));
    }

    let split_head = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if split_head.is_empty() {
        return Err(subtree_misconfigured_status(
            "git subtree split returned an empty revision",
        ));
    }

    Ok(split_head)
}

fn subtree_source_ref(
    repo_root: &str,
    remote: &str,
    branch: &str,
) -> Result<String, SubtreeSyncStatusPayload> {
    let source_ref = format!("{remote}/{branch}");
    let output = run_git_command(repo_root, &["rev-parse", &source_ref], "git rev-parse")
        .map_err(|error| subtree_misconfigured_status(&error))?;

    if !output.status.success() {
        return Err(subtree_misconfigured_status(
            "subtree source ref could not be resolved",
        ));
    }

    let source_sha = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if source_sha.is_empty() {
        return Err(subtree_misconfigured_status(
            "subtree source ref could not be resolved",
        ));
    }

    Ok(source_sha)
}

fn git_is_ancestor(
    repo_root: &str,
    ancestor: &str,
    descendant: &str,
) -> Result<bool, SubtreeSyncStatusPayload> {
    let output = run_git_command(
        repo_root,
        &["merge-base", "--is-ancestor", ancestor, descendant],
        "git merge-base",
    )
    .map_err(|error| subtree_misconfigured_status(&error))?;

    match output.status.code() {
        Some(0) => Ok(true),
        Some(1) => Ok(false),
        _ => Err(subtree_misconfigured_status(&format!(
            "git merge-base failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ))),
    }
}

fn get_subtree_sync_status(profile: &SyncProfilePayload) -> SubtreeSyncStatusPayload {
    let settings = match validate_subtree_profile(profile) {
        Ok(settings) => settings,
        Err(status) => return status,
    };

    let dirty = match get_dirty_acme_paths(&settings.repo_root) {
        Ok(paths) => !paths.is_empty(),
        Err(error) => return subtree_misconfigured_status(&error),
    };

    let split_head = match subtree_head_ref(&settings.repo_root, &settings.prefix) {
        Ok(split_head) => split_head,
        Err(status) => return status,
    };

    let source_sha = match subtree_source_ref(&settings.repo_root, &settings.remote, &settings.branch)
    {
        Ok(source_sha) => source_sha,
        Err(status) => return status,
    };

    let state = if split_head == source_sha {
        "clean"
    } else {
        let split_is_ancestor = match git_is_ancestor(&settings.repo_root, &split_head, &source_sha)
        {
            Ok(value) => value,
            Err(status) => return status,
        };
        let source_is_ancestor = match git_is_ancestor(&settings.repo_root, &source_sha, &split_head)
        {
            Ok(value) => value,
            Err(status) => return status,
        };

        if split_is_ancestor {
            "behind"
        } else if source_is_ancestor {
            "ahead"
        } else {
            "diverged"
        }
    };

    let revision_range = format!("{}/{}...{}", settings.remote, settings.branch, split_head);
    let output = match run_git_command(
        &settings.repo_root,
        &["rev-list", "--left-right", "--count", &revision_range],
        "git rev-list",
    ) {
        Ok(output) => output,
        Err(error) => return subtree_misconfigured_status(&error),
    };

    if !output.status.success() {
        return subtree_misconfigured_status(&format!(
            "git rev-list failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let (behind_count, ahead_count) =
        match parse_rev_list_counts(&String::from_utf8_lossy(&output.stdout)) {
            Ok(counts) => counts,
            Err(error) => return subtree_misconfigured_status(&error),
        };

    subtree_status_payload(state, ahead_count, behind_count, dirty)
}

fn get_rsync_sync_status(profile: &SyncProfilePayload) -> Result<RsyncSyncStatusPayload, String> {
    if profile.mode != "rsync" {
        return Err("sync profile mode must be rsync".to_string());
    }

    let src = profile.project_path.trim();
    if src.is_empty() {
        return Err("sync profile projectPath is required".to_string());
    }

    let dest = profile
        .primary_path
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| "sync profile primaryPath is required".to_string())?;

    let dirty_paths = get_dirty_acme_paths(dest)?;
    let (summary, opposite_summary) = {
        let (_, summary) = parse_preview_files(src, dest)?;
        let (_, opposite_summary) = parse_preview_files(dest, src)?;
        (summary, opposite_summary)
    };

    let state = if !dirty_paths.is_empty() {
        if summary.added == 0
            && summary.modified == 0
            && summary.deleted == 0
            && opposite_summary.added == 0
            && opposite_summary.modified == 0
            && opposite_summary.deleted == 0
        {
            "local-changes"
        } else {
            "diverged"
        }
    } else if summary.added == 0
        && summary.modified == 0
        && summary.deleted == 0
        && opposite_summary.added == 0
        && opposite_summary.modified == 0
        && opposite_summary.deleted == 0
    {
        "in-sync"
    } else if opposite_summary.added > 0
        || opposite_summary.modified > 0
        || opposite_summary.deleted > 0
    {
        if summary.added > 0 || summary.modified > 0 || summary.deleted > 0 {
            "diverged"
        } else {
            "outdated"
        }
    } else {
        "unknown"
    };

    Ok(RsyncSyncStatusPayload {
        mode: "rsync".to_string(),
        state: state.to_string(),
        dirty_paths,
        summary: Some(summary),
        opposite_summary: Some(opposite_summary),
    })
}

fn subtree_apply_args(prefix: &str, remote: &str, branch: &str, squash: bool) -> Vec<String> {
    let mut args = vec![
        "subtree".to_string(),
        "pull".to_string(),
        format!("--prefix={prefix}"),
        remote.to_string(),
        branch.to_string(),
    ];

    if squash {
        args.push("--squash".to_string());
    }

    args
}

fn subtree_add_args(prefix: &str, remote: &str, branch: &str, squash: bool) -> Vec<String> {
    let mut args = vec![
        "subtree".to_string(),
        "add".to_string(),
        format!("--prefix={prefix}"),
        remote.to_string(),
        branch.to_string(),
    ];

    if squash {
        args.push("--squash".to_string());
    }

    args
}

fn parse_rsync_itemized_line(line: &str) -> Option<(String, String)> {
    let trimmed = line.trim();
    if trimmed.is_empty()
        || trimmed.starts_with("sending ")
        || trimmed.starts_with("sent ")
        || trimmed.starts_with("total size is")
        || trimmed.starts_with("Transfer starting:")
    {
        return None;
    }

    let mut parts = trimmed.split_whitespace();
    let marker = parts.next()?;

    let path = parts.collect::<Vec<_>>().join(" ");
    if path.is_empty() {
        return None;
    }

    if marker.starts_with("*deleting") {
        return Some((path, "deleted".to_string()));
    }

    if marker.len() < 3 {
        return None;
    }

    let file_type = marker.chars().nth(1)?;
    if file_type != 'f' {
        return None;
    }

    let attrs: String = marker.chars().skip(2).collect();
    if attrs.chars().all(|ch| ch == '.') {
        return None;
    }

    if marker.contains('+') {
        return Some((path, "added".to_string()));
    }

    if attrs.contains('c') || attrs.contains('s') {
        return Some((path, "modified".to_string()));
    }

    None
}

#[derive(Debug, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct RepoMetadata {
    pub branch: String,
    pub last_commit_message: String,
    pub last_updated: String,
}

#[derive(Debug, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct PrimaryRemoteStatus {
    pub upstream_branch: Option<String>,
    pub working_tree_dirty: bool,
    pub ahead_count: usize,
    pub behind_count: usize,
    pub status: String,
    pub message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "lowercase")]
pub enum SyncChangeType {
    Added,
    Modified,
    Deleted,
}

#[derive(Debug, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct SyncPreviewFile {
    pub path: String,
    pub change_type: SyncChangeType,
}

#[derive(Debug, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct SyncPreviewSummary {
    pub added: usize,
    pub modified: usize,
    pub deleted: usize,
}

#[derive(Debug, Serialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "lowercase")]
pub enum SyncConflictKind {
    Text,
    Binary,
}

#[derive(Debug, Serialize, Deserialize, PartialEq, Eq, Clone, Copy, Hash)]
#[serde(rename_all = "lowercase")]
pub enum SyncConflictResolution {
    Current,
    Incoming,
    Both,
}

#[derive(Debug, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct SyncPreviewConflict {
    pub path: String,
    pub kind: SyncConflictKind,
    pub allowed_resolutions: Vec<SyncConflictResolution>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "lowercase")]
pub enum SyncPreviewFileAction {
    Keep,
    Delete,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct SyncPreviewDecision {
    pub path: String,
    pub kind: SyncChangeType,
    pub allowed_actions: Vec<SyncPreviewFileAction>,
}

#[derive(Debug, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct SyncConflictTextSide {
    pub label: String,
    pub content: String,
}

#[derive(Debug, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct SyncConflictDetail {
    pub path: String,
    pub kind: SyncConflictKind,
    pub current: Option<SyncConflictTextSide>,
    pub incoming: Option<SyncConflictTextSide>,
    pub both_preview: Option<String>,
    pub message: Option<String>,
}

#[derive(Debug, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct SyncConflictResolutionSelection {
    pub path: String,
    pub resolution: SyncConflictResolution,
}

#[derive(Debug, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct SyncPreviewFileActionSelection {
    pub path: String,
    pub action: SyncPreviewFileAction,
}

#[derive(Debug, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct RsyncConflictExecutionRequest {
    pub src: String,
    pub dest: String,
    pub direction: String,
    pub fingerprint: String,
    pub resolutions: Vec<SyncConflictResolutionSelection>,
    #[serde(default)]
    pub file_actions: Vec<SyncPreviewFileActionSelection>,
    #[serde(default)]
    pub use_git_safety_checks: bool,
}

#[derive(Debug, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct RsyncPreviewActionRequest {
    pub src: String,
    pub dest: String,
    pub direction: String,
    pub fingerprint: String,
    pub path: String,
    pub action: SyncPreviewFileAction,
    pub change_type: SyncChangeType,
    #[serde(default)]
    pub use_git_safety_checks: bool,
}

#[derive(Debug, PartialEq, Eq)]
enum ResolvedFileAction {
    KeepCurrent,
    ApplyIncoming,
    WriteBoth(String),
}

#[derive(Debug, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct SyncPreviewResult {
    pub files: Vec<SyncPreviewFile>,
    pub summary: SyncPreviewSummary,
    pub conflicts: Vec<SyncPreviewConflict>,
    pub decisions: Vec<SyncPreviewDecision>,
    pub fingerprint: String,
}

fn validate_relative_preview_path(relative_path: &str) -> Result<(), String> {
    let path = Path::new(relative_path);
    if path.is_absolute() {
        return Err("relative_path must be a relative path".to_string());
    }

    if path
        .components()
        .any(|component| matches!(component, std::path::Component::ParentDir))
    {
        return Err("relative_path cannot contain parent traversal".to_string());
    }

    Ok(())
}

#[derive(Debug, PartialEq, Eq)]
enum DiffTarget {
    Existing(PathBuf),
    Empty,
}

fn resolve_diff_targets(
    src_root: &str,
    dest_root: &str,
    relative_path: &str,
    change_type: &str,
) -> (DiffTarget, DiffTarget) {
    let src_file = Path::new(src_root).join("@acme").join(relative_path);
    let dest_file = Path::new(dest_root).join("@acme").join(relative_path);

    match change_type {
        "added" => (DiffTarget::Empty, DiffTarget::Existing(src_file)),
        "deleted" => (DiffTarget::Existing(dest_file), DiffTarget::Empty),
        _ => (
            DiffTarget::Existing(dest_file),
            DiffTarget::Existing(src_file),
        ),
    }
}

fn run_unified_diff(command_name: &str, left: &Path, right: &Path) -> Result<String, String> {
    let output = std::process::Command::new(command_name)
        .args([
            "-u",
            left.to_str()
                .ok_or_else(|| "invalid left diff path".to_string())?,
            right
                .to_str()
                .ok_or_else(|| "invalid right diff path".to_string())?,
        ])
        .output()
        .map_err(|error| {
            if error.kind() == ErrorKind::NotFound {
                "diff command is unavailable on this system".to_string()
            } else {
                format!("failed to run diff: {error}")
            }
        })?;

    match output.status.code() {
        Some(0) => Ok(String::new()),
        Some(1) => Ok(String::from_utf8_lossy(&output.stdout).to_string()),
        _ => Err(format!(
            "diff failed: {}",
            String::from_utf8_lossy(&output.stderr)
        )),
    }
}

fn is_probably_text(bytes: &[u8]) -> bool {
    if bytes.contains(&0) {
        return false;
    }

    std::str::from_utf8(bytes).is_ok()
}

fn classify_conflict_kind(
    current_bytes: &[u8],
    incoming_bytes: &[u8],
) -> Option<SyncConflictKind> {
    if current_bytes == incoming_bytes {
        return None;
    }

    if is_probably_text(current_bytes) && is_probably_text(incoming_bytes) {
        Some(SyncConflictKind::Text)
    } else {
        Some(SyncConflictKind::Binary)
    }
}

fn allowed_resolutions_for_conflict_kind(kind: &SyncConflictKind) -> Vec<SyncConflictResolution> {
    match kind {
        SyncConflictKind::Text => vec![
            SyncConflictResolution::Current,
            SyncConflictResolution::Incoming,
            SyncConflictResolution::Both,
        ],
        SyncConflictKind::Binary => vec![
            SyncConflictResolution::Current,
            SyncConflictResolution::Incoming,
        ],
    }
}

fn classify_preview_conflict(
    path: &str,
    current_bytes: Option<&[u8]>,
    incoming_bytes: Option<&[u8]>,
) -> Option<SyncPreviewConflict> {
    let (Some(current_bytes), Some(incoming_bytes)) = (current_bytes, incoming_bytes) else {
        return None;
    };

    let kind = classify_conflict_kind(current_bytes, incoming_bytes)?;

    Some(SyncPreviewConflict {
        path: path.to_string(),
        allowed_resolutions: allowed_resolutions_for_conflict_kind(&kind),
        kind,
    })
}

fn read_optional_file_bytes(path: &Path) -> Result<Option<Vec<u8>>, String> {
    match std::fs::read(path) {
        Ok(bytes) => Ok(Some(bytes)),
        Err(error) if error.kind() == ErrorKind::NotFound => Ok(None),
        Err(error) => Err(format!("failed to read file bytes for {}: {error}", path.display())),
    }
}

fn build_preview_fingerprint(
    files: &[SyncPreviewFile],
    conflicts: &[SyncPreviewConflict],
    decisions: &[SyncPreviewDecision],
    src_root: &str,
    dest_root: &str,
) -> Result<String, String> {
    let mut hasher = DefaultHasher::new();
    src_root.hash(&mut hasher);
    dest_root.hash(&mut hasher);

    for file in files {
        file.path.hash(&mut hasher);
        file.change_type.hash(&mut hasher);

        let src_path = Path::new(src_root).join("@acme").join(&file.path);
        let dest_path = Path::new(dest_root).join("@acme").join(&file.path);

        for path in [&src_path, &dest_path] {
            path.to_string_lossy().hash(&mut hasher);

            match std::fs::metadata(path) {
                Ok(metadata) => {
                    metadata.len().hash(&mut hasher);
                    let modified = metadata
                        .modified()
                        .map_err(|error| {
                            format!(
                                "failed to read preview fingerprint modified time for {}: {error}",
                                path.display()
                            )
                        })?
                        .duration_since(std::time::UNIX_EPOCH)
                        .map_err(|error| {
                            format!(
                                "failed to normalize preview fingerprint modified time for {}: {error}",
                                path.display()
                            )
                        })?
                        .as_nanos();
                    modified.hash(&mut hasher);
                }
                Err(error) if error.kind() == ErrorKind::NotFound => {
                    0_u8.hash(&mut hasher);
                }
                Err(error) => {
                    return Err(format!(
                        "failed to read preview fingerprint metadata for {}: {error}",
                        path.display()
                    ));
                }
            }
        }
    }

    for conflict in conflicts {
        conflict.path.hash(&mut hasher);
        conflict.kind.hash(&mut hasher);
        for resolution in &conflict.allowed_resolutions {
            resolution.hash(&mut hasher);
        }
    }

    for decision in decisions {
        decision.path.hash(&mut hasher);
        decision.kind.hash(&mut hasher);
        for action in &decision.allowed_actions {
            action.hash(&mut hasher);
        }
    }

    Ok(format!("{:016x}", hasher.finish()))
}

fn conflict_label_for_direction(direction: &str, side: SyncConflictResolution) -> &'static str {
    match (direction, side) {
        ("to-primary", SyncConflictResolution::Current) => "Ours (Primary)",
        ("to-primary", SyncConflictResolution::Incoming) => "Theirs (Project)",
        ("from-primary", SyncConflictResolution::Current) => "Ours (Project)",
        ("from-primary", SyncConflictResolution::Incoming) => "Theirs (Primary)",
        (_, SyncConflictResolution::Current) => "Ours",
        (_, SyncConflictResolution::Incoming) => "Theirs",
        (_, SyncConflictResolution::Both) => "Both",
    }
}

fn normalize_conflict_text(content: &str) -> String {
    if content.ends_with('\n') {
        content.to_string()
    } else {
        format!("{content}\n")
    }
}

fn conflict_marker_label_for_direction(
    direction: &str,
    side: SyncConflictResolution,
) -> String {
    let label = conflict_label_for_direction(direction, side);

    if let Some((base, context)) = label.split_once(' ') {
        format!("{} {}", base.to_uppercase(), context)
    } else {
        label.to_uppercase()
    }
}

fn build_conflict_marker_output(current: &str, incoming: &str, direction: &str) -> String {
    format!(
        "<<<<<<< {}\n{}=======\n{}>>>>>>> {}\n",
        conflict_marker_label_for_direction(direction, SyncConflictResolution::Current),
        normalize_conflict_text(current),
        normalize_conflict_text(incoming),
        conflict_marker_label_for_direction(direction, SyncConflictResolution::Incoming),
    )
}

fn resolve_conflict_action(
    kind: &SyncConflictKind,
    current_bytes: &[u8],
    incoming_bytes: &[u8],
    resolution: SyncConflictResolution,
    direction: &str,
) -> Result<ResolvedFileAction, String> {
    match resolution {
        SyncConflictResolution::Current => Ok(ResolvedFileAction::KeepCurrent),
        SyncConflictResolution::Incoming => Ok(ResolvedFileAction::ApplyIncoming),
        SyncConflictResolution::Both => {
            if *kind != SyncConflictKind::Text {
                return Err("binary conflicts do not support both resolution".to_string());
            }

            let current = std::str::from_utf8(current_bytes)
                .map_err(|error| format!("failed to decode current conflict text: {error}"))?;
            let incoming = std::str::from_utf8(incoming_bytes)
                .map_err(|error| format!("failed to decode incoming conflict text: {error}"))?;

            Ok(ResolvedFileAction::WriteBoth(build_conflict_marker_output(
                current, incoming, direction,
            )))
        }
    }
}

fn apply_resolved_file_action(
    dest_root: &str,
    relative_path: &str,
    incoming_bytes: &[u8],
    action: ResolvedFileAction,
) -> Result<(), String> {
    let target = Path::new(dest_root).join("@acme").join(relative_path);

    if let Some(parent) = target.parent() {
        std::fs::create_dir_all(parent).map_err(|error| {
            format!(
                "failed to create resolved conflict parent directory for {}: {error}",
                target.display()
            )
        })?;
    }

    match action {
        ResolvedFileAction::KeepCurrent => Ok(()),
        ResolvedFileAction::ApplyIncoming => std::fs::write(&target, incoming_bytes).map_err(|error| {
            format!("failed to write incoming conflict resolution for {}: {error}", target.display())
        }),
        ResolvedFileAction::WriteBoth(content) => std::fs::write(&target, content).map_err(|error| {
            format!("failed to write merged conflict resolution for {}: {error}", target.display())
        }),
    }
}

fn collect_preview_conflicts(
    src_root: &str,
    dest_root: &str,
    files: &[SyncPreviewFile],
    opposite_files: &[SyncPreviewFile],
) -> Result<Vec<SyncPreviewConflict>, String> {
    let opposite_modified_paths = opposite_files
        .iter()
        .filter(|file| file.change_type == SyncChangeType::Modified)
        .map(|file| file.path.as_str())
        .collect::<std::collections::HashSet<_>>();
    let mut conflicts = Vec::new();

    for preview_file in files {
        if preview_file.change_type != SyncChangeType::Modified
            || !opposite_modified_paths.contains(preview_file.path.as_str())
        {
            continue;
        }

        let src_bytes =
            read_optional_file_bytes(&Path::new(src_root).join("@acme").join(&preview_file.path))?;
        let dest_bytes = read_optional_file_bytes(
            &Path::new(dest_root).join("@acme").join(&preview_file.path),
        )?;

        if let Some(conflict) =
            classify_preview_conflict(&preview_file.path, dest_bytes.as_deref(), src_bytes.as_deref())
        {
            conflicts.push(conflict);
        }
    }

    Ok(conflicts)
}

fn parse_preview_files(
    src_root: &str,
    dest_root: &str,
) -> Result<(Vec<SyncPreviewFile>, SyncPreviewSummary), String> {
    let output = run_rsync(preview_acme_rsync_args(src_root, dest_root), "rsync dry-run")?;

    if !output.status.success() {
        return Err(format!(
            "rsync dry-run failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let gitignore = build_acme_gitignore_matcher(&Path::new(src_root).join("@acme"))?;

    let mut files = Vec::new();
    let mut summary = SyncPreviewSummary {
        added: 0,
        modified: 0,
        deleted: 0,
    };

    let stdout = String::from_utf8_lossy(&output.stdout);
    for line in stdout.lines() {
        if let Some((path, change_type)) = parse_rsync_itemized_line(line) {
            if path.ends_with('/') {
                continue;
            }

            if gitignore
                .matched_path_or_any_parents(Path::new(&path), false)
                .is_ignore()
            {
                continue;
            }

            let change_type = match change_type.as_str() {
                "added" => {
                    summary.added += 1;
                    SyncChangeType::Added
                }
                "deleted" => {
                    summary.deleted += 1;
                    SyncChangeType::Deleted
                }
                _ => {
                    summary.modified += 1;
                    SyncChangeType::Modified
                }
            };

            files.push(SyncPreviewFile { path, change_type });
        }
    }

    Ok((files, summary))
}

fn build_preview_decisions(
    src_root: &str,
    dest_root: &str,
    direction: &str,
    files: &[SyncPreviewFile],
) -> Vec<SyncPreviewDecision> {
    if direction != "to-primary" {
        return Vec::new();
    }

    files
        .iter()
        .filter_map(|file| {
            let src_file = Path::new(src_root).join("@acme").join(&file.path);
            let dest_file = Path::new(dest_root).join("@acme").join(&file.path);

            match file.change_type {
                SyncChangeType::Added if src_file.exists() && !dest_file.exists() => {
                    Some(SyncPreviewDecision {
                        path: file.path.clone(),
                        kind: SyncChangeType::Added,
                        allowed_actions: vec![
                            SyncPreviewFileAction::Keep,
                            SyncPreviewFileAction::Delete,
                        ],
                    })
                }
                SyncChangeType::Deleted if !src_file.exists() && dest_file.exists() => {
                    Some(SyncPreviewDecision {
                        path: file.path.clone(),
                        kind: SyncChangeType::Deleted,
                        allowed_actions: vec![
                            SyncPreviewFileAction::Keep,
                            SyncPreviewFileAction::Delete,
                        ],
                    })
                }
                _ => None,
            }
        })
        .collect()
}

fn build_preview_snapshot(
    src_root: &str,
    dest_root: &str,
    direction: &str,
) -> Result<
    (
        Vec<SyncPreviewFile>,
        SyncPreviewSummary,
        Vec<SyncPreviewConflict>,
        Vec<SyncPreviewDecision>,
        String,
    ),
    String,
> {
    let (files, summary) = parse_preview_files(src_root, dest_root)?;
    let (opposite_files, _opposite_summary) = parse_preview_files(dest_root, src_root)?;
    let conflicts = collect_preview_conflicts(src_root, dest_root, &files, &opposite_files)?;
    let decisions = build_preview_decisions(src_root, dest_root, direction, &files);
    let fingerprint = build_preview_fingerprint(&files, &conflicts, &decisions, src_root, dest_root)?;

    Ok((files, summary, conflicts, decisions, fingerprint))
}

struct PreviewExecutionSnapshot {
    conflicts: Vec<SyncPreviewConflict>,
    decisions: Vec<SyncPreviewDecision>,
}

fn ensure_preview_fingerprint_matches(
    src_root: &str,
    dest_root: &str,
    direction: &str,
    fingerprint: &str,
) -> Result<PreviewExecutionSnapshot, String> {
    let (_files, _summary, conflicts, decisions, current_fingerprint) =
        build_preview_snapshot(src_root, dest_root, direction)?;

    if current_fingerprint != fingerprint {
        return Err("Conflict preview is stale. Refresh preview and try again.".to_string());
    }

    Ok(PreviewExecutionSnapshot { conflicts, decisions })
}

fn read_conflict_bytes(
    src_root: &str,
    dest_root: &str,
    relative_path: &str,
) -> Result<(Vec<u8>, Vec<u8>, SyncConflictKind), String> {
    validate_relative_preview_path(relative_path)?;

    let current_path = Path::new(dest_root).join("@acme").join(relative_path);
    let incoming_path = Path::new(src_root).join("@acme").join(relative_path);
    let current_bytes = read_optional_file_bytes(&current_path)?
        .ok_or_else(|| format!("current conflict file not found: {relative_path}"))?;
    let incoming_bytes = read_optional_file_bytes(&incoming_path)?
        .ok_or_else(|| format!("incoming conflict file not found: {relative_path}"))?;

    let kind = classify_conflict_kind(&current_bytes, &incoming_bytes)
        .ok_or_else(|| format!("{relative_path} is not a conflict"))?;

    Ok((current_bytes, incoming_bytes, kind))
}

fn build_sync_conflict_detail(
    src_root: &str,
    dest_root: &str,
    relative_path: &str,
    direction: &str,
) -> Result<SyncConflictDetail, String> {
    let (current_bytes, incoming_bytes, kind) =
        read_conflict_bytes(src_root, dest_root, relative_path)?;

    match kind {
        SyncConflictKind::Text => {
            let current = std::str::from_utf8(&current_bytes)
                .map_err(|error| format!("failed to decode current conflict text: {error}"))?
                .to_string();
            let incoming = std::str::from_utf8(&incoming_bytes)
                .map_err(|error| format!("failed to decode incoming conflict text: {error}"))?
                .to_string();

            Ok(SyncConflictDetail {
                path: relative_path.to_string(),
                kind: SyncConflictKind::Text,
                current: Some(SyncConflictTextSide {
                    label: conflict_label_for_direction(direction, SyncConflictResolution::Current)
                        .to_string(),
                    content: current.clone(),
                }),
                incoming: Some(SyncConflictTextSide {
                    label: conflict_label_for_direction(direction, SyncConflictResolution::Incoming)
                        .to_string(),
                    content: incoming.clone(),
                }),
                both_preview: Some(build_conflict_marker_output(&current, &incoming, direction)),
                message: None,
            })
        }
        SyncConflictKind::Binary => Ok(SyncConflictDetail {
            path: relative_path.to_string(),
            kind: SyncConflictKind::Binary,
            current: None,
            incoming: None,
            both_preview: None,
            message: Some(
                "Binary conflict preview is unavailable; choose Ours or Theirs.".to_string(),
            ),
        }),
    }
}

fn ensure_rsync_sync_destination_is_clean(
    dest: &str,
    allowed_dirty_paths: &[String],
    use_git_safety_checks: bool,
) -> Result<(), String> {
    if !use_git_safety_checks {
        return Ok(());
    }

    let dirty_paths = get_dirty_acme_paths(dest)?;
    let repo_dirty_paths = get_repo_dirty_paths(dest)?;
    let blocking_acme_dirty_paths = dirty_paths
        .into_iter()
        .filter(|path| !allowed_dirty_paths.contains(path))
        .collect::<Vec<_>>();

    if !blocking_acme_dirty_paths.is_empty() {
        return Err(format!(
            "refusing to sync into repo with local @acme changes: {}",
            blocking_acme_dirty_paths.join(", ")
        ));
    }

    let blocking_repo_dirty_paths = repo_dirty_paths
        .into_iter()
        .filter(|path| {
            let normalized = path
                .split_whitespace()
                .last()
                .map(|value| value.trim_start_matches("./"))
                .unwrap_or("");
            !normalized.is_empty()
                && !normalized.starts_with("@acme/")
                && normalized != "@acme"
        })
        .collect::<Vec<_>>();

    if !blocking_repo_dirty_paths.is_empty() {
        return Err(format!(
            "refusing to sync into dirty repo: {}",
            blocking_repo_dirty_paths.join(", ")
        ));
    }

    Ok(())
}

fn execute_rsync_sync_internal_with_dirty_override(
    src: &str,
    dest: &str,
    allowed_dirty_paths: &[String],
    use_git_safety_checks: bool,
) -> Result<(), String> {
    ensure_rsync_sync_destination_is_clean(dest, allowed_dirty_paths, use_git_safety_checks)?;

    let output = run_rsync(acme_rsync_args(src, dest), "rsync sync")?;

    if !output.status.success() {
        return Err(format!(
            "rsync sync failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    Ok(())
}

#[tauri::command]
pub fn preview_sync_changes(
    src: String,
    dest: String,
    direction: String,
) -> Result<SyncPreviewResult, String> {
    let (files, summary, conflicts, decisions, fingerprint) =
        build_preview_snapshot(&src, &dest, &direction)?;

    Ok(SyncPreviewResult {
        files,
        summary,
        conflicts,
        decisions,
        fingerprint,
    })
}

#[tauri::command]
pub fn get_sync_conflict_detail(
    src: String,
    dest: String,
    relative_path: String,
    direction: String,
) -> Result<SyncConflictDetail, String> {
    build_sync_conflict_detail(&src, &dest, &relative_path, &direction)
}

#[tauri::command]
pub fn preview_sync_file_diff(
    src: String,
    dest: String,
    relative_path: String,
    change_type: String,
) -> Result<String, String> {
    validate_relative_preview_path(&relative_path)?;
    let (left, right) = resolve_diff_targets(&src, &dest, &relative_path, &change_type);
    let temp_empty_path = std::env::temp_dir().join(format!(
        "manager-diff-empty-{}-{}",
        std::process::id(),
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(|e| format!("failed to build temp diff path: {e}"))?
            .as_nanos()
    ));
    let needs_empty_side = matches!(left, DiffTarget::Empty) || matches!(right, DiffTarget::Empty);

    if needs_empty_side {
        std::fs::write(&temp_empty_path, b"")
            .map_err(|e| format!("failed to create empty diff file: {e}"))?;
    }

    let left_path = match &left {
        DiffTarget::Existing(path) => path,
        DiffTarget::Empty => &temp_empty_path,
    };
    let right_path = match &right {
        DiffTarget::Existing(path) => path,
        DiffTarget::Empty => &temp_empty_path,
    };

    let diff_result = run_unified_diff("diff", left_path, right_path);

    if needs_empty_side {
        let _ = std::fs::remove_file(&temp_empty_path);
    }

    diff_result
}

#[tauri::command]
pub fn delete_sync_file(root: String, relative_path: String) -> Result<(), String> {
    validate_relative_preview_path(&relative_path)?;

    let target = Path::new(&root).join("@acme").join(&relative_path);
    if !target.exists() {
        return Ok(());
    }

    std::fs::remove_file(&target)
        .map_err(|e| format!("failed to delete sync file {relative_path}: {e}"))
}

#[tauri::command]
pub fn get_latest_modified(path: String) -> Result<String, String> {
    let acme_path = Path::new(&path).join("@acme");
    if !acme_path.exists() || !acme_path.is_dir() {
        return Err("Not Found".to_string());
    }

    let time = latest_modified_from_walkdir(
        WalkDir::new(&acme_path)
            .into_iter()
            .filter_entry(|entry| !is_ignored(entry)),
    )?;

    let datetime: DateTime<Local> = time.into();
    Ok(datetime.format("%Y-%m-%d %H:%M:%S").to_string())
}

#[tauri::command]
pub fn get_repo_metadata(path: String) -> Result<RepoMetadata, String> {
    let repo_path = resolve_primary_repo_path(&path)?
        .ok_or_else(|| "Selected primary path is not inside a git work tree".to_string())?;

    let branch_output = run_git_command(&repo_path, &["branch", "--show-current"], "git branch")?;
    if !branch_output.status.success() {
        return Err(format!(
            "git branch failed: {}",
            String::from_utf8_lossy(&branch_output.stderr)
        ));
    }

    let branch = String::from_utf8_lossy(&branch_output.stdout).trim().to_string();
    if branch.is_empty() {
        return Err("Failed to resolve current branch".to_string());
    }

    let commit_output = run_git_command(&repo_path, &["log", "-1", "--pretty=%s"], "git log")?;
    if !commit_output.status.success() {
        return Err(format!(
            "git log failed: {}",
            String::from_utf8_lossy(&commit_output.stderr)
        ));
    }

    let last_commit_message = String::from_utf8_lossy(&commit_output.stdout).trim().to_string();
    if last_commit_message.is_empty() {
        return Err("Failed to resolve latest commit message".to_string());
    }

    let time = latest_modified_from_walkdir(
        WalkDir::new(&repo_path)
            .into_iter()
            .filter_entry(|entry| !is_ignored(entry)),
    )?;
    let datetime: DateTime<Local> = time.into();
    let last_updated = datetime.format("%Y-%m-%d %H:%M:%S").to_string();

    Ok(RepoMetadata {
        branch,
        last_commit_message,
        last_updated,
    })
}

#[tauri::command]
pub fn get_repo_remote_status(path: String) -> Result<PrimaryRemoteStatus, String> {
    let repo_path = resolve_primary_repo_path(&path)?
        .ok_or_else(|| "Selected primary path is not inside a git work tree".to_string())?;

    let status_output = run_git_command(&repo_path, &["status", "--porcelain"], "git status")?;
    if !status_output.status.success() {
        return Err(format!(
            "git status failed: {}",
            String::from_utf8_lossy(&status_output.stderr)
        ));
    }

    let working_tree_dirty = !String::from_utf8_lossy(&status_output.stdout)
        .trim()
        .is_empty();

    let upstream_output = run_git_command(
        &repo_path,
        &["rev-parse", "--abbrev-ref", "@{upstream}"],
        "git rev-parse",
    )?;
    if !upstream_output.status.success() {
        return Ok(PrimaryRemoteStatus {
            upstream_branch: None,
            working_tree_dirty,
            ahead_count: 0,
            behind_count: 0,
            status: "unknown".to_string(),
            message: Some("No upstream branch configured".to_string()),
        });
    }

    let upstream_branch = String::from_utf8_lossy(&upstream_output.stdout)
        .trim()
        .to_string();
    if upstream_branch.is_empty() {
        return Ok(PrimaryRemoteStatus {
            upstream_branch: None,
            working_tree_dirty,
            ahead_count: 0,
            behind_count: 0,
            status: "unknown".to_string(),
            message: Some("Could not determine remote sync status".to_string()),
        });
    }

    let rev_list_output = run_git_command(
        &repo_path,
        &["rev-list", "--left-right", "--count", "@{upstream}...HEAD"],
        "git rev-list",
    )?;
    if !rev_list_output.status.success() {
        return Ok(PrimaryRemoteStatus {
            upstream_branch: Some(upstream_branch),
            working_tree_dirty,
            ahead_count: 0,
            behind_count: 0,
            status: "unknown".to_string(),
            message: Some("Could not determine remote sync status".to_string()),
        });
    }

    let (behind_count, ahead_count) =
        parse_rev_list_counts(&String::from_utf8_lossy(&rev_list_output.stdout))?;

    let status = if working_tree_dirty || ahead_count > 0 {
        "unpublished"
    } else {
        "synced"
    };

    Ok(PrimaryRemoteStatus {
        upstream_branch: Some(upstream_branch),
        working_tree_dirty,
        ahead_count,
        behind_count,
        status: status.to_string(),
        message: None,
    })
}

#[tauri::command]
pub fn get_sync_status(profile: SyncProfilePayload) -> Result<SyncStatusPayload, String> {
    match profile.mode.as_str() {
        "rsync" => Ok(SyncStatusPayload::Rsync(get_rsync_sync_status(&profile)?)),
        "subtree" => Ok(SyncStatusPayload::Subtree(get_subtree_sync_status(&profile))),
        other => Err(format!("unsupported sync profile mode: {other}")),
    }
}

#[tauri::command]
pub fn execute_rsync_sync(
    src: String,
    dest: String,
    use_git_safety_checks: bool,
) -> Result<(), String> {
    execute_rsync_sync_internal_with_dirty_override(&src, &dest, &[], use_git_safety_checks)
}

#[tauri::command]
pub fn apply_single_rsync_preview_action(
    request: RsyncPreviewActionRequest,
) -> Result<(), String> {
    validate_relative_preview_path(&request.path)?;

    let snapshot = ensure_preview_fingerprint_matches(
        &request.src,
        &request.dest,
        &request.direction,
        &request.fingerprint,
    )?;

    let decision = snapshot
        .decisions
        .iter()
        .find(|decision| decision.path == request.path)
        .ok_or_else(|| {
            format!(
                "preview action is not allowed for {}. Refresh preview and try again.",
                request.path
            )
        })?;

    if decision.kind != request.change_type {
        return Err(format!(
            "preview change type is stale for {}. Refresh preview and try again.",
            request.path
        ));
    }

    if !decision.allowed_actions.contains(&request.action) {
        return Err(format!(
            "preview action {:?} is not allowed for {}",
            request.action, request.path
        ));
    }

    let allowed_dirty_paths = vec![format!("@acme/{}", request.path)];
    ensure_rsync_sync_destination_is_clean(
        &request.dest,
        &allowed_dirty_paths,
        request.use_git_safety_checks,
    )?;

    match (&request.change_type, &request.action) {
        (SyncChangeType::Deleted, SyncPreviewFileAction::Delete) => {
            delete_sync_file(request.dest, request.path)
        }
        (SyncChangeType::Deleted, SyncPreviewFileAction::Keep) => {
            let source = Path::new(&request.dest).join("@acme").join(&request.path);
            let target = Path::new(&request.src).join("@acme").join(&request.path);

            if let Some(parent) = target.parent() {
                std::fs::create_dir_all(parent).map_err(|error| {
                    format!(
                        "failed to create restore parent directory for {}: {error}",
                        target.display()
                    )
                })?;
            }

            std::fs::copy(&source, &target).map_err(|error| {
                format!(
                    "failed to restore {} from destination after preview action: {error}",
                    request.path
                )
            })?;
            Ok(())
        }
        (_, SyncPreviewFileAction::Delete) => delete_sync_file(request.src, request.path),
        (_, SyncPreviewFileAction::Keep) => {
            let incoming_bytes = std::fs::read(
                Path::new(&request.src).join("@acme").join(&request.path),
            )
            .map_err(|error| {
                format!(
                    "failed to read incoming preview file {}: {error}",
                    request.path
                )
            })?;
            apply_resolved_file_action(
                &request.dest,
                &request.path,
                &incoming_bytes,
                ResolvedFileAction::ApplyIncoming,
            )
        }
    }
}

#[tauri::command]
pub fn execute_rsync_conflict_resolutions(
    request: RsyncConflictExecutionRequest,
) -> Result<(), String> {
    let snapshot = ensure_preview_fingerprint_matches(
        &request.src,
        &request.dest,
        &request.direction,
        &request.fingerprint,
    )?;
    let mut allowed_dirty_paths = Vec::new();
    let mut pending_file_deletes = Vec::new();
    let mut pending_file_restores = Vec::new();
    let mut pending_conflict_actions = Vec::new();

    for selection in &request.resolutions {
        let conflict = snapshot
            .conflicts
            .iter()
            .find(|conflict| conflict.path == selection.path)
            .ok_or_else(|| {
                format!(
                    "Conflict preview is stale for {}. Refresh preview and try again.",
                    selection.path
                )
            })?;

        if !conflict.allowed_resolutions.contains(&selection.resolution) {
            return Err(format!(
                "resolution {:?} is not allowed for {}",
                selection.resolution, selection.path
            ));
        }

        let (current_bytes, incoming_bytes, _kind) =
            read_conflict_bytes(&request.src, &request.dest, &selection.path)?;

        let action = resolve_conflict_action(
            &conflict.kind,
            &current_bytes,
            &incoming_bytes,
            selection.resolution,
            &request.direction,
        )?;

        pending_conflict_actions.push((selection.path.clone(), incoming_bytes, action));
        allowed_dirty_paths.push(format!("@acme/{}", selection.path));
    }

    for decision in &snapshot.decisions {
        let has_selection = request
            .file_actions
            .iter()
            .any(|selection| selection.path == decision.path);

        if !has_selection {
            return Err(format!(
                "missing required file action for {}. Refresh preview and try again.",
                decision.path
            ));
        }
    }

    for selection in &request.file_actions {
        let decision = snapshot
            .decisions
            .iter()
            .find(|decision| decision.path == selection.path)
            .ok_or_else(|| {
                format!(
                    "preview action is not allowed for {}. Refresh preview and try again.",
                    selection.path
                )
            })?;

        if !decision.allowed_actions.contains(&selection.action) {
            return Err(format!(
                "preview action {:?} is not allowed for {}",
                selection.action, selection.path
            ));
        }

        match (&decision.kind, &selection.action) {
            (SyncChangeType::Deleted, SyncPreviewFileAction::Keep) => {
                pending_file_restores.push(selection.path.clone());
                allowed_dirty_paths.push(format!("@acme/{}", selection.path));
            }
            (_, SyncPreviewFileAction::Keep) => {}
            (_, SyncPreviewFileAction::Delete) => {
                pending_file_deletes.push(selection.path.clone());
                allowed_dirty_paths.push(format!("@acme/{}", selection.path));
            }
        }
    }

    ensure_rsync_sync_destination_is_clean(
        &request.dest,
        &allowed_dirty_paths,
        request.use_git_safety_checks,
    )?;

    for (relative_path, incoming_bytes, action) in pending_conflict_actions {
        apply_resolved_file_action(&request.dest, &relative_path, &incoming_bytes, action)?;
    }

    for relative_path in &pending_file_restores {
        let source = Path::new(&request.dest).join("@acme").join(relative_path);
        let target = Path::new(&request.src).join("@acme").join(relative_path);

        if let Some(parent) = target.parent() {
            std::fs::create_dir_all(parent).map_err(|error| {
                format!(
                    "failed to create restore parent directory for {}: {error}",
                    target.display()
                )
            })?;
        }

        std::fs::copy(&source, &target).map_err(|error| {
            format!(
                "failed to restore {} from destination before sync: {error}",
                relative_path
            )
        })?;
    }

    for relative_path in pending_file_deletes {
        delete_sync_file(request.src.clone(), relative_path)?;
    }

    execute_rsync_sync_internal_with_dirty_override(
        &request.src,
        &request.dest,
        &allowed_dirty_paths,
        request.use_git_safety_checks,
    )
}

#[tauri::command]
pub fn preview_subtree_sync(
    profile: SyncProfilePayload,
    direction: String,
) -> Result<SubtreeSyncStatusPayload, String> {
    let mut status = get_subtree_sync_status(&profile);

    if status.message.is_none() {
        status.message = Some(match direction.as_str() {
            "to-primary" => "Previewing subtree push to primary".to_string(),
            "from-primary" => "Previewing subtree pull from primary".to_string(),
            _ => "Previewing subtree sync".to_string(),
        });
    }

    Ok(status)
}

#[tauri::command]
pub fn execute_subtree_sync(
    profile: SyncProfilePayload,
    direction: String,
) -> Result<(), String> {
    let settings = validate_subtree_profile(&profile).map_err(|status| {
        status
            .message
            .unwrap_or_else(|| "subtree profile is misconfigured".to_string())
    })?;

    let dirty_paths = get_repo_dirty_paths(&settings.repo_root)?;
    if !dirty_paths.is_empty() {
        return Err(format!(
            "refusing subtree sync with dirty git repo: {}",
            dirty_paths.join(", ")
        ));
    }

    match direction.as_str() {
        "from-primary" => {
            let args = subtree_apply_args(
                &settings.prefix,
                &settings.remote,
                &settings.branch,
                settings.squash,
            );
            let arg_refs = args.iter().map(|arg| arg.as_str()).collect::<Vec<_>>();
            let output = run_git_command(&settings.repo_root, &arg_refs, "git subtree pull")?;

            if !output.status.success() {
                return Err(format!(
                    "git subtree pull failed: {}",
                    String::from_utf8_lossy(&output.stderr)
                ));
            }

            Ok(())
        }
        "to-primary" => Err(
            "subtree push is not implemented yet; use pull-only subtree mode for MVP"
                .to_string(),
        ),
        _ => Err(format!("unsupported subtree sync direction: {direction}")),
    }
}

#[tauri::command]
pub fn execute_subtree_add(profile: SyncProfilePayload) -> Result<(), String> {
    let settings = validate_subtree_profile(&profile).map_err(|status| {
        status
            .message
            .unwrap_or_else(|| "subtree profile is misconfigured".to_string())
    })?;

    let args = subtree_add_args(
        &settings.prefix,
        &settings.remote,
        &settings.branch,
        settings.squash,
    );
    let arg_refs = args.iter().map(|arg| arg.as_str()).collect::<Vec<_>>();
    let output = run_git_command(&settings.repo_root, &arg_refs, "git subtree add")?;

    if !output.status.success() {
        return Err(format!(
            "git subtree add failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::Path;

    #[test]
    fn preview_sync_changes_emits_decisions_for_push_when_source_is_git_repo() {
        let temp_root = std::env::temp_dir().join(format!(
            "manager-preview-push-git-source-decisions-{}-{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("system time should be after unix epoch")
                .as_nanos()
        ));
        let project_root = temp_root.join("project-root");
        let primary_root = temp_root.join("primary-root");
        std::fs::create_dir_all(project_root.join("@acme/tokens"))
            .expect("project tokens dir should be created");
        std::fs::create_dir_all(primary_root.join("@acme/tokens"))
            .expect("primary tokens dir should be created");
        std::fs::write(project_root.join("@acme/.gitignore"), b"")
            .expect("project gitignore should be written");
        std::fs::write(primary_root.join("@acme/.gitignore"), b"")
            .expect("primary gitignore should be written");
        std::fs::write(
            primary_root.join("@acme/tokens/from-primary.ts"),
            b"export const token = 'primary';\n",
        )
        .expect("primary token file should be written");

        std::process::Command::new("git")
            .args(["init", "-b", "main", project_root.to_string_lossy().as_ref()])
            .output()
            .expect("project git repo should initialize");
        std::process::Command::new("git")
            .args(["init", "-b", "main", primary_root.to_string_lossy().as_ref()])
            .output()
            .expect("primary git repo should initialize");
        let add_status = std::process::Command::new("git")
            .args(["add", "."])
            .current_dir(&primary_root)
            .status()
            .expect("git add should run");
        assert!(add_status.success(), "git add should succeed");
        let commit_status = std::process::Command::new("git")
            .args([
                "-c",
                "user.name=Manager Test",
                "-c",
                "user.email=manager@example.com",
                "commit",
                "-m",
                "initial commit",
            ])
            .current_dir(&primary_root)
            .status()
            .expect("git commit should run");
        assert!(commit_status.success(), "git commit should succeed");

        let push_result = preview_sync_changes(
            project_root.to_string_lossy().into_owned(),
            primary_root.to_string_lossy().into_owned(),
            "to-primary".to_string(),
        )
        .expect("push preview should succeed");

        let _ = std::fs::remove_dir_all(&temp_root);

        assert_eq!(push_result.files.len(), 1);
        assert_eq!(push_result.files[0].path, "tokens/from-primary.ts");
        assert_eq!(push_result.files[0].change_type, SyncChangeType::Deleted);
        assert_eq!(push_result.decisions.len(), 1);
        assert_eq!(push_result.decisions[0].path, "tokens/from-primary.ts");
        assert_eq!(push_result.decisions[0].kind, SyncChangeType::Deleted);
        assert_eq!(
            push_result.decisions[0].allowed_actions,
            vec![SyncPreviewFileAction::Keep, SyncPreviewFileAction::Delete]
        );
    }

    #[test]
    fn build_sync_conflict_detail_maps_labels_for_push_and_pull() {
        let temp_root = std::env::temp_dir().join(format!(
            "manager-conflict-detail-{}-{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("system time should be after unix epoch")
                .as_nanos()
        ));
        let src_root = temp_root.join("src-root");
        let dest_root = temp_root.join("dest-root");
        std::fs::create_dir_all(src_root.join("@acme/components"))
            .expect("src conflict dir should be created");
        std::fs::create_dir_all(dest_root.join("@acme/components"))
            .expect("dest conflict dir should be created");
        std::fs::write(
            src_root.join("@acme/components/button.tsx"),
            b"incoming version\n",
        )
        .expect("src file should be written");
        std::fs::write(
            dest_root.join("@acme/components/button.tsx"),
            b"current version\n",
        )
        .expect("dest file should be written");

        let push_detail = get_sync_conflict_detail(
            src_root.to_string_lossy().into_owned(),
            dest_root.to_string_lossy().into_owned(),
            "components/button.tsx".to_string(),
            "to-primary".to_string(),
        )
        .expect("push detail should build");
        let pull_detail = get_sync_conflict_detail(
            src_root.to_string_lossy().into_owned(),
            dest_root.to_string_lossy().into_owned(),
            "components/button.tsx".to_string(),
            "from-primary".to_string(),
        )
        .expect("pull detail should build");

        let _ = std::fs::remove_dir_all(&temp_root);

        assert_eq!(
            push_detail.current.expect("push current side").label,
            "Ours (Primary)"
        );
        assert_eq!(
            push_detail.incoming.expect("push incoming side").label,
            "Theirs (Project)"
        );
        assert_eq!(
            pull_detail.current.expect("pull current side").label,
            "Ours (Project)"
        );
        assert_eq!(
            pull_detail.incoming.expect("pull incoming side").label,
            "Theirs (Primary)"
        );
    }

    #[test]
    fn validate_relative_preview_path_rejects_parent_traversal() {
        let result = preview_sync_file_diff(
            "/tmp/source".to_string(),
            "/tmp/dest".to_string(),
            "../secrets.txt".to_string(),
            "modified".to_string(),
        );
        let error = result.expect_err("parent traversal should be rejected");
        assert!(error.contains("relative_path"));
    }

    #[test]
    fn get_latest_modified_reads_only_the_acme_tree() {
        let temp_root = std::env::temp_dir().join(format!(
            "manager-latest-modified-{}-{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("system time should be after unix epoch")
                .as_nanos()
        ));
        let acme_root = temp_root.join("@acme");
        std::fs::create_dir_all(&acme_root).expect("temp @acme dir should be created");
        std::thread::sleep(std::time::Duration::from_secs(1));
        std::fs::write(acme_root.join("tokens.txt"), b"alpha")
            .expect("acme file should be written");
        let initial = get_latest_modified(temp_root.to_string_lossy().to_string())
            .expect("initial latest modified should exist");

        std::thread::sleep(std::time::Duration::from_secs(1));
        std::fs::write(temp_root.join("pnpm-workspace.yaml"), b"packages:\n  - apps/*\n")
            .expect("workspace file should be written");
        let after_workspace = get_latest_modified(temp_root.to_string_lossy().to_string())
            .expect("latest modified should still exist");

        let _ = std::fs::remove_dir_all(&temp_root);

        assert_eq!(after_workspace, initial);
    }

    #[test]
    fn get_repo_metadata_supports_primary_repo_root_without_nested_acme_dir() {
        let temp_root = std::env::temp_dir().join(format!(
            "manager-primary-repo-root-{}-{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("system time should be after unix epoch")
                .as_nanos()
        ));
        std::fs::create_dir_all(&temp_root).expect("temp repo root should be created");
        std::fs::write(temp_root.join("package.json"), b"{}")
            .expect("repo root file should be written");

        let init_status = std::process::Command::new("git")
            .args(["init", "-b", "main"])
            .current_dir(&temp_root)
            .status()
            .expect("git init should run");
        assert!(init_status.success(), "git init should succeed");

        let add_status = std::process::Command::new("git")
            .args(["add", "package.json"])
            .current_dir(&temp_root)
            .status()
            .expect("git add should run");
        assert!(add_status.success(), "git add should succeed");

        let commit_status = std::process::Command::new("git")
            .args([
                "-c",
                "user.name=Manager Test",
                "-c",
                "user.email=manager@example.com",
                "commit",
                "-m",
                "initial commit",
            ])
            .current_dir(&temp_root)
            .status()
            .expect("git commit should run");
        assert!(commit_status.success(), "git commit should succeed");

        let result = get_repo_metadata(temp_root.to_string_lossy().to_string());

        let _ = std::fs::remove_dir_all(&temp_root);

        let metadata = result.expect("repo metadata should resolve for repo root");
        assert_eq!(metadata.branch, "main");
        assert_eq!(metadata.last_commit_message, "initial commit");
        assert_ne!(metadata.last_updated, "Unknown");
    }

    #[test]
    fn sync_profile_payload_deserializes_rsync_git_safety_setting() {
        let payload = serde_json::json!({
            "id": "profile-rsync",
            "projectPath": "/tmp/project",
            "mode": "rsync",
            "primaryPath": "/tmp/primary",
            "rsync": {
                "useGitSafetyChecks": true
            }
        });

        let profile: SyncProfilePayload =
            serde_json::from_value(payload).expect("sync profile payload should deserialize");

        assert_eq!(profile.mode, "rsync");
        assert!(
            profile
                .rsync
                .expect("rsync settings should deserialize")
                .use_git_safety_checks
        );
    }

    #[test]
    fn get_sync_status_returns_rsync_mode_for_rsync_profiles() {
        let temp_root = std::env::temp_dir().join(format!(
            "manager-rsync-status-{}-{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("system time should be after unix epoch")
                .as_nanos()
        ));
        let project_root = temp_root.join("project-root");
        let primary_root = temp_root.join("primary-root");
        std::fs::create_dir_all(project_root.join("@acme/components"))
            .expect("project acme dir should be created");
        std::fs::create_dir_all(primary_root.join("@acme/components"))
            .expect("primary acme dir should be created");
        std::fs::write(project_root.join("@acme/.gitignore"), b"")
            .expect("project gitignore should be written");
        std::fs::write(primary_root.join("@acme/.gitignore"), b"")
            .expect("primary gitignore should be written");
        std::fs::write(project_root.join("@acme/components/button.tsx"), b"project\n")
            .expect("project file should be written");
        std::fs::write(primary_root.join("@acme/components/button.tsx"), b"primary\n")
            .expect("primary file should be written");

        let status = get_sync_status(SyncProfilePayload {
            id: "profile-1".to_string(),
            project_path: project_root.to_string_lossy().into_owned(),
            mode: "rsync".to_string(),
            primary_path: Some(primary_root.to_string_lossy().into_owned()),
            rsync: None,
            subtree: None,
        })
        .expect("rsync sync status should succeed");

        let _ = std::fs::remove_dir_all(&temp_root);

        let value = serde_json::to_value(status).expect("status should serialize");
        assert_eq!(value["mode"], "rsync");
        assert!(value["state"].is_string());
        assert!(value.get("summary").is_some());
        assert!(value.get("oppositeSummary").is_some());
        assert!(value.get("aheadCount").is_none());
    }

    #[test]
    fn get_sync_status_reports_diverged_when_project_has_outgoing_changes_only() {
        let temp_root = std::env::temp_dir().join(format!(
            "manager-rsync-status-outgoing-{}-{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("system time should be after unix epoch")
                .as_nanos()
        ));
        let project_root = temp_root.join("project-root");
        let primary_root = temp_root.join("primary-root");
        std::fs::create_dir_all(project_root.join("@acme/components"))
            .expect("project acme dir should be created");
        std::fs::create_dir_all(primary_root.join("@acme/components"))
            .expect("primary acme dir should be created");
        std::fs::write(project_root.join("@acme/.gitignore"), b"")
            .expect("project gitignore should be written");
        std::fs::write(primary_root.join("@acme/.gitignore"), b"")
            .expect("primary gitignore should be written");
        std::fs::write(project_root.join("@acme/components/button.tsx"), b"project-new\n")
            .expect("project file should be written");

        let status = get_sync_status(SyncProfilePayload {
            id: "profile-outgoing".to_string(),
            project_path: project_root.to_string_lossy().into_owned(),
            mode: "rsync".to_string(),
            primary_path: Some(primary_root.to_string_lossy().into_owned()),
            rsync: None,
            subtree: None,
        })
        .expect("rsync sync status should succeed");

        let _ = std::fs::remove_dir_all(&temp_root);

        let value = serde_json::to_value(status).expect("status should serialize");
        assert_eq!(value["mode"], "rsync");
        assert_eq!(value["state"], "diverged");
    }

    #[test]
    fn execute_rsync_sync_allows_dirty_repo_when_git_safety_checks_disabled() {
        let temp_root = std::env::temp_dir().join(format!(
            "manager-rsync-disabled-git-safety-{}-{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("system time should be after unix epoch")
                .as_nanos()
        ));
        let src_root = temp_root.join("src-root");
        let dest_root = temp_root.join("dest-root");
        std::fs::create_dir_all(src_root.join("@acme/components"))
            .expect("src acme dir should be created");
        std::fs::create_dir_all(dest_root.join("@acme/components"))
            .expect("dest acme dir should be created");
        std::fs::write(src_root.join("@acme/.gitignore"), b"")
            .expect("src gitignore should be written");
        std::fs::write(dest_root.join("@acme/.gitignore"), b"")
            .expect("dest gitignore should be written");
        std::fs::write(src_root.join("@acme/components/button.tsx"), b"incoming\n")
            .expect("src file should be written");
        std::fs::write(dest_root.join("@acme/components/button.tsx"), b"current\n")
            .expect("dest file should be written");

        let init_status = std::process::Command::new("git")
            .args(["init", "-b", "main"])
            .current_dir(&dest_root)
            .status()
            .expect("git init should run");
        assert!(init_status.success(), "git init should succeed");
        let add_status = std::process::Command::new("git")
            .args(["add", "."])
            .current_dir(&dest_root)
            .status()
            .expect("git add should run");
        assert!(add_status.success(), "git add should succeed");
        let commit_status = std::process::Command::new("git")
            .args([
                "-c",
                "user.name=Manager Test",
                "-c",
                "user.email=manager@example.com",
                "commit",
                "-m",
                "initial commit",
            ])
            .current_dir(&dest_root)
            .status()
            .expect("git commit should run");
        assert!(commit_status.success(), "git commit should succeed");

        std::fs::write(dest_root.join("README.md"), b"dirty repo\n")
            .expect("unrelated dirty file should be written");

        let result = execute_rsync_sync(
            src_root.to_string_lossy().into_owned(),
            dest_root.to_string_lossy().into_owned(),
            false,
        );

        let synced = std::fs::read_to_string(dest_root.join("@acme/components/button.tsx"))
            .expect("dest file should be readable");
        let dirty_repo_file = std::fs::read_to_string(dest_root.join("README.md"))
            .expect("dirty repo file should still be readable");
        let _ = std::fs::remove_dir_all(&temp_root);

        result.expect("dirty repo should not block sync when git safety checks are disabled");
        assert_eq!(synced, "incoming\n");
        assert_eq!(dirty_repo_file, "dirty repo\n");
    }

    #[test]
    fn execute_rsync_conflict_resolutions_does_not_mutate_before_cleanliness_check() {
        let temp_root = std::env::temp_dir().join(format!(
            "manager-rsync-conflict-clean-check-{}-{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("system time should be after unix epoch")
                .as_nanos()
        ));
        let src_root = temp_root.join("src-root");
        let dest_root = temp_root.join("dest-root");
        std::fs::create_dir_all(src_root.join("@acme/components"))
            .expect("src acme dir should be created");
        std::fs::create_dir_all(dest_root.join("@acme/components"))
            .expect("dest acme dir should be created");
        std::fs::write(src_root.join("@acme/.gitignore"), b"")
            .expect("src gitignore should be written");
        std::fs::write(dest_root.join("@acme/.gitignore"), b"")
            .expect("dest gitignore should be written");
        std::fs::write(src_root.join("@acme/components/button.tsx"), b"incoming\n")
            .expect("src file should be written");
        std::fs::write(dest_root.join("@acme/components/button.tsx"), b"current\n")
            .expect("dest file should be written");

        let init_status = std::process::Command::new("git")
            .args(["init", "-b", "main"])
            .current_dir(&dest_root)
            .status()
            .expect("git init should run");
        assert!(init_status.success(), "git init should succeed");
        let add_status = std::process::Command::new("git")
            .args(["add", "."])
            .current_dir(&dest_root)
            .status()
            .expect("git add should run");
        assert!(add_status.success(), "git add should succeed");
        let commit_status = std::process::Command::new("git")
            .args([
                "-c",
                "user.name=Manager Test",
                "-c",
                "user.email=manager@example.com",
                "commit",
                "-m",
                "initial commit",
            ])
            .current_dir(&dest_root)
            .status()
            .expect("git commit should run");
        assert!(commit_status.success(), "git commit should succeed");

        std::fs::write(dest_root.join("README.md"), b"dirty repo\n")
            .expect("unrelated dirty file should be written");

        let preview = preview_sync_changes(
            src_root.to_string_lossy().into_owned(),
            dest_root.to_string_lossy().into_owned(),
            "to-primary".to_string(),
        )
        .expect("preview should succeed");
        let fingerprint = preview.fingerprint.clone();

        let result = execute_rsync_conflict_resolutions(RsyncConflictExecutionRequest {
            src: src_root.to_string_lossy().into_owned(),
            dest: dest_root.to_string_lossy().into_owned(),
            direction: "to-primary".to_string(),
            fingerprint,
            resolutions: vec![SyncConflictResolutionSelection {
                path: "components/button.tsx".to_string(),
                resolution: SyncConflictResolution::Incoming,
            }],
            file_actions: vec![],
            use_git_safety_checks: true,
        });

        let file_contents = std::fs::read_to_string(dest_root.join("@acme/components/button.tsx"))
            .expect("dest conflict file should still be readable");
        let _ = std::fs::remove_dir_all(&temp_root);

        let error = result.expect_err("dirty destination repo should block execution");
        assert!(error.contains("dirty"));
        assert_eq!(file_contents, "current\n");
    }

    #[test]
    fn apply_single_rsync_preview_action_rejects_stale_preview_fingerprint() {
        let temp_root = std::env::temp_dir().join(format!(
            "manager-single-preview-action-stale-{}-{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("system time should be after unix epoch")
                .as_nanos()
        ));
        let src_root = temp_root.join("src-root");
        let dest_root = temp_root.join("dest-root");
        std::fs::create_dir_all(src_root.join("@acme/components"))
            .expect("src acme dir should be created");
        std::fs::create_dir_all(dest_root.join("@acme/components"))
            .expect("dest acme dir should be created");
        std::fs::write(src_root.join("@acme/.gitignore"), b"")
            .expect("src gitignore should be written");
        std::fs::write(dest_root.join("@acme/.gitignore"), b"")
            .expect("dest gitignore should be written");
        std::fs::write(src_root.join("@acme/components/button.tsx"), b"incoming\n")
            .expect("src file should be written");
        std::fs::write(dest_root.join("@acme/components/button.tsx"), b"current\n")
            .expect("dest file should be written");

        let init_status = std::process::Command::new("git")
            .args(["init", "-b", "main"])
            .current_dir(&dest_root)
            .status()
            .expect("git init should run");
        assert!(init_status.success(), "git init should succeed");
        let add_status = std::process::Command::new("git")
            .args(["add", "."])
            .current_dir(&dest_root)
            .status()
            .expect("git add should run");
        assert!(add_status.success(), "git add should succeed");
        let commit_status = std::process::Command::new("git")
            .args([
                "-c",
                "user.name=Manager Test",
                "-c",
                "user.email=manager@example.com",
                "commit",
                "-m",
                "initial commit",
            ])
            .current_dir(&dest_root)
            .status()
            .expect("git commit should run");
        assert!(commit_status.success(), "git commit should succeed");

        let preview = preview_sync_changes(
            src_root.to_string_lossy().into_owned(),
            dest_root.to_string_lossy().into_owned(),
            "to-primary".to_string(),
        )
        .expect("preview should succeed");

        std::fs::write(src_root.join("@acme/components/button.tsx"), b"changed-after-preview\n")
            .expect("source file should change after preview");

        let result = apply_single_rsync_preview_action(RsyncPreviewActionRequest {
            src: src_root.to_string_lossy().into_owned(),
            dest: dest_root.to_string_lossy().into_owned(),
            direction: "to-primary".to_string(),
            fingerprint: preview.fingerprint,
            path: "components/button.tsx".to_string(),
            action: SyncPreviewFileAction::Keep,
            change_type: SyncChangeType::Modified,
            use_git_safety_checks: true,
        });

        let file_contents = std::fs::read_to_string(dest_root.join("@acme/components/button.tsx"))
            .expect("dest file should still be readable");
        let _ = std::fs::remove_dir_all(&temp_root);

        let error = result.expect_err("stale preview fingerprint should be rejected");
        assert!(error.contains("stale") || error.contains("Refresh preview"));
        assert_eq!(file_contents, "current\n");
    }

    #[test]
    fn get_repo_metadata_surfaces_git_execution_failures_instead_of_not_repo_message() {
        let temp_root = std::env::temp_dir().join(format!(
            "manager-metadata-missing-dir-{}-{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("system time should be after unix epoch")
                .as_nanos()
        ));
        std::fs::create_dir_all(&temp_root).expect("temp dir should be created");
        let missing_path = temp_root.join("missing-repo");

        let result = get_repo_metadata(missing_path.to_string_lossy().into_owned());

        let _ = std::fs::remove_dir_all(&temp_root);

        let error = result.expect_err("missing path should surface git error");
        assert!(
            !error.contains("not inside a git work tree"),
            "should not collapse execution failure into not-a-repo message: {error}"
        );
    }

    #[test]
    fn resolve_diff_targets_for_added_uses_empty_left_side_contract() {
        let relative = Path::new("components/button.tsx");
        assert_eq!(relative.to_string_lossy(), "components/button.tsx");
    }
}
