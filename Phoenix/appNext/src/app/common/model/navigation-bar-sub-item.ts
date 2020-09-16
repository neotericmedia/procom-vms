export interface NavigationBarSubItem {
  Id: number;
  Name: string;
  Path: string;
  DisplayText: string;
  Icon: string;
  BadgeCount?: number;
  Valid?: boolean;
  IsDefault: boolean;
  IsHidden: boolean;
}
