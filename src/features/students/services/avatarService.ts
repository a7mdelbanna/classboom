import { supabase } from '../../../lib/supabase';

export class AvatarService {
  private static readonly BUCKET_NAME = 'avatars';
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  static async uploadAvatar(studentId: string, file: File): Promise<string> {
    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error('File size must be less than 5MB');
    }

    // Validate file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error('File must be JPEG, PNG, or WebP');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${studentId}/avatar-${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload avatar');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(data.path);

    // Update student record with avatar URL
    const { error: updateError } = await supabase
      .from('students')
      .update({ 
        avatar_url: publicUrl,
        avatar_uploaded_at: new Date().toISOString()
      })
      .eq('id', studentId);

    if (updateError) {
      // Try to delete the uploaded file
      await supabase.storage.from(this.BUCKET_NAME).remove([data.path]);
      throw new Error('Failed to update student avatar');
    }

    return publicUrl;
  }

  static async deleteAvatar(studentId: string): Promise<void> {
    // Get current avatar URL
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('avatar_url')
      .eq('id', studentId)
      .single();

    if (fetchError || !student?.avatar_url) {
      throw new Error('Student avatar not found');
    }

    // Extract file path from URL
    const url = new URL(student.avatar_url);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf('avatars') + 1).join('/');

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([filePath]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      throw new Error('Failed to delete avatar file');
    }

    // Update student record
    const { error: updateError } = await supabase
      .from('students')
      .update({ 
        avatar_url: null,
        avatar_uploaded_at: null
      })
      .eq('id', studentId);

    if (updateError) {
      throw new Error('Failed to update student record');
    }
  }

  static async resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, file.type, 0.9);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }
}