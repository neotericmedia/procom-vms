import { UserGuideFile } from './user-guide-file';

export interface UserGuideHeader {
  UserGuidesHeaderId: number;
  UserGuides: UserGuideFile[];
  UserGuidesHeaderText: string;
  UserGuidesHeaderDescription: string;
  UserGuidesHeaderIcon: string;
}
