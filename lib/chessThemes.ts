export interface BoardTheme {
  id: string;
  name: string;
  light: string;
  dark: string;
  selected: string;
  lastMove: string;
}

export const BOARD_THEMES: BoardTheme[] = [
  { id: "brown",  name: "Classic Brown",   light: "#f0d9b5", dark: "#b58863", selected: "#f7ec74", lastMove: "#cdd26a" },
  { id: "green",  name: "Lichess Green",   light: "#eeeed2", dark: "#769656", selected: "#f6f669", lastMove: "#baca44" },
  { id: "blue",   name: "Ocean Blue",      light: "#dee3e6", dark: "#8ca2ad", selected: "#f7ec74", lastMove: "#a9c2c9" },
  { id: "purple", name: "Midnight Purple", light: "#e6d9f2", dark: "#8877b3", selected: "#f0c93a", lastMove: "#a893d1" },
  { id: "ice",    name: "Ice",             light: "#f5fbff", dark: "#a9d3e8", selected: "#ffe98f", lastMove: "#bfe3f5" },
  { id: "coral",  name: "Coral",           light: "#f7e5df", dark: "#c17a63", selected: "#ffe27a", lastMove: "#d99b84" },
];

export const DEFAULT_THEME_ID = "brown";

export function getTheme(id: string): BoardTheme {
  return BOARD_THEMES.find((t) => t.id === id) ?? BOARD_THEMES[0];
}