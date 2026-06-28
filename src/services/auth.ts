import { auth, db } from '../lib/firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut as firebaseSignOut, 
    onAuthStateChanged as firebaseOnAuthStateChanged,
    updateProfile,
    User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export type User = FirebaseUser;

export interface AuthState {
    user: FirebaseUser | null;
    loading: boolean;
}

// 邮箱注册
export async function signUp(email: string, password: string, displayName?: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const name = displayName || email.split('@')[0];
    await updateProfile(user, { displayName: name });

    // 同步到 profiles 集合
    await setDoc(doc(db, 'profiles', user.uid), {
        display_name: name,
        updated_at: Date.now()
    });

    return user;
}

// 邮箱登录
export async function signIn(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

// 登出
export async function signOut() {
    await firebaseSignOut(auth);
}

// 获取当前用户
export async function getUser() {
    return auth.currentUser;
}

// 监听认证状态变化
export function onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return firebaseOnAuthStateChanged(auth, (user) => {
        callback(user);
    });
}
