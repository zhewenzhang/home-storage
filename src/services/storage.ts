import { auth, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export const uploadImage = async (file: File): Promise<string | null> => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');

        // 创建唯一文件名
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        // 文件路径：uploads/{userId}/{fileName}
        const filePath = `uploads/${user.uid}/${fileName}`;
        const storageRef = ref(storage, filePath);

        // 上传文件
        const snapshot = await uploadBytes(storageRef, file);
        // 获取公网 URL
        const downloadUrl = await getDownloadURL(snapshot.ref);
        return downloadUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        return null;
    }
};

export const deleteImage = async (url: string) => {
    try {
        // Firebase Storage SDK 允许直接从 full download URL 构建引用进行删除
        const storageRef = ref(storage, url);
        await deleteObject(storageRef);
        console.log('Successfully deleted image from Firebase Storage');
    } catch (error) {
        console.error('Error deleting image:', error);
    }
};
