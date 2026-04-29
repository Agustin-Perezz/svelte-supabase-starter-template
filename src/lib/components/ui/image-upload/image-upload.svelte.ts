export type ImageUploadItem = {
  name: string;
  type: string;
  size: number;
  uploadedAt: number;
  url: Promise<string>;
};
