import { defineStore } from 'pinia';

interface UserState {
  isLoggedIn: boolean;
  userInfo: {
    id: number;
    username: string;
    name: string;
    role: string;
    permissions: string[];
  } | null;
  token: string | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    isLoggedIn: false,
    userInfo: null,
    token: null,
  }),
  
  getters: {
    hasPermission: (state) => (permission: string) => {
      if (!state.userInfo) return false;
      if (state.userInfo.role === 'admin') return true;
      return state.userInfo.permissions.includes(permission);
    },
  },
  
  actions: {
    login(token: string, userInfo: any) {
      this.isLoggedIn = true;
      this.token = token;
      this.userInfo = userInfo;
      localStorage.setItem('token', token);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    },
    
    logout() {
      this.isLoggedIn = false;
      this.token = null;
      this.userInfo = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    },
    
    initUser() {
      const token = localStorage.getItem('token');
      const userInfoStr = localStorage.getItem('userInfo');
      if (token && userInfoStr) {
        this.isLoggedIn = true;
        this.token = token;
        this.userInfo = JSON.parse(userInfoStr);
      }
    },
  },
});