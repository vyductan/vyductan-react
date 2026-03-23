mod acme_sync;

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
struct RegistryFile {
    path: String,
    target: String,
    #[serde(rename = "type")]
    file_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct RegistryItem {
    name: String,
    title: String,
    path: String,
    #[serde(rename = "type")]
    item_type: String,
    files: Vec<RegistryFile>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Registry {
    #[serde(rename = "$schema")]
    schema: Option<String>,
    name: String,
    homepage: Option<String>,
    items: Vec<RegistryItem>,
}

#[tauri::command]
fn get_registry_components(app_handle: tauri::AppHandle) -> Result<Vec<RegistryItem>, String> {
    // Determine path to registry.json safely considering workspace location
    let registry_path = PathBuf::from("../../@acme/ui/src/registry.json");
    let content = fs::read_to_string(&registry_path).map_err(|e| format!("Failed to read registry.json at {:?}: {}", registry_path, e))?;
    let registry: Registry = serde_json::from_str(&content).map_err(|e| format!("Failed to parse registry.json: {}", e))?;
    
    Ok(registry.items)
}

#[tauri::command]
fn sync_component(component_name: String, target_workspace_path: String) -> Result<String, String> {
    let registry_path = PathBuf::from("../../@acme/ui/src/registry.json");
    let content = fs::read_to_string(&registry_path).map_err(|e| format!("Failed to read registry.json: {}", e))?;
    let registry: Registry = serde_json::from_str(&content).map_err(|e| format!("Failed to parse registry.json: {}", e))?;

    let item = registry.items.into_iter().find(|i| i.name == component_name)
        .ok_or_else(|| format!("Component {} not found in registry", component_name))?;

    let target_base = PathBuf::from(&target_workspace_path).join("src");
    let source_base = PathBuf::from("../../@acme/ui/src");

    let mut copied_files = Vec::new();
    for file in item.files {
        let source_path = source_base.join(&file.path);
        let target_path = target_base.join(&file.target);

        // Ensure parent directories exist
        if let Some(parent) = target_path.parent() {
            fs::create_dir_all(parent).map_err(|e| format!("Failed to create target directory: {}", e))?;
        }

        // Copy file
        fs::copy(&source_path, &target_path).map_err(|e| format!("Failed to copy file {:?} to {:?}: {}", source_path, target_path, e))?;
        copied_files.push(file.target);
    }

    Ok(format!("Successfully synced component '{}':\n{}", component_name, copied_files.join("\n")))
}

#[tauri::command]
fn sync_generic_config(target_workspace_path: String) -> Result<String, String> {
    let files_to_copy = vec![".gitignore", "eslint.config.ts", "package.json"];
    
    let source_base = PathBuf::from("../../@acme/ui/");
    let target_base = PathBuf::from(&target_workspace_path);
    
    let mut copied_files = Vec::new();
    
    for file in files_to_copy {
        let source_path = source_base.join(file);
        let target_path = target_base.join(file);
        
        if source_path.exists() {
            fs::copy(&source_path, &target_path).map_err(|e| format!("Failed to copy config file {}: {}", file, e))?;
            copied_files.push(file.to_string());
        }
    }
    
    Ok(format!("Successfully synced configs:\n{}", copied_files.join("\n")))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![
      get_registry_components,
      sync_component,
      sync_generic_config,
      acme_sync::preview_sync_changes,
      acme_sync::preview_sync_file_diff,
      acme_sync::get_sync_conflict_detail,
      acme_sync::delete_sync_file,
      acme_sync::get_latest_modified,
      acme_sync::get_repo_metadata,
      acme_sync::get_repo_remote_status,
      acme_sync::get_sync_status,
      acme_sync::execute_rsync_sync,
      acme_sync::apply_single_rsync_preview_action,
      acme_sync::execute_rsync_conflict_resolutions,
      acme_sync::execute_subtree_sync,
      acme_sync::execute_subtree_add,
      acme_sync::preview_subtree_sync
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        // app.handle().plugin(tauri_plugin_log::Builder::default().level(log::LevelFilter::Info).build())?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
