import { NavigationBarSubItem } from './navigation-bar-sub-item';

// Tab Header Item
export interface NavigationBarItem {
  Id: number;
  Name: string;
  Path: string;
  DisplayText: string;
  Icon?: string; // material icon name, show on mobile mode
  BadgeCount?: number;
  Valid?: boolean;
  SubMenu?: Array<NavigationBarSubItem>;
  IsDefault: boolean;
  IsHidden?: boolean;
}
