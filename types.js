// action.type naming rule:
// UI_* ... User Action
// SYS_* ... System Action
// SET_*, UPDATE_*, INITIALIZE ... Reducer Action
export const UI_BUTTON_CLICKED = 'UI_BUTTON_CLICKED';
export const UI_KEY_DOWN = 'UI_KEY_DOWN';

export const SYS_GAME_START = 'SYS_GAME_START';
export const SYS_TIME_TICK = 'SYS_TIME_TICK';
export const SYS_GAME_QUIT = 'SYS_GAME_QUIT';

export const UPDATE_CELL = 'UPDATE_CELL';
export const SET_BOARD = 'SET_BOARD';
export const SET_GAME_RUNNING = 'SET_GAME_RUNNING';
