import { supabase } from '../lib/supabase';

export const uploadImage = async (file: File): Promise<string | null> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Create a unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        // Path includes user.id to comply with RLS
        const filePath = `${user.id}/${fileName}`;

        // Upload to 'homebox-images' bucket
        const { error: uploadError } = await supabase.storage
            .from('homebox-images')
            .upload(filePath, file, { upsert: true });

        if (uploadError) {
            console.error('Upload Error:', uploadError);
            throw uploadError;
        }

        // Get public URL
        const { data } = supabase.storage
            .from('homebox-images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        return null;
    }
};

export const deleteImage = async (url: string) => {
    try {
        // Extract path from the URL
        // Public URL format: .../storage/v1/object/public/homebox-images/userId/fileName
        const bucketPath = 'homebox-images/';
        const index = url.indexOf(bucketPath);
        if (index === -1) return;

        const path = url.substring(index + bucketPath.length);

        console.log('Attempting to delete image at path:', path);
        const { error } = await supabase.storage
            .from('homebox-images')
            .remove([path]);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting image:', error);
    }
};
