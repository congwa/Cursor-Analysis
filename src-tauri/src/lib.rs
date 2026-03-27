use chrono::{TimeZone, Utc};
use rusqlite::types::ValueRef;
use rusqlite::{Connection, OpenFlags, OptionalExtension};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::PathBuf;
use std::time::Duration;
use walkdir::WalkDir;

// 应用版本号
const APP_VERSION: &str = env!("CARGO_PKG_VERSION");

// ==================== 数据结构定义 ====================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StorageInfo {
    pub total_size: u64,
    pub total_size_human: String,
    pub global_storage_size: u64,
    pub global_storage_size_human: String,
    pub history_size: u64,
    pub history_size_human: String,
    pub workspace_storage_size: u64,
    pub workspace_storage_size_human: String,
    pub state_vscdb_size: u64,
    pub state_vscdb_backup_size: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChatSession {
    pub id: String,
    pub name: String,
    pub mode: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub lines_added: i64,
    pub lines_removed: i64,
    pub files_changed: i64,
    pub context_usage: f64,
    pub branch: String,
    pub is_archived: bool,
    pub subtitle: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectStats {
    pub name: String,
    pub path: String,
    pub chat_count: i64,
    pub lines_added: i64,
    pub lines_removed: i64,
    pub files_changed: i64,
    pub chats: Vec<ChatSession>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WorkspaceInfo {
    pub id: String,
    pub created_at: String,
    pub projects: Vec<String>,
    pub chat_count: i64,
    pub lines_added: i64,
    pub lines_removed: i64,
    pub files_changed: i64,
    pub recent_chats: Vec<ChatSession>,
    pub is_multi_project: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DatabaseStats {
    pub item_table_count: i64,
    pub item_table_size: u64,
    pub cursor_disk_kv_count: i64,
    pub cursor_disk_kv_size: u64,
    pub bubble_count: i64,
    pub bubble_size: u64,
    pub composer_count: i64,
    pub composer_size: u64,
    pub checkpoint_count: i64,
    pub checkpoint_size: u64,
    pub agent_kv_count: i64,
    pub agent_kv_size: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OverviewStats {
    pub total_projects: i64,
    pub total_chats: i64,
    pub total_lines_added: i64,
    pub total_lines_removed: i64,
    pub net_lines: i64,
    pub total_files_changed: i64,
    pub agent_mode_count: i64,
    pub chat_mode_count: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AnalysisResult {
    pub storage: StorageInfo,
    pub overview: OverviewStats,
    pub database: DatabaseStats,
    pub projects: Vec<ProjectStats>,
    pub workspaces: Vec<WorkspaceInfo>,
}

// ==================== 工具函数 ====================

/// 获取 Cursor 用户数据路径（跨平台）
fn get_cursor_user_path() -> PathBuf {
    #[cfg(target_os = "macos")]
    {
        let home = dirs::home_dir().expect("Cannot find home directory");
        home.join("Library/Application Support/Cursor/User")
    }
    #[cfg(target_os = "windows")]
    {
        let appdata = std::env::var("APPDATA").expect("Cannot find APPDATA");
        PathBuf::from(appdata).join("Cursor/User")
    }
    #[cfg(target_os = "linux")]
    {
        let home = dirs::home_dir().expect("Cannot find home directory");
        home.join(".config/Cursor/User")
    }
}

/// 获取 Cursor 工作区路径（跨平台）
#[allow(dead_code)]
fn get_cursor_workspaces_path() -> PathBuf {
    #[cfg(target_os = "macos")]
    {
        let home = dirs::home_dir().expect("Cannot find home directory");
        home.join("Library/Application Support/Cursor/Workspaces")
    }
    #[cfg(target_os = "windows")]
    {
        let appdata = std::env::var("APPDATA").expect("Cannot find APPDATA");
        PathBuf::from(appdata).join("Cursor/Workspaces")
    }
    #[cfg(target_os = "linux")]
    {
        let home = dirs::home_dir().expect("Cannot find home directory");
        home.join(".config/Cursor/Workspaces")
    }
}

fn format_size(size: u64) -> String {
    const KB: u64 = 1024;
    const MB: u64 = KB * 1024;
    const GB: u64 = MB * 1024;

    if size >= GB {
        format!("{:.2} GB", size as f64 / GB as f64)
    } else if size >= MB {
        format!("{:.2} MB", size as f64 / MB as f64)
    } else if size >= KB {
        format!("{:.2} KB", size as f64 / KB as f64)
    } else {
        format!("{} B", size)
    }
}

fn get_dir_size(path: &PathBuf) -> u64 {
    WalkDir::new(path)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter_map(|e| e.metadata().ok())
        .filter(|m| m.is_file())
        .map(|m| m.len())
        .sum()
}

fn timestamp_to_string(ts: i64) -> Option<String> {
    if ts <= 0 {
        return None;
    }
    let dt = Utc.timestamp_millis_opt(ts);
    match dt {
        chrono::LocalResult::Single(dt) => Some(dt.format("%Y-%m-%d %H:%M").to_string()),
        _ => None,
    }
}

fn open_sqlite_readonly(db_path: &PathBuf) -> Result<Connection, rusqlite::Error> {
    let conn = Connection::open_with_flags(db_path, OpenFlags::SQLITE_OPEN_READ_ONLY)?;
    let _ = conn.busy_timeout(Duration::from_millis(800));
    Ok(conn)
}

fn sqlite_value_to_string(v: ValueRef<'_>) -> Option<String> {
    match v {
        ValueRef::Text(t) => std::str::from_utf8(t).ok().map(|s| s.to_string()),
        ValueRef::Blob(b) => std::str::from_utf8(b).ok().map(|s| s.to_string()),
        _ => None,
    }
}

fn is_uuid_like(s: &str) -> bool {
    if s.len() != 36 {
        return false;
    }
    let bytes = s.as_bytes();
    for (i, &b) in bytes.iter().enumerate() {
        match i {
            8 | 13 | 18 | 23 => {
                if b != b'-' {
                    return false;
                }
            }
            _ => {
                let is_hex = matches!(b, b'0'..=b'9' | b'a'..=b'f' | b'A'..=b'F');
                if !is_hex {
                    return false;
                }
            }
        }
    }
    true
}

fn query_item_table_value(conn: &Connection, key: &str) -> Option<String> {
    conn.query_row(
        "SELECT value FROM ItemTable WHERE key = ?1",
        [key],
        |row| Ok(sqlite_value_to_string(row.get_ref(0)?)),
    )
    .optional()
    .ok()
    .flatten()
    .flatten()
}

fn query_cursor_disk_kv_value(conn: &Connection, key: &str) -> Option<String> {
    conn.query_row(
        "SELECT value FROM cursorDiskKV WHERE key = ?1",
        [key],
        |row| Ok(sqlite_value_to_string(row.get_ref(0)?)),
    )
    .optional()
    .ok()
    .flatten()
    .flatten()
}

fn extract_workspace_composer_ids(conn: &Connection) -> Vec<String> {
    let mut ids: HashSet<String> = HashSet::new();

    // 1) 从 composer.composerData 中提取（新格式里只有 selected/lastFocused）
    if let Some(json_str) = query_item_table_value(conn, "composer.composerData") {
        if let Ok(v) = serde_json::from_str::<serde_json::Value>(&json_str) {
            if let Some(obj) = v.as_object() {
                for k in [
                    "selectedComposerIds",
                    "lastFocusedComposerIds",
                    "composerIds",
                    "allComposerIds",
                ] {
                    if let Some(arr) = obj.get(k).and_then(|x| x.as_array()) {
                        for s in arr.iter().filter_map(|x| x.as_str()) {
                            if is_uuid_like(s) {
                                ids.insert(s.to_string());
                            }
                        }
                    }
                }
            }
        }
    }

    // 2) 从 workbench.panel.composerChatViewPane.* 的 value 中提取
    // value 结构形如：
    // { "workbench.panel.aichat.view.<composerId>": { ... } }
    if let Ok(mut stmt) = conn.prepare(
        "SELECT value FROM ItemTable WHERE key LIKE 'workbench.panel.composerChatViewPane.%'",
    ) {
        if let Ok(mut rows) = stmt.query([]) {
            while let Ok(Some(row)) = rows.next() {
                let json_str = match row.get_ref(0).ok().and_then(sqlite_value_to_string) {
                    Some(s) => s,
                    None => continue,
                };
                let Ok(v) = serde_json::from_str::<serde_json::Value>(&json_str) else {
                    continue;
                };
                let Some(obj) = v.as_object() else {
                    continue;
                };
                for prop in obj.keys() {
                    // 最常见：workbench.panel.aichat.view.<uuid>
                    if let Some(rest) = prop.strip_prefix("workbench.panel.aichat.view.") {
                        if is_uuid_like(rest) {
                            ids.insert(rest.to_string());
                        }
                        continue;
                    }
                    // 兜底：取最后一个 '.' 之后的片段
                    if let Some(pos) = prop.rfind('.') {
                        let candidate = &prop[pos + 1..];
                        if is_uuid_like(candidate) {
                            ids.insert(candidate.to_string());
                        }
                    }
                }
            }
        }
    }

    let mut result: Vec<String> = ids.into_iter().collect();
    result.sort();
    result
}

// ==================== 存储分析 ====================

#[tauri::command]
fn get_storage_info() -> Result<StorageInfo, String> {
    let user_path = get_cursor_user_path();
    
    let global_storage = user_path.join("globalStorage");
    let history = user_path.join("History");
    let workspace_storage = user_path.join("workspaceStorage");
    
    let global_storage_size = get_dir_size(&global_storage);
    let history_size = get_dir_size(&history);
    let workspace_storage_size = get_dir_size(&workspace_storage);
    let total_size = global_storage_size + history_size + workspace_storage_size;
    
    // state.vscdb 大小
    let state_vscdb = global_storage.join("state.vscdb");
    let state_vscdb_backup = global_storage.join("state.vscdb.backup");
    
    let state_vscdb_size = fs::metadata(&state_vscdb).map(|m| m.len()).unwrap_or(0);
    let state_vscdb_backup_size = fs::metadata(&state_vscdb_backup).map(|m| m.len()).unwrap_or(0);
    
    Ok(StorageInfo {
        total_size,
        total_size_human: format_size(total_size),
        global_storage_size,
        global_storage_size_human: format_size(global_storage_size),
        history_size,
        history_size_human: format_size(history_size),
        workspace_storage_size,
        workspace_storage_size_human: format_size(workspace_storage_size),
        state_vscdb_size,
        state_vscdb_backup_size,
    })
}

// ==================== 数据库分析 ====================

#[tauri::command]
fn get_database_stats() -> Result<DatabaseStats, String> {
    let db_path = get_cursor_user_path().join("globalStorage/state.vscdb");
    
    let conn = open_sqlite_readonly(&db_path).map_err(|e| e.to_string())?;
    
    // ItemTable 统计
    let item_count: i64 = conn
        .query_row("SELECT COUNT(*) FROM ItemTable", [], |row| row.get(0))
        .unwrap_or(0);
    
    let item_size: i64 = conn
        .query_row("SELECT COALESCE(SUM(LENGTH(value)), 0) FROM ItemTable", [], |row| row.get(0))
        .unwrap_or(0);
    
    // cursorDiskKV 统计
    let kv_count: i64 = conn
        .query_row("SELECT COUNT(*) FROM cursorDiskKV", [], |row| row.get(0))
        .unwrap_or(0);
    
    let kv_size: i64 = conn
        .query_row("SELECT COALESCE(SUM(LENGTH(value)), 0) FROM cursorDiskKV", [], |row| row.get(0))
        .unwrap_or(0);
    
    // bubbleId 统计
    let bubble_count: i64 = conn
        .query_row("SELECT COUNT(*) FROM cursorDiskKV WHERE key LIKE 'bubbleId:%'", [], |row| row.get(0))
        .unwrap_or(0);
    
    let bubble_size: i64 = conn
        .query_row("SELECT COALESCE(SUM(LENGTH(value)), 0) FROM cursorDiskKV WHERE key LIKE 'bubbleId:%'", [], |row| row.get(0))
        .unwrap_or(0);
    
    // composerData 统计
    let composer_count: i64 = conn
        .query_row("SELECT COUNT(*) FROM cursorDiskKV WHERE key LIKE 'composerData:%'", [], |row| row.get(0))
        .unwrap_or(0);
    
    let composer_size: i64 = conn
        .query_row("SELECT COALESCE(SUM(LENGTH(value)), 0) FROM cursorDiskKV WHERE key LIKE 'composerData:%'", [], |row| row.get(0))
        .unwrap_or(0);
    
    // checkpointId 统计
    let checkpoint_count: i64 = conn
        .query_row("SELECT COUNT(*) FROM cursorDiskKV WHERE key LIKE 'checkpointId:%'", [], |row| row.get(0))
        .unwrap_or(0);
    
    let checkpoint_size: i64 = conn
        .query_row("SELECT COALESCE(SUM(LENGTH(value)), 0) FROM cursorDiskKV WHERE key LIKE 'checkpointId:%'", [], |row| row.get(0))
        .unwrap_or(0);
    
    // agentKv 统计
    let agent_count: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM cursorDiskKV WHERE key LIKE 'agentKv:%' OR key LIKE 'agentKV:%'",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);
    
    let agent_size: i64 = conn
        .query_row(
            "SELECT COALESCE(SUM(LENGTH(value)), 0) FROM cursorDiskKV WHERE key LIKE 'agentKv:%' OR key LIKE 'agentKV:%'",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);
    
    Ok(DatabaseStats {
        item_table_count: item_count,
        item_table_size: item_size as u64,
        cursor_disk_kv_count: kv_count,
        cursor_disk_kv_size: kv_size as u64,
        bubble_count,
        bubble_size: bubble_size as u64,
        composer_count,
        composer_size: composer_size as u64,
        checkpoint_count,
        checkpoint_size: checkpoint_size as u64,
        agent_kv_count: agent_count,
        agent_kv_size: agent_size as u64,
    })
}

// ==================== 项目和会话分析 ====================

fn parse_composer_data(json_str: &str) -> Vec<ChatSession> {
    let mut sessions = Vec::new();
    
    if let Ok(data) = serde_json::from_str::<serde_json::Value>(json_str) {
        if let Some(composers) = data.get("allComposers").and_then(|v| v.as_array()) {
            for c in composers {
                if c.get("type").and_then(|v| v.as_str()) != Some("head") {
                    continue;
                }
                
                let session = ChatSession {
                    id: c.get("composerId").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                    name: c.get("name").and_then(|v| v.as_str()).unwrap_or("Unnamed").to_string(),
                    mode: c.get("unifiedMode").and_then(|v| v.as_str()).unwrap_or("unknown").to_string(),
                    created_at: c.get("createdAt").and_then(|v| v.as_i64()).and_then(timestamp_to_string),
                    updated_at: c.get("lastUpdatedAt").and_then(|v| v.as_i64()).and_then(timestamp_to_string),
                    lines_added: c.get("totalLinesAdded").and_then(|v| v.as_i64()).unwrap_or(0),
                    lines_removed: c.get("totalLinesRemoved").and_then(|v| v.as_i64()).unwrap_or(0),
                    files_changed: c.get("filesChangedCount").and_then(|v| v.as_i64()).unwrap_or(0),
                    context_usage: c.get("contextUsagePercent").and_then(|v| v.as_f64()).unwrap_or(0.0),
                    branch: c.get("createdOnBranch").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                    is_archived: c.get("isArchived").and_then(|v| v.as_bool()).unwrap_or(false),
                    subtitle: c.get("subtitle").and_then(|v| v.as_str()).unwrap_or("").chars().take(100).collect(),
                };
                sessions.push(session);
            }
        }
    }
    
    // 按更新时间排序
    sessions.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
    sessions
}

fn parse_session_from_global_composer_data(json_str: &str, fallback_id: &str) -> Option<ChatSession> {
    let data = serde_json::from_str::<serde_json::Value>(json_str).ok()?;
    let id = data
        .get("composerId")
        .and_then(|v| v.as_str())
        .filter(|s| !s.is_empty())
        .unwrap_or(fallback_id)
        .to_string();

    Some(ChatSession {
        id,
        name: data
            .get("name")
            .and_then(|v| v.as_str())
            .unwrap_or("Unnamed")
            .to_string(),
        mode: data
            .get("unifiedMode")
            .and_then(|v| v.as_str())
            .unwrap_or("unknown")
            .to_string(),
        created_at: data
            .get("createdAt")
            .and_then(|v| v.as_i64())
            .and_then(timestamp_to_string),
        updated_at: data
            .get("lastUpdatedAt")
            .and_then(|v| v.as_i64())
            .and_then(timestamp_to_string),
        lines_added: data
            .get("totalLinesAdded")
            .and_then(|v| v.as_i64())
            .unwrap_or(0),
        lines_removed: data
            .get("totalLinesRemoved")
            .and_then(|v| v.as_i64())
            .unwrap_or(0),
        files_changed: data
            .get("filesChangedCount")
            .and_then(|v| v.as_i64())
            .unwrap_or(0),
        context_usage: data
            .get("contextUsagePercent")
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0),
        branch: data
            .get("createdOnBranch")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string(),
        is_archived: data
            .get("isArchived")
            .and_then(|v| v.as_bool())
            .unwrap_or(false),
        subtitle: data
            .get("subtitle")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .chars()
            .take(100)
            .collect(),
    })
}

fn get_workspace_sessions(workspace_conn: &Connection, global_conn: &Connection) -> Vec<ChatSession> {
    // 旧版本：composer.composerData 直接包含 allComposers
    if let Some(json_str) = query_item_table_value(workspace_conn, "composer.composerData") {
        if let Ok(v) = serde_json::from_str::<serde_json::Value>(&json_str) {
            if v.get("allComposers").and_then(|x| x.as_array()).is_some() {
                return parse_composer_data(&json_str);
            }
        }
    }

    // 新版本：workspace DB 里只存 UI 状态，需要从全局 DB 的 composerData:<id> 拉取
    let composer_ids = extract_workspace_composer_ids(workspace_conn);
    if composer_ids.is_empty() {
        return Vec::new();
    }

    let mut sessions = Vec::new();
    for cid in composer_ids {
        let key = format!("composerData:{}", cid);
        let Some(json_str) = query_cursor_disk_kv_value(global_conn, &key) else {
            continue;
        };
        if let Some(s) = parse_session_from_global_composer_data(&json_str, &cid) {
            sessions.push(s);
        }
    }

    sessions.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
    sessions
}

fn get_workspace_projects(ws_json_path: &PathBuf) -> Vec<String> {
    if let Ok(content) = fs::read_to_string(ws_json_path) {
        if let Ok(data) = serde_json::from_str::<serde_json::Value>(&content) {
            if let Some(folders) = data.get("folders").and_then(|v| v.as_array()) {
                return folders
                    .iter()
                    .filter_map(|f| {
                        f.get("path")
                            .or(f.get("uri"))
                            .and_then(|v| v.as_str())
                            .map(|s| s.replace("file://", "").replace("%20", " "))
                    })
                    .collect();
            }
        }
    }
    Vec::new()
}

#[tauri::command]
fn get_all_projects() -> Result<Vec<ProjectStats>, String> {
    let workspace_storage = get_cursor_user_path().join("workspaceStorage");
    let global_db_path = get_cursor_user_path().join("globalStorage/state.vscdb");
    let global_conn = open_sqlite_readonly(&global_db_path).map_err(|e| e.to_string())?;
    
    let mut projects: HashMap<String, ProjectStats> = HashMap::new();
    
    // 遍历所有 workspaceStorage
    if let Ok(entries) = fs::read_dir(&workspace_storage) {
        for entry in entries.filter_map(|e| e.ok()) {
            let ws_path = entry.path();
            if !ws_path.is_dir() {
                continue;
            }
            
            let ws_json = ws_path.join("workspace.json");
            let db_path = ws_path.join("state.vscdb");
            
            // 获取项目路径（只处理单项目，跳过工作区）
            let mut project_path = String::new();
            if let Ok(content) = fs::read_to_string(&ws_json) {
                if let Ok(data) = serde_json::from_str::<serde_json::Value>(&content) {
                    if let Some(folder) = data.get("folder").and_then(|v| v.as_str()) {
                        project_path = folder.replace("file://", "").replace("%20", " ");
                    }
                    // 跳过多项目工作区，它们会在工作区 Tab 中显示
                }
            }
            
            if project_path.is_empty() {
                continue;
            }
            
            // 从数据库获取会话
            if db_path.exists() {
                if let Ok(conn) = open_sqlite_readonly(&db_path) {
                    let sessions = get_workspace_sessions(&conn, &global_conn);
                    if sessions.is_empty() {
                        continue;
                    }

                    let lines_added: i64 = sessions.iter().map(|s| s.lines_added).sum();
                    let lines_removed: i64 = sessions.iter().map(|s| s.lines_removed).sum();
                    let files_changed: i64 = sessions.iter().map(|s| s.files_changed).sum();

                    let project_name = project_path
                        .split('/')
                        .last()
                        .unwrap_or(&project_path)
                        .to_string();

                    let entry = projects.entry(project_path.clone()).or_insert(ProjectStats {
                        name: project_name,
                        path: project_path.clone(),
                        chat_count: 0,
                        lines_added: 0,
                        lines_removed: 0,
                        files_changed: 0,
                        chats: Vec::new(),
                    });

                    entry.chat_count += sessions.len() as i64;
                    entry.lines_added += lines_added;
                    entry.lines_removed += lines_removed;
                    entry.files_changed += files_changed;
                    entry.chats.extend(sessions);
                }
            }
        }
    }
    
    // 只返回有会话的项目
    let mut result: Vec<ProjectStats> = projects.into_values()
        .filter(|p| p.chat_count > 0)
        .collect();
    result.sort_by(|a, b| b.lines_added.cmp(&a.lines_added));
    
    Ok(result)
}

#[tauri::command]
fn get_workspaces() -> Result<Vec<WorkspaceInfo>, String> {
    let workspace_storage = get_cursor_user_path().join("workspaceStorage");
    let global_db_path = get_cursor_user_path().join("globalStorage/state.vscdb");
    let global_conn = open_sqlite_readonly(&global_db_path).map_err(|e| e.to_string())?;
    
    let mut workspaces = Vec::new();
    
    if let Ok(entries) = fs::read_dir(&workspace_storage) {
        for entry in entries.filter_map(|e| e.ok()) {
            let ws_path = entry.path();
            if !ws_path.is_dir() {
                continue;
            }
            
            let ws_id = ws_path.file_name().unwrap().to_string_lossy().to_string();
            let ws_json = ws_path.join("workspace.json");
            let db_path = ws_path.join("state.vscdb");
            
            let mut info = WorkspaceInfo {
                id: ws_id.clone(),
                created_at: String::new(),
                projects: Vec::new(),
                chat_count: 0,
                lines_added: 0,
                lines_removed: 0,
                files_changed: 0,
                recent_chats: Vec::new(),
                is_multi_project: false,
            };
            
            // 解析 workspace.json
            if let Ok(content) = fs::read_to_string(&ws_json) {
                if let Ok(data) = serde_json::from_str::<serde_json::Value>(&content) {
                    if let Some(folder) = data.get("folder").and_then(|v| v.as_str()) {
                        info.projects.push(folder.replace("file://", "").replace("%20", " "));
                    } else if let Some(workspace) = data.get("workspace").and_then(|v| v.as_str()) {
                        info.is_multi_project = true;
                        let ws_file = workspace.replace("file://", "").replace("%20", " ");
                        let ws_file_path = PathBuf::from(&ws_file);
                        
                        // 提取时间戳
                        if let Some(ts_str) = ws_file.split('/').find(|s| s.chars().all(|c| c.is_numeric()) && s.len() > 10) {
                            if let Ok(ts) = ts_str.parse::<i64>() {
                                info.created_at = timestamp_to_string(ts).unwrap_or_default();
                            }
                        }
                        
                        info.projects = get_workspace_projects(&ws_file_path);
                    }
                }
            }
            
            // 从数据库获取统计
            if db_path.exists() {
                if let Ok(conn) = open_sqlite_readonly(&db_path) {
                    let sessions = get_workspace_sessions(&conn, &global_conn);

                    info.chat_count = sessions.len() as i64;
                    info.lines_added = sessions.iter().map(|s| s.lines_added).sum();
                    info.lines_removed = sessions.iter().map(|s| s.lines_removed).sum();
                    info.files_changed = sessions.iter().map(|s| s.files_changed).sum();
                    // 返回所有会话，由前端进行分页和过滤
                    info.recent_chats = sessions;
                }
            }
            
            // 只返回有会话的工作区
            if info.chat_count > 0 {
                workspaces.push(info);
            }
        }
    }
    
    workspaces.sort_by(|a, b| b.lines_added.cmp(&a.lines_added));
    Ok(workspaces)
}

#[tauri::command]
fn get_overview() -> Result<OverviewStats, String> {
    let projects = get_all_projects()?;
    
    let total_projects = projects.len() as i64;
    let total_chats: i64 = projects.iter().map(|p| p.chat_count).sum();
    let total_lines_added: i64 = projects.iter().map(|p| p.lines_added).sum();
    let total_lines_removed: i64 = projects.iter().map(|p| p.lines_removed).sum();
    let total_files_changed: i64 = projects.iter().map(|p| p.files_changed).sum();
    
    let mut agent_count = 0i64;
    let mut chat_count = 0i64;
    
    for p in &projects {
        for c in &p.chats {
            if c.mode == "agent" {
                agent_count += 1;
            } else {
                chat_count += 1;
            }
        }
    }
    
    Ok(OverviewStats {
        total_projects,
        total_chats,
        total_lines_added,
        total_lines_removed,
        net_lines: total_lines_added - total_lines_removed,
        total_files_changed,
        agent_mode_count: agent_count,
        chat_mode_count: chat_count,
    })
}

#[tauri::command]
fn get_full_analysis() -> Result<AnalysisResult, String> {
    let storage = get_storage_info()?;
    let overview = get_overview()?;
    let database = get_database_stats()?;
    let projects = get_all_projects()?;
    let workspaces = get_workspaces()?;
    
    Ok(AnalysisResult {
        storage,
        overview,
        database,
        projects,
        workspaces,
    })
}

// ==================== 版本信息 ====================

#[tauri::command]
fn get_app_version() -> String {
    APP_VERSION.to_string()
}

// ==================== 垃圾桶数据库 ====================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TrashItem {
    pub id: i64,
    pub chat_id: String,
    pub chat_name: String,
    pub project_path: String,
    pub mode: String,
    pub lines_added: i64,
    pub lines_removed: i64,
    pub files_changed: i64,
    pub deleted_at: String,
    pub original_data: String,
}

/// 获取垃圾桶数据库路径（跨平台）
fn get_trash_db_path() -> PathBuf {
    get_cursor_user_path().join("cursor-analysis-trash.db")
}

fn init_trash_db() -> Result<Connection, String> {
    let db_path = get_trash_db_path();
    let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;
    
    conn.execute(
        "CREATE TABLE IF NOT EXISTS trash (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id TEXT NOT NULL,
            chat_name TEXT,
            project_path TEXT,
            mode TEXT,
            lines_added INTEGER DEFAULT 0,
            lines_removed INTEGER DEFAULT 0,
            files_changed INTEGER DEFAULT 0,
            deleted_at TEXT NOT NULL,
            original_data TEXT
        )",
        [],
    ).map_err(|e| e.to_string())?;
    
    Ok(conn)
}

fn add_to_trash(chat: &serde_json::Value, project_path: &str) -> Result<(), String> {
    let conn = init_trash_db()?;
    
    let chat_id = chat.get("composerId").and_then(|v| v.as_str()).unwrap_or("");
    let chat_name = chat.get("name").and_then(|v| v.as_str()).unwrap_or("Unnamed");
    let mode = chat.get("unifiedMode").and_then(|v| v.as_str()).unwrap_or("unknown");
    let lines_added = chat.get("totalLinesAdded").and_then(|v| v.as_i64()).unwrap_or(0);
    let lines_removed = chat.get("totalLinesRemoved").and_then(|v| v.as_i64()).unwrap_or(0);
    let files_changed = chat.get("filesChangedCount").and_then(|v| v.as_i64()).unwrap_or(0);
    let deleted_at = Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
    let original_data = serde_json::to_string(chat).unwrap_or_default();
    
    conn.execute(
        "INSERT INTO trash (chat_id, chat_name, project_path, mode, lines_added, lines_removed, files_changed, deleted_at, original_data)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        [
            chat_id,
            chat_name,
            project_path,
            mode,
            &lines_added.to_string(),
            &lines_removed.to_string(),
            &files_changed.to_string(),
            &deleted_at,
            &original_data,
        ],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
fn get_trash_items() -> Result<Vec<TrashItem>, String> {
    let conn = init_trash_db()?;
    
    let mut stmt = conn.prepare(
        "SELECT id, chat_id, chat_name, project_path, mode, lines_added, lines_removed, files_changed, deleted_at, original_data 
         FROM trash ORDER BY deleted_at DESC"
    ).map_err(|e| e.to_string())?;
    
    let items = stmt.query_map([], |row| {
        Ok(TrashItem {
            id: row.get(0)?,
            chat_id: row.get(1)?,
            chat_name: row.get(2)?,
            project_path: row.get(3)?,
            mode: row.get(4)?,
            lines_added: row.get(5)?,
            lines_removed: row.get(6)?,
            files_changed: row.get(7)?,
            deleted_at: row.get(8)?,
            original_data: row.get(9)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut result = Vec::new();
    for item in items {
        if let Ok(i) = item {
            result.push(i);
        }
    }
    
    Ok(result)
}

#[tauri::command]
fn clear_trash() -> Result<i64, String> {
    let conn = init_trash_db()?;
    let count: i64 = conn.query_row("SELECT COUNT(*) FROM trash", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM trash", []).map_err(|e| e.to_string())?;
    Ok(count)
}

#[tauri::command]
fn delete_trash_item(trash_id: i64) -> Result<bool, String> {
    let conn = init_trash_db()?;
    let affected = conn.execute("DELETE FROM trash WHERE id = ?", [trash_id])
        .map_err(|e| e.to_string())?;
    Ok(affected > 0)
}

// ==================== 删除功能 ====================

fn find_workspace_db_by_project(project_path: &str) -> Option<PathBuf> {
    let workspace_storage = get_cursor_user_path().join("workspaceStorage");
    
    if let Ok(entries) = fs::read_dir(&workspace_storage) {
        for entry in entries.filter_map(|e| e.ok()) {
            let ws_path = entry.path();
            if !ws_path.is_dir() {
                continue;
            }
            
            let ws_json = ws_path.join("workspace.json");
            if let Ok(content) = fs::read_to_string(&ws_json) {
                if let Ok(data) = serde_json::from_str::<serde_json::Value>(&content) {
                    // 检查单项目工作区
                    if let Some(folder) = data.get("folder").and_then(|v| v.as_str()) {
                        let folder_path = folder.replace("file://", "").replace("%20", " ");
                        if folder_path == project_path {
                            let db_path = ws_path.join("state.vscdb");
                            if db_path.exists() {
                                return Some(db_path);
                            }
                        }
                    }
                    // 检查多项目工作区
                    if let Some(workspace) = data.get("workspace").and_then(|v| v.as_str()) {
                        let ws_file = workspace.replace("file://", "").replace("%20", " ");
                        let ws_file_path = PathBuf::from(&ws_file);
                        let projects = get_workspace_projects(&ws_file_path);
                        if projects.iter().any(|p| p == project_path) || project_path.contains(" + ") {
                            let db_path = ws_path.join("state.vscdb");
                            if db_path.exists() {
                                return Some(db_path);
                            }
                        }
                    }
                }
            }
        }
    }
    None
}

fn open_sqlite_rw(db_path: &PathBuf) -> Result<Connection, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    let _ = conn.busy_timeout(Duration::from_millis(800));
    Ok(conn)
}

fn delete_chat_internal(
    ws_conn: &Connection,
    global_conn: &Connection,
    chat_id: &str,
    project_path: &str,
) -> Result<bool, String> {
    let mut deleted = false;
    
    // 1. 全局 DB 获取并保存到垃圾桶（新版本）
    let global_key = format!("composerData:{}", chat_id);
    if let Ok(Some(json_str)) = global_conn.query_row(
        "SELECT value FROM cursorDiskKV WHERE key = ?1",
        [&global_key],
        |row| Ok(sqlite_value_to_string(row.get_ref(0).unwrap())),
    ) {
        if let Ok(chat_val) = serde_json::from_str::<serde_json::Value>(&json_str) {
            let _ = add_to_trash(&chat_val, project_path);
            deleted = true;
        }
    }
    
    // 2. 工作区 DB 更新 composer.composerData
    if let Ok(mut stmt) = ws_conn.prepare("SELECT value FROM ItemTable WHERE key = 'composer.composerData'") {
        if let Ok(value) = stmt.query_row([], |row| row.get::<_, String>(0)) {
            if let Ok(mut data) = serde_json::from_str::<serde_json::Value>(&value) {
                let mut data_changed = false;
                
                // 处理旧版本：allComposers 数组
                if let Some(composers) = data.get_mut("allComposers").and_then(|v| v.as_array_mut()) {
                    let original_len = composers.len();
                    
                    if !deleted {
                        for c in composers.iter() {
                            if c.get("composerId").and_then(|v| v.as_str()) == Some(chat_id) {
                                let _ = add_to_trash(c, project_path);
                                deleted = true;
                                break;
                            }
                        }
                    }
                    
                    composers.retain(|c| c.get("composerId").and_then(|v| v.as_str()) != Some(chat_id));
                    if composers.len() < original_len {
                        data_changed = true;
                    }
                }
                
                // 处理新版本：各个 ID 数组
                if let Some(obj) = data.as_object_mut() {
                    for k in ["selectedComposerIds", "lastFocusedComposerIds", "composerIds", "allComposerIds"] {
                        if let Some(arr_val) = obj.get_mut(k) {
                            if let Some(arr) = arr_val.as_array_mut() {
                                let original_len = arr.len();
                                arr.retain(|v| v.as_str() != Some(chat_id));
                                if arr.len() < original_len {
                                    data_changed = true;
                                }
                            }
                        }
                    }
                }
                
                if data_changed {
                    if let Ok(new_value) = serde_json::to_string(&data) {
                        let _ = ws_conn.execute(
                            "UPDATE ItemTable SET value = ? WHERE key = 'composer.composerData'",
                            [&new_value],
                        );
                    }
                }
            }
        }
    }
    
    // 3. 工作区 ItemTable 清理面板引用
    let _ = ws_conn.execute(
        "DELETE FROM ItemTable WHERE key = ?",
        [format!("workbench.panel.aichat.view.{}", chat_id)],
    );
    
    // 4. 从工作区和全局 DB 移除二进制及日志数据
    let delete_from_conn = |conn: &Connection| {
        let _ = conn.execute(
            "DELETE FROM cursorDiskKV WHERE key = ?",
            [format!("composerData:{}", chat_id)],
        );
        let _ = conn.execute(
            "DELETE FROM cursorDiskKV WHERE key LIKE ?",
            [format!("bubbleId:{}:%", chat_id)],
        );
        let _ = conn.execute(
            "DELETE FROM cursorDiskKV WHERE key LIKE ?",
            [format!("checkpointId:{}:%", chat_id)],
        );
    };
    
    delete_from_conn(ws_conn);
    delete_from_conn(global_conn);
    
    Ok(true)
}

#[tauri::command]
fn delete_chat(project_path: String, chat_id: String) -> Result<bool, String> {
    let db_path = find_workspace_db_by_project(&project_path)
        .ok_or_else(|| format!("找不到项目 {} 的数据库", project_path))?;
    
    let ws_conn = open_sqlite_rw(&db_path)?;
    let global_db_path = get_cursor_user_path().join("globalStorage/state.vscdb");
    let global_conn = open_sqlite_rw(&global_db_path)?;
    
    delete_chat_internal(&ws_conn, &global_conn, &chat_id, &project_path)
}

#[tauri::command]
fn delete_chats_batch(project_path: String, chat_ids: Vec<String>) -> Result<i64, String> {
    if chat_ids.is_empty() {
        return Ok(0);
    }
    
    let db_path = find_workspace_db_by_project(&project_path)
        .ok_or_else(|| format!("找不到项目 {} 的数据库", project_path))?;
    
    let ws_conn = open_sqlite_rw(&db_path)?;
    let global_db_path = get_cursor_user_path().join("globalStorage/state.vscdb");
    let global_conn = open_sqlite_rw(&global_db_path)?;
    
    let mut deleted_count = 0i64;
    for chat_id in chat_ids {
        if delete_chat_internal(&ws_conn, &global_conn, &chat_id, &project_path).unwrap_or(false) {
            deleted_count += 1;
        }
    }
    
    Ok(deleted_count)
}

#[tauri::command]
fn delete_project_chats(project_path: String) -> Result<i64, String> {
    let db_path = find_workspace_db_by_project(&project_path)
        .ok_or_else(|| format!("找不到项目 {} 的数据库", project_path))?;
    
    let ws_conn = open_sqlite_rw(&db_path)?;
    let global_db_path = get_cursor_user_path().join("globalStorage/state.vscdb");
    let global_conn = open_sqlite_rw(&global_db_path)?;
    
    let sessions = get_workspace_sessions(&ws_conn, &global_conn);
    let mut deleted_count = 0i64;
    
    for session in sessions {
        if delete_chat_internal(&ws_conn, &global_conn, &session.id, &project_path).unwrap_or(false) {
            deleted_count += 1;
        }
    }
    
    Ok(deleted_count)
}

#[tauri::command]
fn delete_workspace_chats(workspace_id: String) -> Result<i64, String> {
    let workspace_storage = get_cursor_user_path().join("workspaceStorage");
    let ws_path = workspace_storage.join(&workspace_id);
    let db_path = ws_path.join("state.vscdb");
    
    if !db_path.exists() {
        return Err(format!("找不到工作区 {} 的数据库", workspace_id));
    }
    
    let ws_json = ws_path.join("workspace.json");
    let project_path = if let Ok(content) = fs::read_to_string(&ws_json) {
        if let Ok(data) = serde_json::from_str::<serde_json::Value>(&content) {
            if let Some(folder) = data.get("folder").and_then(|v| v.as_str()) {
                folder.replace("file://", "").replace("%20", " ")
            } else {
                format!("[工作区] {}", workspace_id)
            }
        } else {
            format!("[工作区] {}", workspace_id)
        }
    } else {
        format!("[工作区] {}", workspace_id)
    };
    
    let ws_conn = open_sqlite_rw(&db_path)?;
    let global_db_path = get_cursor_user_path().join("globalStorage/state.vscdb");
    let global_conn = open_sqlite_rw(&global_db_path)?;
    
    let sessions = get_workspace_sessions(&ws_conn, &global_conn);
    let mut deleted_count = 0i64;
    
    for session in sessions {
        if delete_chat_internal(&ws_conn, &global_conn, &session.id, &project_path).unwrap_or(false) {
            deleted_count += 1;
        }
    }
    
    Ok(deleted_count)
}

// ==================== 应用入口 ====================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_storage_info,
            get_database_stats,
            get_all_projects,
            get_workspaces,
            get_overview,
            get_full_analysis,
            get_app_version,
            get_trash_items,
            clear_trash,
            delete_trash_item,
            delete_chat,
            delete_chats_batch,
            delete_project_chats,
            delete_workspace_chats
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
