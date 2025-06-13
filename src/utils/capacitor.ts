import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Share } from '@capacitor/share';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export const isNative = () => Capacitor.isNativePlatform();

export const takePicture = async (): Promise<string | null> => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos
    });
    
    return image.dataUrl || null;
  } catch (error) {
    console.error('Error taking picture:', error);
    return null;
  }
};

export const shareAchievement = async (imageData: string, text: string) => {
  try {
    if (isNative()) {
      await Share.share({
        title: 'Bubu Dudu Puzzle Achievement',
        text: text,
        url: imageData,
        dialogTitle: 'Share your achievement!'
      });
    } else {
      // Fallback for web
      if (navigator.share) {
        await navigator.share({
          title: 'Bubu Dudu Puzzle Achievement',
          text: text
        });
      }
    }
  } catch (error) {
    console.error('Error sharing:', error);
  }
};

export const hapticFeedback = async (type: 'light' | 'medium' | 'heavy' = 'light') => {
  try {
    if (isNative()) {
      const impactStyle = type === 'light' ? ImpactStyle.Light : 
                         type === 'medium' ? ImpactStyle.Medium : ImpactStyle.Heavy;
      await Haptics.impact({ style: impactStyle });
    }
  } catch (error) {
    console.error('Error with haptic feedback:', error);
  }
};