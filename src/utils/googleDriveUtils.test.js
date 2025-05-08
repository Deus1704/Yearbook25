import {
  extractGoogleDriveFileId,
  getGoogleDriveDirectUrl,
  isGoogleDriveUrl
} from './googleDriveUtils';

describe('Google Drive Utilities', () => {
  describe('extractGoogleDriveFileId', () => {
    test('should extract file ID from /file/d/ format', () => {
      const url = 'https://drive.google.com/file/d/1FiVd9FkZEA29OT2nlzWbDRImtUuJ_n4l/view?usp=sharing';
      expect(extractGoogleDriveFileId(url)).toBe('1FiVd9FkZEA29OT2nlzWbDRImtUuJ_n4l');
    });

    test('should extract file ID from open?id= format', () => {
      const url = 'https://drive.google.com/open?id=1FiVd9FkZEA29OT2nlzWbDRImtUuJ_n4l';
      expect(extractGoogleDriveFileId(url)).toBe('1FiVd9FkZEA29OT2nlzWbDRImtUuJ_n4l');
    });

    test('should extract file ID from uc?id= format', () => {
      const url = 'https://drive.google.com/uc?id=1FiVd9FkZEA29OT2nlzWbDRImtUuJ_n4l';
      expect(extractGoogleDriveFileId(url)).toBe('1FiVd9FkZEA29OT2nlzWbDRImtUuJ_n4l');
    });

    test('should extract file ID from uc?export=view&id= format', () => {
      const url = 'https://drive.google.com/uc?export=view&id=1FiVd9FkZEA29OT2nlzWbDRImtUuJ_n4l';
      expect(extractGoogleDriveFileId(url)).toBe('1FiVd9FkZEA29OT2nlzWbDRImtUuJ_n4l');
    });

    test('should extract file ID from file?id= format', () => {
      const url = 'https://drive.google.com/file?id=1FiVd9FkZEA29OT2nlzWbDRImtUuJ_n4l';
      expect(extractGoogleDriveFileId(url)).toBe('1FiVd9FkZEA29OT2nlzWbDRImtUuJ_n4l');
    });

    test('should extract file ID from docs.google.com/uc?id= format', () => {
      const url = 'https://docs.google.com/uc?id=1FiVd9FkZEA29OT2nlzWbDRImtUuJ_n4l';
      expect(extractGoogleDriveFileId(url)).toBe('1FiVd9FkZEA29OT2nlzWbDRImtUuJ_n4l');
    });

    test('should return null for non-Google Drive URLs', () => {
      const url = 'https://example.com/image.jpg';
      expect(extractGoogleDriveFileId(url)).toBeNull();
    });

    test('should return null for invalid input', () => {
      expect(extractGoogleDriveFileId(null)).toBeNull();
      expect(extractGoogleDriveFileId(undefined)).toBeNull();
      expect(extractGoogleDriveFileId(123)).toBeNull();
    });
  });

  describe('getGoogleDriveDirectUrl', () => {
    test('should convert /file/d/ format to direct URL', () => {
      const url = 'https://drive.google.com/file/d/1FiVd9FkZEA29OT2nlzWbDRImtUuJ_n4l/view?usp=sharing';
      expect(getGoogleDriveDirectUrl(url)).toBe('https://lh3.googleusercontent.com/d/1FiVd9FkZEA29OT2nlzWbDRImtUuJ_n4l');
    });

    test('should convert open?id= format to direct URL', () => {
      const url = 'https://drive.google.com/open?id=1FiVd9FkZEA29OT2nlzWbDRImtUuJ_n4l';
      expect(getGoogleDriveDirectUrl(url)).toBe('https://lh3.googleusercontent.com/d/1FiVd9FkZEA29OT2nlzWbDRImtUuJ_n4l');
    });

    test('should convert uc?id= format to direct URL', () => {
      const url = 'https://drive.google.com/uc?id=1FiVd9FkZEA29OT2nlzWbDRImtUuJ_n4l';
      expect(getGoogleDriveDirectUrl(url)).toBe('https://lh3.googleusercontent.com/d/1FiVd9FkZEA29OT2nlzWbDRImtUuJ_n4l');
    });

    test('should return original URL for non-Google Drive URLs', () => {
      const url = 'https://example.com/image.jpg';
      expect(getGoogleDriveDirectUrl(url)).toBe(url);
    });

    test('should return original URL for invalid input', () => {
      const url = null;
      expect(getGoogleDriveDirectUrl(url)).toBe(url);
    });
  });

  describe('isGoogleDriveUrl', () => {
    test('should return true for valid Google Drive URLs', () => {
      expect(isGoogleDriveUrl('https://drive.google.com/file/d/1FiVd9FkZEA29OT2nlzWbDRImtUuJ_n4l/view')).toBe(true);
      expect(isGoogleDriveUrl('https://drive.google.com/open?id=1FiVd9FkZEA29OT2nlzWbDRImtUuJ_n4l')).toBe(true);
      expect(isGoogleDriveUrl('https://drive.google.com/uc?id=1FiVd9FkZEA29OT2nlzWbDRImtUuJ_n4l')).toBe(true);
      expect(isGoogleDriveUrl('https://docs.google.com/uc?id=1FiVd9FkZEA29OT2nlzWbDRImtUuJ_n4l')).toBe(true);
    });

    test('should return false for non-Google Drive URLs', () => {
      expect(isGoogleDriveUrl('https://example.com/image.jpg')).toBe(false);
    });

    test('should return false for invalid input', () => {
      expect(isGoogleDriveUrl(null)).toBe(false);
      expect(isGoogleDriveUrl(undefined)).toBe(false);
      expect(isGoogleDriveUrl(123)).toBe(false);
    });
  });
});
