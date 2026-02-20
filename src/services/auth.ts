import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
}

// 邮箱注册
export async function signUp(email: string, password: string, displayName?: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { display_name: displayName || email.split('@')[0] },
        },
    });
    if (error) throw error;
    return data;
}

// 邮箱登录
export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
}

// 登出
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

// 获取当前 session
export async function getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
}

// 获取当前用户
export async function getUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
}

// 监听认证状态变化
export function onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user ?? null);
    });
}
