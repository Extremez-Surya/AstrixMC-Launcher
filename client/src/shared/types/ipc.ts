// IPC Channel constants and types shared between main and renderer

export const IPC_CHANNELS = {
  // Window controls
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_IS_MAXIMIZED: 'window:is-maximized',

  // Auth
  AUTH_MICROSOFT_LOGIN: 'auth:microsoft-login',
  AUTH_OFFLINE_LOGIN: 'auth:offline-login',
  AUTH_GET_ACCOUNTS: 'auth:get-accounts',
  AUTH_REMOVE_ACCOUNT: 'auth:remove-account',
  AUTH_SET_DEFAULT: 'auth:set-default',
  AUTH_UPDATE_ACCOUNT: 'auth:update-account',
  AUTH_REFRESH: 'auth:refresh',

  // Launch
  LAUNCH_GET_VERSIONS: 'launch:get-versions',
  LAUNCH_START: 'launch:start',
  LAUNCH_STOP: 'launch:stop',
  LAUNCH_GET_JAVA: 'launch:get-java',
  LAUNCH_PROGRESS: 'launch:progress',
  LAUNCH_GET_STATUS: 'launch:get-status',
  LAUNCH_GET_CURRENT_LOGS: 'launch:get-current-logs',
  LAUNCH_CLEAR_CURRENT_LOGS: 'launch:clear-current-logs',

  // Instances
  INSTANCES_LIST: 'instances:list',
  INSTANCES_CREATE: 'instances:create',
  INSTANCES_UPDATE: 'instances:update',
  INSTANCES_DELETE: 'instances:delete',
  INSTANCES_DELETE_VERSION: 'instances:delete-version',
  INSTANCES_DUPLICATE: 'instances:duplicate',
  INSTANCES_OPEN_FOLDER: 'instances:open-folder',
  INSTANCES_GET_DETAIL: 'instances:get-detail',

  // Mods
  MODS_SEARCH: 'mods:search',
  MODS_GET_DETAILS: 'mods:get-details',
  MODS_GET_VERSIONS: 'mods:get-versions',
  MODS_INSTALL: 'mods:install',
  MODS_REMOVE: 'mods:remove',
  MODS_LIST_INSTALLED: 'mods:list-installed',
  MODS_TOGGLE: 'mods:toggle',
  MODS_CHECK_UPDATES: 'mods:check-updates',
  MODS_CHECK_FPS_COMPATIBILITY: 'mods:check-fps-compatibility',

  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  SETTINGS_RESET: 'settings:reset',
  SETTINGS_GET_SYSTEM_INFO: 'settings:get-system-info',
  SETTINGS_SELECT_JAVA_FILE: 'settings:select-java-file',
  SETTINGS_SELECT_WALLPAPER: 'settings:select-wallpaper',
  SETTINGS_OPEN_DIR: 'settings:open-dir',

  // Prism Launcher Features
  INSTANCES_GET_FILES: 'instances:get-files',
  INSTANCES_TOGGLE_FILE: 'instances:toggle-file',
  INSTANCES_DELETE_FILE: 'instances:delete-file',
  INSTANCES_BACKUP_WORLD: 'instances:backup-world',
  INSTANCES_EXPORT: 'instances:export',
  INSTANCES_IMPORT: 'instances:import',
  LOGS_UPLOAD: 'logs:upload',

  // Cosmetics & Skins
  COSMETICS_GET: 'cosmetics:get',
  COSMETICS_SAVE: 'cosmetics:save',
  COSMETICS_UPLOAD_SKIN: 'cosmetics:upload-skin',
  COSMETICS_SYNC_MOJANG: 'cosmetics:sync-mojang',

  // Server Finder
  SERVERS_FETCH_PUBLIC: 'servers:fetch-public',
  SERVERS_PING_STATUS: 'servers:ping-status',

  // Client In-Game Title Screen & UI Studio
  CLIENT_UI_APPLY_THEME: 'client-ui:apply-theme',
  CLIENT_UI_GET_THEME: 'client-ui:get-theme',

  // Presets & Astrix Client Profiles
  PRESETS_GET_ALL: 'presets:get-all',
  PRESETS_INSTALL_OR_SYNC: 'presets:install-or-sync',
  PRESETS_ENSURE_DEFAULT: 'presets:ensure-default',

  // Discord Rich Presence & RPC Studio
  RPC_GET_STATUS: 'rpc:get-status',
  RPC_UPDATE_PRESENCE: 'rpc:update-presence',
  RPC_TOGGLE: 'rpc:toggle',
  SETTINGS_CHECK_UPDATES: 'settings:check-updates',
  SETTINGS_UPLOAD_RPC_IMAGE: 'settings:upload-rpc-image'
} as const

export type IPCChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]
