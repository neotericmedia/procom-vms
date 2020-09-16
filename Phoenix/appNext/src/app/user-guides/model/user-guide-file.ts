import { SafeResourceUrl } from '@angular/platform-browser';

export interface UserGuideFile {
  Description: string;
  Extension: string;
  Id: number;
  Internal: boolean;
  LastModifiedDatetime: Date;
  Organizational: boolean;
  PublicId: string;
  Title: string;
  UploadedByFullName: string;
  UploadedDatetime: Date;
  UserGuideHeaderId: number;
  Worker: boolean;
  link?: SafeResourceUrl;
}
