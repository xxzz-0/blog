// 主题管理工具

// 主题类型
export const ThemeType = {
  LIGHT: 'light',
  DARK: 'dark'
};

// 获取当前主题
export const getTheme = () => {
  return localStorage.getItem('theme') || ThemeType.LIGHT;
};

// 设置主题
export const setTheme = (theme) => {
  localStorage.setItem('theme', theme);
  applyTheme(theme);
};

// 应用主题
const applyTheme = (theme) => {
  if (theme === ThemeType.DARK) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// 初始化主题
export const initTheme = () => {
  const theme = getTheme();
  applyTheme(theme);
};

// 切换主题
export const toggleTheme = () => {
  const currentTheme = getTheme();
  const newTheme = currentTheme === ThemeType.LIGHT ? ThemeType.DARK : ThemeType.LIGHT;
  setTheme(newTheme);
  return newTheme;
};